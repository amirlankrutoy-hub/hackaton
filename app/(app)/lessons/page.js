"use client";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import SubjectCard from "@/components/game/SubjectCard";
import { PageHeader, EmptyState, FullPageLoader } from "@/components/ui/Misc";
import { SUBJECTS, GRADES, getCourse, getSubject, subjectAvailableForGrade, hasContent } from "@/lib/content";
import { subjectProgress } from "@/lib/stats";
import { isLessonUnlocked } from "@/lib/engine";
import { Em } from "@/components/ui/Emoji";

const STATUS = [
  { id: "all", label: "Все" },
  { id: "continue", label: "Продолжить изучение" },
  { id: "incomplete", label: "Незавершённые" },
  { id: "completed", label: "Завершённые" },
];

function Catalog() {
  const params = useSearchParams();
  const mine = params.get("view") === "mine";
  return <CatalogBody key={String(mine)} mine={mine} />;
}

function CatalogBody({ mine }) {
  const { state } = useGame();
  const [grade, setGrade] = useState(state.profile.grade);
  const [subjectId, setSubjectId] = useState("all");
  const [status, setStatus] = useState(mine ? "continue" : "all");

  const gradeSubjects = useMemo(() => SUBJECTS.filter((s) => grade === 0 || subjectAvailableForGrade(s, grade)), [grade]);

  const subjects = gradeSubjects.filter((s) => {
    if (subjectId !== "all" && s.id !== subjectId) return false;
    const p = subjectProgress(state, s.id);
    if (status === "continue") return p.started && p.done < p.total;
    if (status === "incomplete") return hasContent(s.id) && p.done < p.total;
    if (status === "completed") return hasContent(s.id) && p.done === p.total;
    return true;
  });
  // С контентом — выше, затем остальные предметы класса.
  subjects.sort((a, b) => Number(hasContent(b.id)) - Number(hasContent(a.id)));

  const lessons =
    status === "all"
      ? []
      : subjects.flatMap((s) =>
          (getCourse(s.id)?.lessons || []).filter((l) => {
            const done = state.lessons[l.id]?.completed;
            if (status === "completed") return done;
            if (status === "continue") return !done && (state.lessons[l.id] || isLessonUnlocked(state, l.id)) && subjectProgress(state, s.id).started;
            return !done;
          })
        );

  return (
    <div>
      <PageHeader title={mine ? "Мои предметы" : "Все уроки"} subtitle={mine ? "Предметы, которые ты уже начал изучать" : "Выбери предмет и начни приключение"} emoji={mine ? "📚" : "🎓"} />

      <div className="card mb-6 flex flex-col gap-4 p-4 lg:flex-row lg:items-end">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Класс</span>
          <select value={grade} onChange={(e) => { setGrade(Number(e.target.value)); setSubjectId("all"); }} className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 font-bold outline-none focus:border-brand">
            <option value={0}>Все классы</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g} класс{g === state.profile.grade ? " (мой)" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Предмет</span>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 font-bold outline-none focus:border-brand">
            <option value="all">Все предметы</option>
            {gradeSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <div className="flex-[2]">
          <span className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Статус</span>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {STATUS.map((s) => (
              <button key={s.id} onClick={() => setStatus(s.id)} className={`h-11 shrink-0 rounded-xl px-3 text-sm font-extrabold transition ${status === s.id ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {grade !== 0 && grade !== state.profile.grade && (
        <p className="mb-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800">
          Показаны предметы {grade} класса. Твой класс — {state.profile.grade}-й, его можно изменить в настройках.
        </p>
      )}

      {subjects.length === 0 ? (
        <EmptyState emoji="🔍" title="Ничего не найдено" text={status === "continue" ? "Ты ещё не начал ни одного предмета с такими условиями. Выбери предмет во вкладке «Все»." : "Попробуй изменить фильтры."} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} />
          ))}
        </div>
      )}

      {lessons.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display mb-3 text-lg font-bold">Уроки · {STATUS.find((s) => s.id === status).label.toLowerCase()}</h2>
          <div className="card divide-y divide-slate-100">
            {lessons.map((l) => {
              const done = state.lessons[l.id]?.completed;
              const open = isLessonUnlocked(state, l.id);
              const subject = getSubject(l.subjectId);
              return (
                <Link key={l.id} href={open ? `/lesson/${l.id}` : `/subjects/${l.subjectId}`} className="flex items-center gap-3 p-4 hover:bg-slate-50">
                  <span className="text-2xl"><Em t={l.emoji} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold">{l.title}</p>
                    <p className="text-sm text-slate-500">
                      {subject.title} · {l.grade} класс
                    </p>
                  </div>
                  {done ? <CheckCircle2 className="text-emerald-500" /> : open ? <PlayCircle className="text-brand" /> : <Lock className="text-slate-300" />}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default function LessonsPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Catalog />
    </Suspense>
  );
}
