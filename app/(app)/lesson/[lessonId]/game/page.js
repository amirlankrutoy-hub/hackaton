"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { X, Check, Flame, RotateCcw, ArrowRight, BookOpen, Trophy, AlertTriangle } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import QuestionView, { toAnswer } from "@/components/game/Questions";
import { Confetti } from "@/components/game/Celebration";
import Lumi from "@/components/teacher/Lumi";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import XpAmount from "@/components/ui/XpBadge";
import { LumosAmount } from "@/components/ui/LumosIcon";
import { EmptyState } from "@/components/ui/Misc";
import { getLesson, getSubject } from "@/lib/content";
import { gradeAnswer, correctAnswerText, pickGameQuestions } from "@/lib/grading";
import { isLessonUnlocked } from "@/lib/engine";
import { GAME_QUESTIONS, GAME_MAX_MISTAKES, gamePoints } from "@/lib/economy";
import { ACHIEVEMENT_MAP } from "@/lib/achievements";
import { Em, Emoji } from "@/components/ui/Emoji";

const PRAISE = ["Отлично!", "Верно!", "Супер!", "Так держать!", "Великолепно!", "Правильно!"];

export default function GamePage() {
  const { lessonId } = useParams();
  const { state, dispatch } = useGame();
  const lesson = getLesson(lessonId);

  const [questions, setQuestions] = useState(() => (lesson ? pickGameQuestions(lessonId) : []));
  const [attempt, setAttempt] = useState(1);
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [outcome, setOutcome] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!lesson) return <EmptyState emoji="🧭" title="Урок не найден" />;
  if (!isLessonUnlocked(state, lesson.id)) {
    return (
      <EmptyState emoji="🔒" title="Мини-игра закрыта" text="Сначала пройди предыдущий урок.">
        <Button href={`/subjects/${lesson.subjectId}`} className="mt-3">
          К предмету
        </Button>
      </EmptyState>
    );
  }

  const q = questions[idx];
  const checked = results.length > idx;
  const correctCount = results.filter(Boolean).length;
  const mistakes = results.length - correctCount;
  const points = gamePoints(correctCount, maxCombo);

  const check = () => {
    const answer = toAnswer(q, value);
    const ok = gradeAnswer(q, answer);
    setAnswers([...answers, answer]);
    setResults([...results, ok]);
    const c = ok ? combo + 1 : 0;
    setCombo(c);
    setMaxCombo(Math.max(maxCombo, c));
  };

  const finish = async (finalAnswers) => {
    setSaving(true);
    setError("");
    try {
      const res = await dispatch("completeGame", { lessonId: lesson.id, questionIds: questions.map((x) => x.id), answers: finalAnswers });
      setOutcome(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (idx < GAME_QUESTIONS - 1) {
      setIdx(idx + 1);
      setValue(null);
    } else finish(answers);
  };

  const restart = () => {
    setQuestions(pickGameQuestions(lesson.id, questions.map((x) => x.id)));
    setAttempt(attempt + 1);
    setIdx(0);
    setValue(null);
    setAnswers([]);
    setResults([]);
    setCombo(0);
    setMaxCombo(0);
    setOutcome(null);
  };

  // ---------- Экран результата ----------
  if (outcome) {
    const subject = getSubject(lesson.subjectId);
    if (!outcome.passed) {
      return (
        <div className="mx-auto max-w-xl">
          <div className="card animate-pop p-7 text-center">
            <Lumi emotion="encourage" costume={state.profile.equipped.costume} size={150} className="mx-auto" />
            <p className="font-display mt-2 text-2xl font-extrabold">Похоже, вы пока не до конца поняли эту тему. Давайте попробуем ещё раз!</p>
            <p className="mt-2 text-slate-500">
              Правильных ответов: <b>{outcome.correct} из {outcome.total}</b> · ошибок: <b>{outcome.mistakes}</b>. Чтобы пройти, нужно ошибиться не больше {GAME_MAX_MISTAKES} раз.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button onClick={restart} variant="gradient" size="lg">
                <RotateCcw size={20} /> Повторить урок
              </Button>
              <Button href={`/lesson/${lesson.id}`} variant="secondary" size="lg">
                <BookOpen size={20} /> К объяснению
              </Button>
            </div>
            <p className="mt-4 text-xs font-bold text-slate-400">При повторе будут другие вопросы и новый порядок заданий.</p>
          </div>
        </div>
      );
    }
    const nextLesson = outcome.nextLessonId && getLesson(outcome.nextLessonId);
    const hasRewards = outcome.totals.xp > 0 || outcome.totals.lumos > 0;
    return (
      <div className="mx-auto max-w-xl">
        <Confetti />
        <div className="card animate-pop overflow-hidden text-center">
          <div className="bg-brand-gradient px-6 pb-6 pt-4 text-white">
            <Lumi emotion="celebrate" costume={state.profile.equipped.costume} size={150} className="mx-auto" />
            <p className="font-display text-3xl font-extrabold"><Em t={outcome.perfect ? "Идеально! 🌟" : "Победа! 🎉"} /></p>
            <p className="text-white/85">Тема «{lesson.title}» засчитана</p>
          </div>
          <div className="space-y-5 p-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3">
                <p className="font-display text-2xl font-extrabold text-emerald-600">
                  {outcome.correct}/{outcome.total}
                </p>
                <p className="text-xs font-bold text-slate-500">результат</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3">
                <XpAmount value={`+${outcome.totals.xp}`} className="text-xl text-amber-600" />
                <p className="text-xs font-bold text-slate-500">опыт</p>
              </div>
              <div className="rounded-2xl bg-violet-50 p-3">
                <LumosAmount value={`+${outcome.totals.lumos}`} className="text-xl text-violet-600" />
                <p className="text-xs font-bold text-slate-500">Lumos</p>
              </div>
            </div>
            {hasRewards ? (
              <ul className="space-y-1 text-left text-sm">
                {outcome.gains.map((g) => (
                  <li key={g.key} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 font-bold">
                    <span className="truncate">{g.label}</span>
                    <span className="shrink-0 text-slate-500">
                      {g.xp ? `+${g.xp} XP ` : ""}
                      {g.lumos ? `+${g.lumos} Lumos` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-500">Награда за этот урок уже получена раньше — повторное прохождение помогает закрепить знания и засчитывается в ежедневные задания.</p>
            )}
            {outcome.chapterCompleted && <p className="rounded-2xl bg-amber-100 p-3 font-extrabold text-amber-800"><Emoji e="🏆" /> Глава «{outcome.chapterCompleted}» завершена!</p>}
            {outcome.unlocked.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {outcome.unlocked.map((id) => (
                  <span key={id} className="rounded-full bg-amber-100 px-3 py-1 text-sm font-extrabold text-amber-800">
                    <Em t={ACHIEVEMENT_MAP[id].icon} /> {ACHIEVEMENT_MAP[id].title}
                  </span>
                ))}
              </div>
            )}
            <div className="text-left">
              <div className="mb-1 flex justify-between text-sm font-extrabold">
                <span>Прогресс: {subject.title}</span>
                <span>{outcome.subjectProgress.percent}%</span>
              </div>
              <ProgressBar value={outcome.subjectProgress.percent / 100} label="Прогресс предмета" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {nextLesson ? (
                <Button href={`/lesson/${nextLesson.id}`} variant="gradient" size="lg" className="sm:col-span-2">
                  Следующий урок <ArrowRight size={20} />
                </Button>
              ) : outcome.examUnlocked ? (
                <Button href={`/exam/${lesson.subjectId}`} variant="warning" size="lg" className="sm:col-span-2">
                  <Trophy size={20} /> К итоговой контрольной
                </Button>
              ) : null}
              <Button href={`/subjects/${lesson.subjectId}`} variant="secondary">
                К предмету
              </Button>
              <Button onClick={restart} variant="ghost">
                <RotateCcw size={18} /> Сыграть ещё раз
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Игра ----------
  const ok = checked && results[idx];
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center gap-3">
        <Link href={`/lesson/${lesson.id}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Выйти из мини-игры">
          <X />
        </Link>
        <ProgressBar value={(idx + (checked ? 1 : 0)) / GAME_QUESTIONS} height="h-4" label="Прогресс мини-игры" />
        {combo >= 2 && (
          <span className="animate-pop inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-sm font-extrabold text-orange-600">
            <Flame size={16} fill="currentColor" /> ×{combo}
          </span>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm font-extrabold">
        <span className="rounded-full bg-white px-3 py-1 shadow-sm">
          Вопрос {idx + 1} из {GAME_QUESTIONS}
          {attempt > 1 && <span className="text-slate-400"> · попытка {attempt}</span>}
        </span>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">
            <Check size={16} /> {correctCount}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${mistakes > GAME_MAX_MISTAKES ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600"}`} title={`Допустимо ошибок: ${GAME_MAX_MISTAKES}`}>
            <X size={16} /> {mistakes}/{GAME_MAX_MISTAKES}
          </span>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-600">{points} очков</span>
        </div>
      </div>

      <div key={`${attempt}-${idx}`} className="card animate-rise p-5 sm:p-7">
        <QuestionView question={q} value={value} onChange={setValue} result={checked ? { correct: ok } : null} onSubmit={check} />
      </div>

      {mistakes > GAME_MAX_MISTAKES && !checked && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-sm font-bold text-rose-600">
          <AlertTriangle size={16} /> Ошибок уже больше трёх — эту попытку не засчитают, но доиграй, чтобы потренироваться.
        </p>
      )}

      {checked && (
        <div className={`animate-rise fixed inset-x-0 bottom-0 z-40 border-t-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:left-64 ${ok ? "border-emerald-400 bg-emerald-50" : "border-rose-400 bg-rose-50"}`}>
          <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-start gap-3">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-white ${ok ? "bg-emerald-500" : "bg-rose-500"}`}>{ok ? <Check size={26} strokeWidth={3} /> : <X size={26} strokeWidth={3} />}</span>
              <div>
                <p className={`font-display text-lg font-extrabold ${ok ? "text-emerald-700" : "text-rose-700"}`}>{ok ? `${PRAISE[idx % PRAISE.length]} +100 очков` : "Неверно"}</p>
                {!ok && (
                  <p className="text-sm font-bold text-rose-800">
                    Правильный ответ: <span className="font-extrabold">{correctAnswerText(q)}</span>
                  </p>
                )}
                <p className={`text-sm ${ok ? "text-emerald-800" : "text-rose-800"}`}>{q.explain}</p>
              </div>
            </div>
            <Button onClick={next} variant={ok ? "success" : "danger"} size="lg" loading={saving} className="shrink-0">
              {idx < GAME_QUESTIONS - 1 ? "Далее" : "Завершить"} <ArrowRight size={20} />
            </Button>
          </div>
          {error && (
            <p className="mx-auto mt-2 max-w-3xl text-sm font-bold text-rose-700">
              {error}{" "}
              <button onClick={() => finish(answers)} className="underline">
                Повторить отправку
              </button>
            </p>
          )}
        </div>
      )}
      {checked && <div className="h-44" />}
    </div>
  );
}
