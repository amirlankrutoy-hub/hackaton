// AI-учитель Луми. Работает, только если на сервере задан ANTHROPIC_API_KEY.
// Без ключа интерфейс использует подготовленные объяснения и честно
// сообщает, что живые ответы AI в демо-режиме недоступны.
import Anthropic from "@anthropic-ai/sdk";
import { json } from "@/lib/supabase/route";
import { getAdminSupabase, getRequestUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import { getLesson, getSubject } from "@/lib/content";

const MODEL = "claude-opus-5-5";
const enabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

// Простое ограничение частоты запросов (на один экземпляр сервера).
const hits = new Map();
function rateLimited(key, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > limit;
}

export async function GET() {
  return json({ enabled: enabled(), model: enabled() ? MODEL : null });
}

const MODES = {
  question: "Ответь на вопрос ученика по теме урока.",
  simpler: "Объясни тему урока ещё проще, другими словами и с новой аналогией из жизни школьника в Узбекистане.",
  example: "Приведи один новый, конкретный пример из повседневной жизни, который иллюстрирует тему урока.",
};

export async function POST(request) {
  if (!enabled()) {
    return json({ error: "AI-учитель не подключён: задайте ANTHROPIC_API_KEY на сервере", code: "AI_DISABLED" }, 503);
  }

  let userKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isSupabaseConfigured) {
    const admin = getAdminSupabase();
    const user = admin && (await getRequestUser(request, admin));
    if (!user) return json({ error: "Требуется вход", code: "UNAUTHORIZED" }, 401);
    userKey = user.id;
  }
  if (rateLimited(userKey)) return json({ error: "Слишком много вопросов подряд. Подожди минутку!", code: "RATE_LIMIT" }, 429);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Некорректный запрос", code: "BAD_REQUEST" }, 400);
  }
  const lesson = getLesson(body?.lessonId);
  const mode = MODES[body?.mode] ? body.mode : "question";
  const question = String(body?.question || "").slice(0, 500).trim();
  const grade = Math.min(11, Math.max(1, Number(body?.grade) || lesson?.grade || 7));
  if (!lesson) return json({ error: "Урок не найден", code: "NOT_FOUND" }, 404);
  if (mode === "question" && !question) return json({ error: "Напиши вопрос", code: "BAD_REQUEST" }, 400);

  const material = lesson.steps.map((s) => `${s.title}: ${s.text}`).join("\n");
  const system = [
    "Ты — Луми, добрый и терпеливый AI-учитель образовательной платформы EduQuest для школьников Узбекистана.",
    `Ученик учится в ${grade} классе. Пиши по-русски, простыми словами, подходящими для этого возраста.`,
    "Отвечай коротко: 3–6 предложений, без заголовков и таблиц. Можно использовать формулы и один пример из жизни.",
    "Говори только о школьной учёбе. Если вопрос не по теме урока, мягко верни ученика к теме.",
    "Не выдумывай факты; если не уверен, так и скажи. Не давай опасных инструкций (например, опытов с веществами дома).",
    `Предмет: ${getSubject(lesson.subjectId)?.title}. Тема урока: «${lesson.title}».`,
    `Материал урока:\n${material}`,
  ].join("\n");

  const history = Array.isArray(body?.history)
    ? body.history
        .slice(-6)
        .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
        .map((m) => ({ role: m.role, content: m.text.slice(0, 1500) }))
    : [];
  while (history.length && history[0].role !== "user") history.shift();
  const task = mode === "question" ? `${MODES.question}\nВопрос: ${question}` : MODES[mode];
  if (history.length && history[history.length - 1].role === "user") history.pop();

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 1200,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system,
      messages: [...history, { role: "user", content: task }],
    });
    if (response.stop_reason === "refusal") {
      return json({ answer: "Давай лучше вернёмся к теме урока! Спроси меня что-нибудь про «" + lesson.title + "»." });
    }
    const answer = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return json({ answer: answer || "Хм, не получилось ответить. Попробуй переформулировать вопрос." });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: "AI-учитель сейчас перегружен, попробуй через минуту", code: "RATE_LIMIT" }, 429);
    if (e instanceof Anthropic.AuthenticationError) return json({ error: "Неверный ключ ANTHROPIC_API_KEY", code: "AI_AUTH" }, 502);
    if (e instanceof Anthropic.APIConnectionError) return json({ error: "Нет связи с AI-сервисом", code: "AI_NETWORK" }, 502);
    console.error("tutor failed", e);
    return json({ error: "AI-учитель временно недоступен", code: "AI_ERROR" }, 502);
  }
}
