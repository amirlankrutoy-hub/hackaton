"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Info, Briefcase, Sparkles, BookOpen } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import Lumi from "@/components/teacher/Lumi";
import { PageHeader } from "@/components/ui/Misc";
import { CAREER_QUESTIONS, DIRECTIONS } from "@/lib/career";
import { getSubject, getLesson } from "@/lib/content";
import { formatDate } from "@/lib/time";
import { Em } from "@/components/ui/Emoji";

function DirectionCard({ id, percent, rank }) {
  const d = DIRECTIONS[id];
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-4 p-5" style={{ background: `linear-gradient(135deg, ${d.color}18, ${d.color}05)` }}>
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl text-white shadow-lg" style={{ background: d.color }}>
          <Em t={d.emoji} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: d.color }}>
            {rank === 0 ? "Лучшее совпадение" : `Вариант ${rank + 1}`} · {percent}%
          </p>
          <h3 className="font-display text-lg font-bold">{d.title}</h3>
          <p className="text-sm text-slate-600">{d.description}</p>
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-400">Полезные предметы</p>
          <div className="flex flex-wrap gap-1.5">
            {d.subjects.map((s) => {
              const subj = getSubject(s);
              return subj ? (
                <Link key={s} href={`/subjects/${s}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold hover:bg-brand-soft hover:text-brand">
                  <Em t={subj.emoji} /> {subj.title}
                </Link>
              ) : null;
            })}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-400">Навыки</p>
          <ul className="space-y-0.5 text-sm font-semibold text-slate-600">
            {d.skills.map((s) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-slate-400">
            <Briefcase size={13} /> Примеры профессий
          </p>
          <p className="text-sm font-semibold text-slate-600">{d.professions.join(", ")}</p>
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-slate-400">
            <BookOpen size={13} /> Попробуй уроки
          </p>
          <div className="space-y-1">
            {d.lessons.map((lid) => {
              const l = getLesson(lid);
              return l ? (
                <Link key={lid} href={`/lesson/${lid}`} className="block truncate text-sm font-bold text-brand hover:underline">
                  <Em t={l.emoji} /> {l.title}
                </Link>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CareerPage() {
  const { state, dispatch } = useGame();
  const toast = useToast();
  const saved = state.career;
  const [phase, setPhase] = useState(saved ? "result" : "intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [busy, setBusy] = useState(false);

  const choose = async (opt) => {
    const next = [...answers.slice(0, idx), opt];
    setAnswers(next);
    if (idx < CAREER_QUESTIONS.length - 1) {
      setIdx(idx + 1);
      return;
    }
    setBusy(true);
    try {
      await dispatch("saveCareer", { answers: next });
      setPhase("result");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };
  const restart = () => {
    setAnswers([]);
    setIdx(0);
    setPhase("quiz");
  };

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Кем стать?" subtitle="Тест интересов из 10 вопросов" emoji="🧭" />
        <div className="card flex flex-col items-center p-8 text-center">
          <Lumi emotion="wow" costume={state.profile.equipped.costume} size={160} />
          <h2 className="font-display mt-2 text-2xl font-extrabold">Давай узнаем, что тебе интересно!</h2>
          <p className="mt-2 max-w-md text-slate-600">Отвечай честно — здесь нет правильных и неправильных ответов. В конце покажем направления, которые стоит изучить подробнее.</p>
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-sky-50 p-3 text-left text-sm font-bold text-sky-800">
            <Info size={18} className="mt-0.5 shrink-0" /> Результат — подсказка для размышлений, а не решение о твоём будущем. Интересы меняются, и ты можешь пройти тест снова в любой момент.
          </p>
          <Button onClick={restart} variant="gradient" size="lg" className="mt-6">
            Начать тест <ArrowRight size={20} />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    const q = CAREER_QUESTIONS[idx];
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center gap-3">
          <button onClick={() => (idx ? setIdx(idx - 1) : setPhase(saved ? "result" : "intro"))} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Назад">
            <ArrowLeft />
          </button>
          <ProgressBar value={idx / CAREER_QUESTIONS.length} height="h-4" label="Прогресс теста" />
          <span className="shrink-0 text-sm font-extrabold text-slate-500">
            {idx + 1}/{CAREER_QUESTIONS.length}
          </span>
        </div>
        <div key={idx} className="card animate-rise p-6 sm:p-8">
          <h2 className="font-display mb-5 text-2xl font-bold">{q.text}</h2>
          <div className="space-y-2.5">
            {q.options.map((o, i) => (
              <button key={i} disabled={busy} onClick={() => choose(i)} className={`w-full rounded-2xl border-2 p-4 text-left font-bold transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft ${answers[idx] === i ? "border-brand bg-brand-soft" : "border-slate-200 bg-white"}`}>
                {o.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const ranking = state.career?.ranking || [];
  const top = ranking.slice(0, 3);
  return (
    <div>
      <PageHeader title="Кем стать?" subtitle={state.career ? `Результат от ${formatDate(state.career.at)}` : ""} emoji="🧭">
        <Button onClick={restart} variant="secondary">
          <RotateCcw size={18} /> Пройти заново
        </Button>
      </PageHeader>
      <p className="mb-5 flex items-start gap-2 rounded-2xl bg-sky-50 p-4 text-sm font-bold text-sky-800">
        <Info size={18} className="mt-0.5 shrink-0" /> Это ориентировочные рекомендации на основе твоих ответов. Попробуй уроки по разным направлениям — так ты лучше поймёшь, что тебе по-настоящему нравится.
      </p>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {top.map((r, i) => (
            <DirectionCard key={r.id} id={r.id} percent={r.percent} rank={i} />
          ))}
        </div>
        <aside className="card h-fit p-5">
          <h3 className="font-display mb-3 flex items-center gap-2 font-bold">
            <Sparkles size={18} className="text-brand" /> Все направления
          </h3>
          <div className="space-y-3">
            {ranking.map((r) => (
              <div key={r.id}>
                <div className="mb-1 flex justify-between text-sm font-bold">
                  <span>
                    <Em t={DIRECTIONS[r.id].emoji} /> {DIRECTIONS[r.id].title}
                  </span>
                  <span className="text-slate-500">{r.percent}%</span>
                </div>
                <ProgressBar value={r.percent / 100} height="h-2" label={DIRECTIONS[r.id].title} />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
