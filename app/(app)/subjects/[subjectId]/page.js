"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Lock, Play, Trophy, Clock, Construction } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/Misc";
import XpAmount from "@/components/ui/XpBadge";
import { LumosAmount } from "@/components/ui/LumosIcon";
import { getSubject, getCourse, getLesson, contentGrades, examConfig } from "@/lib/content";
import { subjectProgress, knowledgeLevel } from "@/lib/stats";
import { isLessonUnlocked, isExamUnlocked } from "@/lib/engine";
import { nextOpenLesson } from "@/lib/recommend";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { REWARDS } from "@/lib/economy";
import { Em, Emoji } from "@/components/ui/Emoji";

function earnedFor(state, subjectId, course) {
  const lessonIds = new Set(course.lessons.map((l) => l.id));
  const chapterIds = new Set(course.chapters.map((c) => c.id));
  const belongs = (key) => {
    const [kind, id] = key.split(":");
    if (kind === "lesson") return lessonIds.has(id);
    if (kind === "chapter") return chapterIds.has(id);
    if (kind === "exam") return id === subjectId;
    return false;
  };
  const xp = state.xpEvents.filter((e) => belongs(e.key)).reduce((s, e) => s + e.amount, 0);
  const lumos = state.lumosTx.filter((e) => e.amount > 0 && belongs(e.key)).reduce((s, e) => s + e.amount, 0);
  return { xp, lumos };
}

