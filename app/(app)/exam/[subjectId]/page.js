"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Timer, Lock, Check, X, RotateCcw, Award, FileText, BookOpen } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import QuestionView, { toAnswer, isComplete } from "@/components/game/Questions";
import { Confetti } from "@/components/game/Celebration";
import Lumi from "@/components/teacher/Lumi";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import XpAmount from "@/components/ui/XpBadge";
import { LumosAmount } from "@/components/ui/LumosIcon";
import { EmptyState } from "@/components/ui/Misc";
import { getSubject, getCourse, getLesson, examConfig, getQuestion } from "@/lib/content";
import { pickExamQuestions, correctAnswerText, givenAnswerText } from "@/lib/grading";
import { isExamUnlocked } from "@/lib/engine";
import { EXAM_PASS_PERCENT, REWARDS } from "@/lib/economy";
import { Emoji, Em } from "@/components/ui/Emoji";

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ExamPage() {
  const { subjectId } = useParams();
  const { state, dispatch } = useGame();
  const subject = getSubject(subjectId);
  const course = getCourse(subjectId);
  const cfg = course ? examConfig(subjectId) : null;

  const [phase, setPhase] = useState("intro");
  const [timed, setTimed] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [values, setValues] = useState({});
  const [left, setLeft] = useState(0);
  const [outcome, setOutcome] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submitted = useRef(false);

  const submit = async () => {
    if (submitted.current) return;
    submitted.current = true;
    setSaving(true);
    setError("");
    try {
      const answers = questions.map((q, i) => (values[i] === undefined ? null : toAnswer(q, values[i])));
      const res = await dispatch("submitExam", { subjectId, questionIds: questions.map((q) => q.id), answers });
      setOutcome({ ...res, answers });
      setPhase("result");
    } catch (e) {
      setError(e.message);
      submitted.current = false;
    } finally {
      setSaving(false);
    }
  };
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  useEffect(() => {
    if (phase !== "run" || !timed) return;
    if (left <= 0) {
      submitRef.current();
      return;
    }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timed, left]);

  if (!subject || !course) {
    return (
      <EmptyState emoji="📝" title="Контрольная недоступна" text="Для этого предмета итоговое испытание ещё не подготовлено.">
        <Button href="/lessons" className="mt-3">
          К предметам
        </Button>
      </EmptyState>
    );
  }

  const exam = state.exams[subjectId];
  if (!isExamUnlocked(state, subjectId)) {
    const rest = course.lessons.filter((l) => !state.lessons[l.id]?.completed);
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-7 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Lock size={30} />
          </span>
          <h1 className="font-display mt-3 text-2xl font-extrabold">Контрольная пока закрыта</h1>
          <p className="mt-1 text-slate-500">Итоговое испытание по предмету «{subject.title}» откроется после всех уроков. Осталось: {rest.length}.</p>
          <ul className="mt-4 space-y-2 text-left">
            {rest.map((l) => (
              <li key={l.id} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-bold">
                <span><Em t={l.emoji} /></span> {l.title}
              </li>
            ))}
          </ul>
          <Button href={`/subjects/${subjectId}`} className="mt-5">
            К урокам предмета
          </Button>
        </div>
      </div>
    );
  }

  const start = () => {
    submitted.current = false;
    setQuestions(pickExamQuestions(subjectId));
    setValues({});
    setIdx(0);
    setLeft(cfg.total * cfg.secondsPerQuestion);
    setOutcome(null);
    setError("");
    setPhase("run");
  };

  // ---------- Вступление ----------
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <Link href={`/subjects/${subjectId}`} className="inline-flex items-center gap-1 text-sm font-extrabold text-slate-500 hover:text-brand">
          <ArrowLeft size={16} /> {subject.title}
        </Link>
        <div className="card overflow-hidden">
          <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${subject.gradient[0]}, ${subject.gradient[1]})` }}>
            <p className="text-sm font-extrabold uppercase tracking-widest text-white/80">Итоговая контрольная</p>
            <h1 className="font-display text-3xl font-extrabold">
              <Em t={subject.emoji} /> {subject.title}
            </h1>
          </div>
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="font-display text-2xl font-extrabold">{cfg.total}</p>
                <p className="text-xs font-bold text-slate-500">вопросов по всем темам</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="font-display text-2xl font-extrabold">{EXAM_PASS_PERCENT}%</p>
                <p className="text-xs font-bold text-slate-500">проходной порог</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="font-display text-2xl font-extrabold">{exam ? `${exam.bestPercent}%` : "—"}</p>
                <p className="text-xs font-bold text-slate-500">лучший результат</p>
              </div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4 text-sm">
              <p className="font-extrabold text-amber-800">За успешную сдачу:</p>
              <p className="mt-1 flex flex-wrap items-center gap-3 font-bold text-amber-900">
                <XpAmount value={`+${REWARDS.examPass.xp}`} /> <LumosAmount value={`+${REWARDS.examPass.lumos}`} /> медаль «Мастер предмета» и сертификат
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} className="h-5 w-5 accent-brand" />
              <span>
                <span className="flex items-center gap-1.5 font-extrabold">
                  <Timer size={18} /> Режим с таймером: {Math.round((cfg.total * cfg.secondsPerQuestion) / 60)} минут
                </span>
                <span className="text-sm text-slate-500">Когда время выйдет, работа отправится автоматически. Без таймера можно думать сколько угодно.</span>
              </span>
            </label>
            <div className="flex flex-wrap gap-3">
              <Button onClick={start} variant="gradient" size="lg" className="flex-1">
                {exam ? "Пройти ещё раз" : "Начать контрольную"} <ArrowRight size={20} />
              </Button>
              {exam?.passed && (
                <Button href={`/certificate/${subjectId}`} variant="secondary" size="lg">
                  <Award size={20} /> Сертификат
                </Button>
              )}
            </div>
            {exam?.passed && <p className="text-xs font-bold text-slate-400">Награды за контрольную уже получены — повторная сдача не даёт XP, но улучшает лучший результат.</p>}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Результат ----------
  if (phase === "result" && outcome) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        {outcome.passed && <Confetti count={40} />}
        <div className="card animate-pop p-7 text-center">
          <Lumi emotion={outcome.passed ? "celebrate" : "encourage"} costume={state.profile.equipped.costume} size={140} className="mx-auto" />
          <p className={`font-display text-6xl font-extrabold ${outcome.passed ? "text-brand-gradient" : "text-slate-700"}`}>{outcome.percent}%</p>
          <p className="font-bold text-slate-500">
            Правильно {outcome.correct} из {outcome.total} · порог {outcome.threshold}%
          </p>
          {outcome.passed ? (
            <>
              <p className="font-display mt-3 text-2xl font-extrabold">Поздравляем! Курс «{subject.title}» пройден! <Emoji e="🏅" /></p>
              {outcome.totals.xp > 0 || outcome.totals.lumos > 0 ? (
                <div className="mt-3 flex justify-center gap-4 text-lg">
                  <XpAmount value={`+${outcome.totals.xp}`} className="text-amber-600" />
                  <LumosAmount value={`+${outcome.totals.lumos}`} className="text-violet-600" />
                </div>
              ) : (
                <p className="mt-2 text-sm font-bold text-slate-500">Награды за этот курс уже были получены раньше.</p>
              )}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button href={`/certificate/${subjectId}`} variant="warning" size="lg">
                  <FileText size={20} /> Открыть сертификат
                </Button>
                <Button href="/achievements" variant="secondary" size="lg">
                  <Award size={20} /> Мои медали
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="font-display mt-3 text-xl font-extrabold">Почти получилось! Нужно набрать {outcome.threshold}% или больше.</p>
              <p className="mt-1 text-slate-500">Повтори темы ниже, а затем попробуй снова — вопросы будут другими.</p>
              <div className="mt-4 space-y-2 text-left">
                {outcome.weakLessons.map(({ lessonId, count }) => {
                  const l = getLesson(lessonId);
                  return (
                    <Link key={lessonId} href={`/lesson/${lessonId}`} className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 font-bold transition hover:bg-amber-100">
                      <span className="text-xl"><Em t={l.emoji} /></span>
                      <span className="flex-1">{l.title}</span>
                      <span className="text-sm text-amber-700">ошибок: {count}</span>
                      <BookOpen size={18} className="text-amber-600" />
                    </Link>
                  );
                })}
              </div>
              <Button onClick={start} variant="gradient" size="lg" className="mt-5">
                <RotateCcw size={20} /> Новая попытка
              </Button>
            </>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-display mb-3 text-lg font-bold">Подробный разбор</h2>
          <ol className="space-y-2">
            {outcome.details.map((d, i) => {
              const q = getQuestion(d.id);
              return (
                <li key={d.id} className={`rounded-2xl p-3 ${d.correct ? "bg-emerald-50" : "bg-rose-50"}`}>
                  <div className="flex gap-2">
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-white ${d.correct ? "bg-emerald-500" : "bg-rose-500"}`}>{d.correct ? <Check size={14} /> : <X size={14} />}</span>
                    <div className="min-w-0 text-sm">
                      <p className="font-extrabold">
                        {i + 1}. {q.type === "definition" ? `${q.prompt}: «${q.term}»` : q.prompt.replace("___", "…")}
                      </p>
                      {!d.correct && (
                        <>
                          <p className="text-rose-700">Твой ответ: {givenAnswerText(q, outcome.answers[i])}</p>
                          <p className="font-bold text-emerald-700">Правильно: {correctAnswerText(q)}</p>
                        </>
                      )}
                      <p className="text-slate-500">{q.explain}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    );
  }

  // ---------- Прохождение ----------
  const q = questions[idx];
  const answered = Object.keys(values).filter((k) => isComplete(questions[k], values[k])).length;
  const last = idx === questions.length - 1;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center gap-3">
        <ProgressBar value={answered / questions.length} height="h-4" label="Отвечено вопросов" />
        {timed && (
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 font-display font-bold tabular-nums ${left < 60 ? "animate-pulse bg-rose-500 text-white" : "bg-white shadow-sm"}`}>
            <Timer size={16} /> {fmt(left)}
          </span>
        )}
      </div>
      <div className="mb-3 flex items-center justify-between text-sm font-extrabold">
        <span className="rounded-full bg-white px-3 py-1 shadow-sm">
          Вопрос {idx + 1} из {questions.length}
        </span>
        <span className="text-slate-500">Отвечено: {answered}</span>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {questions.map((x, i) => (
          <button key={x.id} onClick={() => setIdx(i)} className={`h-8 w-8 rounded-lg text-xs font-extrabold transition ${i === idx ? "bg-brand text-white" : isComplete(x, values[i]) ? "bg-brand-tint text-brand" : "bg-white text-slate-400 ring-1 ring-slate-200"}`} aria-label={`Вопрос ${i + 1}`}>
            {i + 1}
          </button>
        ))}
      </div>
      <div key={idx} className="card animate-rise p-5 sm:p-7">
        <QuestionView question={q} value={values[idx] ?? null} onChange={(v) => setValues({ ...values, [idx]: v })} result={null} />
      </div>
      {error && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-600">{error}</p>}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Button onClick={() => setIdx(idx - 1)} variant="ghost" disabled={idx === 0}>
          <ArrowLeft size={18} /> Назад
        </Button>
        {last ? (
          <Button onClick={submit} variant="success" size="lg" loading={saving}>
            Сдать работу ({answered}/{questions.length}) <Check size={20} />
          </Button>
        ) : (
          <Button onClick={() => setIdx(idx + 1)} variant="gradient" size="lg">
            {isComplete(q, values[idx]) ? "Далее" : "Пропустить"} <ArrowRight size={20} />
          </Button>
        )}
      </div>
      {!last && answered === questions.length && (
        <div className="mt-3 text-right">
          <Button onClick={submit} variant="success" loading={saving}>
            Все ответы готовы — сдать работу
          </Button>
        </div>
      )}
    </div>
  );
}
