"use client";
import { useRef, useState, useEffect } from "react";
import { Send, Sparkles, Info } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Lumi from "./Lumi";
import { useAskTutor, offlineAnswer } from "./useTutor";

export default function TutorChat({ open, onClose, lesson, grade, aiEnabled, costume }) {
  const [messages, setMessages] = useState([{ role: "assistant", text: `Задай любой вопрос по теме «${lesson.title}» — я постараюсь объяснить!` }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const ask = useAskTutor();
  const end = useRef(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const send = async (e) => {
    e?.preventDefault();
    const question = input.trim();
    if (!question || busy) return;
    const history = messages.slice(1);
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setBusy(true);
    let answer;
    if (aiEnabled) {
      try {
        answer = await ask({ lessonId: lesson.id, mode: "question", question, grade, history });
      } catch (err) {
        answer = `${err.message}. ${offlineAnswer(lesson, question) || "Попробуй ещё раз чуть позже."}`;
      }
    } else {
      answer =
        offlineAnswer(lesson, question) ||
        `В демо-режиме я отвечаю только на частые вопросы по этой теме. Вспомни главное:\n• ${lesson.summary.join("\n• ")}\n\nПопробуй спросить по-другому или нажми «Объясни проще».`;
    }
    setMessages((m) => [...m, { role: "assistant", text: answer }]);
    setBusy(false);
  };

  const suggestions = lesson.faq?.map((f) => f.keys[0]) || [];

  return (
    <Modal open={open} onClose={onClose} title="Вопрос учителю" className="sm:max-w-xl">
      <div className={`mb-3 flex items-start gap-2 rounded-2xl p-3 text-xs font-bold ${aiEnabled ? "bg-violet-50 text-violet-700" : "bg-amber-50 text-amber-800"}`}>
        {aiEnabled ? <Sparkles size={16} className="shrink-0" /> : <Info size={16} className="shrink-0" />}
        {aiEnabled ? "Отвечает AI-учитель (Claude). Проверяй важные факты по учебнику." : "AI не подключён: Луми отвечает подготовленными ответами на частые вопросы. Для живых ответов нужен ANTHROPIC_API_KEY на сервере."}
      </div>
      <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && <Lumi emotion="happy" costume={costume} size={36} className="shrink-0" />}
            <p className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm font-semibold ${m.role === "user" ? "bg-brand text-white" : "bg-slate-100 text-slate-700"}`}>{m.text}</p>
          </div>
        ))}
        {busy && (
          <div className="flex items-end gap-2">
            <Lumi emotion="think" costume={costume} size={36} />
            <p className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-400">Луми думает…</p>
          </div>
        )}
        <div ref={end} />
      </div>
      {!aiEnabled && suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {lesson.faq.map((f) => (
            <button key={f.keys[0]} onClick={() => setInput(`Расскажи про: ${f.keys[0]}`)} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-brand-soft hover:text-brand">
              {f.keys[0]}?
            </button>
          ))}
        </div>
      )}
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder="Например: зачем нужен катализатор?" className="h-12 flex-1 rounded-2xl border-2 border-slate-200 px-4 font-semibold outline-none focus:border-brand" aria-label="Твой вопрос" />
        <button type="submit" disabled={busy || !input.trim()} className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-white disabled:opacity-50" aria-label="Отправить">
          <Send size={20} />
        </button>
      </form>
    </Modal>
  );
}
