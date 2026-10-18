"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Lightbulb, Wand2, RotateCcw, Sparkles, ThumbsUp, ThumbsDown, Gamepad2 } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import Lumi from "@/components/teacher/Lumi";
import SpeechBubble from "@/components/teacher/SpeechBubble";
import { useTutorAvailability, useAskTutor } from "@/components/teacher/useTutor";
import Visual from "@/components/visuals";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Misc";
import { getLesson, getSubject, getCourse } from "@/lib/content";
import { isLessonUnlocked } from "@/lib/engine";
import { shuffle } from "@/lib/grading";
import { Em, Emoji } from "@/components/ui/Emoji";

// Этапы урока: intro → step (объяснение по частям) → check → decide
// «Не понял» → simple (проще, по частям) → example → recheck → decide.

function CheckQuestion({ question, onAnswer }) {
  const order = useMemo(() => shuffle(question.options.map((_, i) => i)), [question]);
  const [picked, setPicked] = useState(null);
  const correct = picked === question.answer;
  return (
    <div>
      <p className="font-display mb-3 text-lg font-bold">{question.prompt}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {order.map((i) => {
          const state = picked === null ? "bg-white hover:border-brand" : i === question.answer ? "border-emerald-400 bg-emerald-50" : i === picked ? "border-rose-300 bg-rose-50" : "opacity-60";
          return (
            <button key={i} disabled={picked !== null} onClick={() => { setPicked(i); onAnswer(i === question.answer); }} className={`rounded-2xl border-2 border-slate-200 p-3 text-left font-bold transition ${state}`}>
              {question.options[i]}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className={`animate-rise mt-3 rounded-2xl p-3 text-sm font-bold ${correct ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
          <Em t={correct ? "✅ Верно! " : "💡 Почти! "} />
          {question.explain}
        </p>
      )}
    </div>
  );
}

function pickRecheck(lesson) {
  const pool = lesson.questions.filter((q) => ["mcq", "definition", "formula", "fill"].includes(q.type));
  return pool[Math.floor(Math.random() * pool.length)] || lesson.check;
}

export default function LessonPage() {
  const { lessonId } = useParams();
  const router = useRouter();
  const { state, dispatch } = useGame();
  const lesson = getLesson(lessonId);
  const aiEnabled = useTutorAvailability();
  const askAi = useAskTutor();

  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState("normal"); // normal | simple | example | summary | ai
  const [exampleIdx, setExampleIdx] = useState(0);
  const [aiText, setAiText] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [reaction, setReaction] = useState(null);
  const [recheck, setRecheck] = useState(null);
  const [round, setRound] = useState(1);

  const unlocked = lesson && isLessonUnlocked(state, lesson.id);
  useEffect(() => {
    if (lesson && unlocked) dispatch("viewLesson", { lessonId: lesson.id }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, unlocked]);

  if (!lesson) {
    return (
      <EmptyState emoji="🧭" title="Урок не найден">
        <Button href="/lessons" className="mt-3">
          Ко всем урокам
        </Button>
      </EmptyState>
    );
  }
  const subject = getSubject(lesson.subjectId);
  const costume = state.profile.equipped.costume;

  if (!unlocked) {
    const prev = getCourse(lesson.subjectId).lessons[lesson.index - 1];
    return (
      <EmptyState emoji="🔒" title="Урок пока закрыт" text={`Сначала пройди урок «${prev.title}» — и этот откроется автоматически.`}>
        <div className="mt-3 flex gap-2">
          <Button href={`/lesson/${prev.id}`}>К предыдущему уроку</Button>
          <Button href={`/subjects/${lesson.subjectId}`} variant="secondary">
            К предмету
          </Button>
        </div>
      </EmptyState>
    );
  }

  const steps = lesson.steps;
  const cur = steps[step];
  const total = steps.length;

  // ---- Что говорит Луми и что на доске ----
  let speech = "";
  let board = null;
  let emotion = speaking ? "talk" : "idle";

  if (phase === "intro") {
    speech = `${lesson.intro}\n\nЦель урока: ${lesson.goal}`;
    emotion = speaking ? "talk" : "happy";
    board = (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <span className="text-7xl"><Em t={lesson.emoji} /></span>
        <p className="font-display text-2xl font-extrabold">{lesson.title}</p>
        <p className="text-slate-500">
          {total} части · ≈ {lesson.minutes} минут · затем мини-игра из 7 вопросов
        </p>
      </div>
    );
  } else if (phase === "step" || phase === "simple") {
    if (mode === "summary") speech = `Давай повторим главное:\n• ${lesson.summary.join("\n• ")}`;
    else if (mode === "example") speech = `Пример из жизни: ${lesson.examples[exampleIdx % lesson.examples.length]}`;
    else if (mode === "ai") speech = aiText;
    else if (mode === "simple" || phase === "simple") speech = cur.simple || cur.text;
    else speech = cur.text;
    if (mode === "example" && !speaking) emotion = "wow";
    board = (
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-brand">
          {phase === "simple" ? "Объясняю проще · " : ""}Часть {step + 1} из {total}
        </p>
        <h2 className="font-display mb-4 text-xl font-bold">{cur.title}</h2>
        {cur.visual ? (
          <Visual key={`${lesson.id}-${step}`} visual={cur.visual} />
        ) : (
          <div className="rounded-2xl bg-linear-to-br from-brand-soft to-white p-5">
            <p className="text-sm font-extrabold text-slate-500">Запиши в тетрадь:</p>
            <p className="mt-1 text-lg font-bold">{cur.simple}</p>
          </div>
        )}
      </div>
    );
  } else if (phase === "example") {
    speech = `Вот другой пример, попроще:\n${lesson.examples[(exampleIdx + 1) % lesson.examples.length]}`;
    emotion = speaking ? "talk" : "wow";
    board = (
      <div className="rounded-2xl bg-amber-50 p-5">
        <p className="text-4xl"><Emoji e="💡" /></p>
        <p className="mt-2 font-bold text-amber-900">{lesson.summary.join(" ")}</p>
      </div>
    );
  } else if (phase === "check" || phase === "recheck") {
    speech = phase === "check" ? "Проверим, как ты понял? Ответь на один вопрос — это не на оценку 😉" : "А теперь ещё один вопрос. Уверен, сейчас получится!";
    emotion = reaction === true ? "happy" : reaction === false ? "encourage" : speaking ? "talk" : "think";
    const q = phase === "check" ? lesson.check : recheck;
    board = <CheckQuestion key={`${phase}-${round}`} question={q} onAnswer={(ok) => setReaction(ok)} />;
  } else if (phase === "decide") {
    speech = round > 1 ? "Ну как, теперь понятнее? Если нет — разберём тему ещё раз!" : "Отлично поработали! Теперь скажи честно: тема понятна?";
    emotion = speaking ? "talk" : "happy";
    board = (
      <div>
        <h2 className="font-display mb-3 text-xl font-bold">Главное по теме</h2>
        <ul className="space-y-2">
          {lesson.summary.map((s, i) => (
            <li key={i} className="flex gap-2 rounded-2xl bg-slate-50 p-3 font-semibold">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-extrabold text-white">{i + 1}</span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (aiBusy) emotion = "think";

  // ---- Действия ----
  const resetMode = () => {
    setMode("normal");
    setAiText("");
  };
  const nextStep = () => {
    resetMode();
    if (step < total - 1) setStep(step + 1);
    else if (phase === "simple") setPhase("example");
    else {
      setReaction(null);
      setPhase("check");
    }
  };
  const prevStep = () => {
    resetMode();
    if (step > 0) setStep(step - 1);
  };
  const explainSimpler = () => setMode(mode === "simple" ? "normal" : "simple");
  const showExample = () => {
    if (mode === "example") setExampleIdx(exampleIdx + 1);
    setMode("example");
  };
  const repeatTopic = () => {
    setPhase("step");
    setStep(0);
    setMode("summary");
  };
  const aiVariant = async (kind) => {
    setAiBusy(true);
    try {
      const text = await askAi({ lessonId: lesson.id, mode: kind, grade: state.profile.grade });
      setAiText(`✨ ${text}`);
      setMode("ai");
    } catch (e) {
      setAiText(`Не получилось спросить AI: ${e.message}`);
      setMode("ai");
    } finally {
      setAiBusy(false);
    }
  };
  const notUnderstood = () => {
    setRound(round + 1);
    setPhase("simple");
    setStep(0);
    resetMode();
  };
  const toRecheck = () => {
    setReaction(null);
    setRecheck(pickRecheck(lesson));
    setPhase("recheck");
  };

  const inExplain = phase === "step" || phase === "simple";
  const progressDots = (
    <div className="flex gap-1.5">
      {steps.map((_, i) => (
        <span key={i} className={`h-2 rounded-full transition-all ${i === step && inExplain ? "w-8 bg-brand" : i < step || (!inExplain && phase !== "intro") ? "w-2 bg-brand/60" : "w-2 bg-slate-200"}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/subjects/${lesson.subjectId}`} className="inline-flex items-center gap-1 text-sm font-extrabold text-slate-500 hover:text-brand">
          <ArrowLeft size={16} /> {subject.title}
        </Link>
        {progressDots}
      </div>
      <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
        <Em t={lesson.emoji} /> {lesson.title}
      </h1>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Учитель */}
        <section className="lg:col-span-2">
          <div className="card relative overflow-hidden bg-linear-to-b from-brand-soft to-white p-5">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.9),transparent_70%)]" />
            <div className="relative flex flex-col items-center">
              <Lumi emotion={emotion} speaking={speaking} costume={costume} size={170} />
              <p className="-mt-1 mb-3 text-xs font-extrabold uppercase tracking-widest text-brand">Луми · AI-учитель</p>
            </div>
            <SpeechBubble key={speech} text={speech} onTyping={setSpeaking}>
              {aiEnabled && inExplain && (mode === "simple" || mode === "example") && (
                <button onClick={() => aiVariant(mode === "simple" ? "simpler" : "example")} disabled={aiBusy} className="inline-flex items-center gap-1 text-sm font-extrabold text-brand-2 hover:underline disabled:opacity-50">
                  <Sparkles size={14} /> {aiBusy ? "Луми думает…" : "Попросить у AI другой вариант"}
                </button>
              )}
            </SpeechBubble>
          </div>

          {(inExplain || phase === "decide") && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={explainSimpler} disabled={!inExplain} className={`flex items-center justify-center gap-2 rounded-2xl p-3 text-sm font-extrabold transition disabled:opacity-40 ${mode === "simple" ? "bg-brand text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-brand"}`}>
                <Wand2 size={18} /> Объясни проще
              </button>
              <button onClick={showExample} disabled={!inExplain} className={`flex items-center justify-center gap-2 rounded-2xl p-3 text-sm font-extrabold transition disabled:opacity-40 ${mode === "example" ? "bg-amber-400 text-amber-950" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-brand"}`}>
                <Lightbulb size={18} /> Покажи пример
              </button>
              <button onClick={repeatTopic} className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-white p-3 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200 transition hover:ring-brand">
                <RotateCcw size={18} /> Повтори тему
              </button>
            </div>
          )}
        </section>

        {/* Доска */}
        <section className="lg:col-span-3">
          <div className="card flex min-h-[380px] flex-col p-5 sm:p-6">
            <div key={`${phase}-${step}`} className="animate-rise flex-1">
              {board}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              {phase === "intro" && (
                <Button onClick={() => setPhase("step")} variant="gradient" size="lg" className="ml-auto">
                  Начать урок <ArrowRight size={20} />
                </Button>
              )}
              {inExplain && (
                <>
                  <Button onClick={prevStep} variant="ghost" disabled={step === 0}>
                    <ArrowLeft size={18} /> Назад
                  </Button>
                  <Button onClick={nextStep} variant="gradient" size="lg">
                    {step < total - 1 ? "Дальше" : phase === "simple" ? "Ещё пример" : "Проверить себя"} <ArrowRight size={20} />
                  </Button>
                </>
              )}
              {phase === "example" && (
                <Button onClick={toRecheck} variant="gradient" size="lg" className="ml-auto">
                  Проверить понимание <ArrowRight size={20} />
                </Button>
              )}
              {(phase === "check" || phase === "recheck") && (
                <Button onClick={() => setPhase("decide")} variant="gradient" size="lg" disabled={reaction === null} className="ml-auto">
                  Продолжить <ArrowRight size={20} />
                </Button>
              )}
            </div>
          </div>

          {phase === "decide" && (
            <div className="animate-rise mt-5 grid gap-3 sm:grid-cols-2">
              <Button onClick={() => router.push(`/lesson/${lesson.id}/game`)} variant="success" size="xl" className="w-full">
                <ThumbsUp size={24} /> Я понял тему!
              </Button>
              <Button onClick={notUnderstood} variant="secondary" size="xl" className="w-full">
                <ThumbsDown size={24} /> Я не понял тему
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-center text-sm font-bold text-slate-500 sm:col-span-2">
                <Gamepad2 size={16} /> Дальше — мини-игра из 7 вопросов. Можно ошибиться не больше 3 раз.
              </p>
            </div>
          )}
        </section>
      </div>

    </div>
  );
}