export default function SubjectPage() {
  const { subjectId } = useParams();
  const { state } = useGame();
  const toast = useToast();
  const subject = getSubject(subjectId);
  if (!subject) {
    return (
      <EmptyState emoji="🧭" title="Предмет не найден" text="Возможно, ссылка устарела.">
        <Button href="/lessons" className="mt-3">
          Ко всем предметам
        </Button>
      </EmptyState>
    );
  }
  const course = getCourse(subjectId);
  const progress = subjectProgress(state, subjectId);
  const level = knowledgeLevel(state, subjectId);
  const next = course ? nextOpenLesson(state, subjectId) : null;
  const examOpen = course && isExamUnlocked(state, subjectId);
  const exam = state.exams[subjectId];
  const grades = course ? contentGrades(subjectId) : [];
  const earned = course ? earnedFor(state, subjectId, course) : { xp: 0, lumos: 0 };
  const relatedAch = ACHIEVEMENTS.filter((a) => a.subjectId === subjectId || (subjectId === "chemistry" && a.id === "chem-genius") || (subjectId === "math" && a.id === "mathematician"));

  return (
    <div className="space-y-6">
      <Link href="/lessons" className="inline-flex items-center gap-1 text-sm font-extrabold text-slate-500 hover:text-brand">
        <ArrowLeft size={16} /> Все предметы
      </Link>

      {/* Обложка */}
      <section className="card relative overflow-hidden p-6 text-white sm:p-8" style={{ background: `linear-gradient(135deg, ${subject.gradient[0]}, ${subject.gradient[1]})` }}>
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10" />
        <span className="absolute bottom-2 right-6 text-8xl opacity-80 drop-shadow-lg sm:text-9xl"><Em t={subject.emoji} /></span>
        <div className="relative max-w-2xl">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur">
            <Icon name={subject.icon} size={28} />
          </span>
          <h1 className="font-display mt-4 text-3xl font-extrabold sm:text-4xl">{subject.title}</h1>
          <p className="mt-2 text-white/90">{subject.description}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-extrabold">
            <span className="rounded-full bg-white/20 px-3 py-1">
              {subject.grades[0]}–{subject.grades[1]} классы
            </span>
            {course && <span className="rounded-full bg-white/20 px-3 py-1">{course.lessons.length} уроков + контрольная</span>}
            <span className="rounded-full bg-white/20 px-3 py-1">Уровень знаний: {level.label}</span>
          </div>
          {course && (
            <div className="mt-5 max-w-md">
              <div className="mb-1 flex justify-between text-sm font-extrabold">
                <span>Прогресс курса</span>
                <span>{progress.percent}%</span>
              </div>
              <ProgressBar value={progress.percent / 100} trackClass="bg-white/25" barClass="bg-linear-to-r from-amber-300 to-yellow-100" label="Прогресс курса" />
              <div className="mt-5 flex flex-wrap gap-3">
                {next ? (
                  <Button href={`/lesson/${next.id}`} variant="warning" size="lg">
                    <Play size={20} fill="currentColor" /> {progress.done ? "Продолжить" : "Начать курс"}
                  </Button>
                ) : examOpen && !exam?.passed ? (
                  <Button href={`/exam/${subjectId}`} variant="warning" size="lg">
                    <Trophy size={20} /> К итоговой контрольной
                  </Button>
                ) : (
                  <Button href={`/exam/${subjectId}`} variant="secondary" size="lg">
                    <Emoji e="🏅" /> Курс пройден · сертификат
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {!course ? (
        <section className="card p-6">
          <div className="flex items-center gap-3">
            <Construction className="text-amber-500" />
            <h2 className="font-display text-lg font-bold">Уроки в разработке</h2>
          </div>
          <p className="mt-2 text-slate-500">
            Интерактивные уроки по этому предмету ещё готовятся. Ниже — темы, которые появятся в программе. Пока можно изучать химию, математику, физику, биологию, историю Узбекистана, английский язык и информатику.
          </p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {(subject.planned || []).map((t, i) => (
              <li key={t} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 font-bold text-slate-500">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm shadow-sm">{i + 1}</span>
                {t}
                <Lock size={16} className="ml-auto text-slate-300" />
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!grades.includes(state.profile.grade) && (
              <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800">
                Сейчас доступна программа {grades.join(" и ")} класса. Уроки для {state.profile.grade} класса в разработке — пройденные темы пригодятся как {grades[0] < state.profile.grade ? "повторение" : "подготовка"}.
              </p>
            )}
            {course.chapters.map((chapter, ci) => {
              const done = chapter.lessonIds.every((id) => state.lessons[id]?.completed);
              return (
                <section key={chapter.id} className="card p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Глава {ci + 1}</p>
                      <h2 className="font-display text-lg font-bold">{chapter.title}</h2>
                    </div>
                    {done ? (
                      <Badge tone="green">
                        <Check size={14} /> Глава пройдена
                      </Badge>
                    ) : (
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        Награда: <XpAmount value={`+${REWARDS.chapter.xp}`} size={12} /> <LumosAmount value={`+${REWARDS.chapter.lumos}`} size={13} />
                      </span>
                    )}
                  </div>
                  <ol className="relative space-y-3 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-1 before:rounded-full before:bg-slate-100">
                    {chapter.lessonIds.map((id) => {
                      const l = getLesson(id);
                      const p = state.lessons[id];
                      const open = isLessonUnlocked(state, id);
                      const completed = p?.completed;
                      const node = completed ? "bg-emerald-500 text-white" : open ? "bg-brand text-white ring-4 ring-brand/20" : "bg-slate-200 text-slate-400";
                      const content = (
                        <>
                          <span className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl shadow-sm ${node}`}>{completed ? <Check size={26} strokeWidth={3} /> : open ? l.emoji : <Lock size={22} />}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-extrabold text-slate-400">Урок {l.index + 1}</p>
                            <p className={`font-extrabold ${open ? "" : "text-slate-400"}`}>{l.title}</p>
                            <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <Clock size={12} /> {l.minutes} мин
                              </span>
                              {completed && <span className="font-bold text-emerald-600">Лучший результат: {p.bestCorrect}/7{p.perfect ? <> <Emoji e="⭐" /></> : ""}</span>}
                              {!completed && p?.attempts > 0 && <span className="font-bold text-amber-600">Попыток: {p.attempts}</span>}
                              {!open && <span>Откроется после предыдущего урока</span>}
                            </p>
                          </div>
                          {open && <span className="hidden text-sm font-extrabold text-brand sm:block">{completed ? "Повторить" : "Начать"} →</span>}
                        </>
                      );
                      return (
                        <li key={id}>
                          {open ? (
                            <Link href={`/lesson/${id}`} className="flex items-center gap-4 rounded-2xl p-1 transition hover:bg-slate-50">
                              {content}
                            </Link>
                          ) : (
                            <button onClick={() => toast("Сначала пройди предыдущий урок 🔒", "info")} className="flex w-full items-center gap-4 rounded-2xl p-1 text-left">
                              {content}
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}

            {/* Итоговая контрольная */}
            <section className={`card flex flex-wrap items-center gap-4 p-5 ${examOpen ? "ring-2 ring-amber-300" : ""}`}>
              <span className={`grid h-14 w-14 place-items-center rounded-2xl text-2xl ${exam?.passed ? "bg-amber-400" : examOpen ? "bg-amber-100" : "bg-slate-200"}`}>{exam?.passed ? <Emoji e="🏅" /> : examOpen ? <Emoji e="📝" /> : <Lock size={22} className="text-slate-400" />}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold uppercase tracking-wide text-amber-600">Итоговое испытание</p>
                <p className="font-display font-bold">Контрольная работа: {subject.title}</p>
                <p className="text-sm text-slate-500">
                  {examConfig(subjectId).total} вопросов по всем темам · порог 80%
                  {exam ? ` · лучший результат ${exam.bestPercent}%` : ""}
                </p>
              </div>
              {examOpen ? (
                <Button href={`/exam/${subjectId}`} variant={exam?.passed ? "secondary" : "warning"}>
                  {exam?.passed ? "Сертификат" : "Начать"}
                </Button>
              ) : (
                <span className="text-sm font-bold text-slate-400">
                  Откроется после всех уроков ({progress.done}/{progress.total})
                </span>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="card p-5">
              <h3 className="font-display mb-3 font-bold">Заработано в курсе</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-amber-50 p-3">
                  <XpAmount value={earned.xp} />
                </div>
                <div className="rounded-2xl bg-violet-50 p-3">
                  <LumosAmount value={earned.lumos} />
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Пройдено уроков: <b>{progress.done}</b> из {progress.total}
              </p>
            </section>
            <section className="card p-5">
              <h3 className="font-display mb-3 font-bold">Награды предмета</h3>
              <div className="space-y-2">
                {relatedAch.map((a) => {
                  const got = state.achievements[a.id];
                  return (
                    <div key={a.id} className={`flex items-center gap-3 rounded-2xl p-2 ${got ? "bg-amber-50" : "bg-slate-50 opacity-70"}`}>
                      <span className={`text-2xl ${got ? "" : "grayscale"}`}><Em t={a.medal || a.icon} /></span>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold">{a.title}</p>
                        <p className="text-xs text-slate-500">{got ? "Получено!" : a.condition}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
