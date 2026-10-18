"use client";
import Link from "next/link";
import { ArrowRight, Play, Sparkles, Target, NotebookPen } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import Lumi from "@/components/teacher/Lumi";
import XpAmount from "@/components/ui/XpBadge";
import { LumosAmount } from "@/components/ui/LumosIcon";
import { SectionTitle } from "@/components/ui/Misc";
import DailyQuests from "@/components/game/DailyQuests";
import StreakCard from "@/components/game/StreakCard";
import { SubjectCover } from "@/components/game/SubjectCard";
import { getSubject, getCourse } from "@/lib/content";
import { continueLesson, recommendLesson, subjectsForStudent } from "@/lib/recommend";
import { subjectProgress } from "@/lib/stats";
import { ACHIEVEMENTS, achievementProgress, RARITY } from "@/lib/achievements";
import { weeklyXp } from "@/lib/engine";
import { daySchedule } from "@/lib/schedule";
import { Em, Emoji } from "@/components/ui/Emoji";

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Tashkent" }).format(new Date()));
  if (h < 6) return "Доброй ночи";
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
}

function LessonTile({ lesson, label, tone = "brand" }) {
  const subject = getSubject(lesson.subjectId);
  return (
    <Link href={`/lesson/${lesson.id}`} className="card group flex items-center gap-4 p-4 transition hover:-translate-y-0.5">
      <SubjectCover subject={subject} mini className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl" size={22} />
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-extrabold uppercase tracking-wide ${tone === "brand" ? "text-brand" : "text-brand-2"}`}>{label}</p>
        <p className="truncate font-display font-bold">{lesson.title}</p>
        <p className="text-sm text-slate-500">
          {subject.title} · {lesson.minutes} мин
        </p>
      </div>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white transition group-hover:scale-110">
        <Play size={18} fill="currentColor" />
      </span>
    </Link>
  );
}

export default function Dashboard() {
  const { state, level, stats, today } = useGame();
  const todayPlan = daySchedule(state, today, today);
  const cont = continueLesson(state);
  const rec = recommendLesson(state);
  const subjects = subjectsForStudent(state);
  const week = weeklyXp(state);
  const nearest = ACHIEVEMENTS.filter((a) => !state.achievements[a.id])
    .map((a) => ({ a, p: achievementProgress(a, stats) }))
    .sort((x, y) => y.p.ratio - x.p.ratio)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Приветствие */}
      <section className="card relative overflow-hidden bg-brand-gradient p-6 text-white sm:p-8">
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute bottom-0 right-1/3 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex flex-col items-center gap-6 md:flex-row">
          <div className="flex-1 text-center md:text-left">
            <p className="font-bold text-black">{greeting()},</p>
            <h1 className="font-display text-3xl text-black font-extrabold sm:text-4xl">{state.profile.name}! <Emoji e="👋" /></h1>
            <p className="mt-2 text-black">
              Уровень {level.level} · {level.title} · {state.profile.grade} класс
            </p>
            <div className="mt-4 max-w-md">
              <div className="mb-1 flex justify-between text-xs font-extrabold text-black">
                <span>До уровня {level.level + 1}</span>
                <span>
                  {level.current}/{level.needed} XP
                </span>
              </div>
              <ProgressBar value={level.progress} barClass="bg-linear-to-r from-amber-300 to-yellow-200" trackClass="bg-white/25" label="Прогресс уровня" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/lessons" variant="warning" size="xl" className="w-full sm:w-auto">
                Войти в урок <ArrowRight size={22} />
              </Button>
              <Button href="/diary" variant="secondary" size="xl" className="w-full sm:w-auto">
                <NotebookPen size={22} /> Дневник
              </Button>
            </div>
          </div>
          <Lumi emotion="happy" costume={state.profile.equipped.costume} size={180} className="shrink-0" />
        </div>
      </section>

      {/* Быстрые показатели */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Всего опыта", value: <XpAmount value={state.xp} />, tone: "bg-amber-50" },
          { label: "За эту неделю", value: <XpAmount value={week} />, tone: "bg-sky-50" },
          { label: "Баланс", value: <LumosAmount value={state.lumos} />, tone: "bg-violet-50" },
          { label: "Уроков пройдено", value: <span className="font-display text-xl font-extrabold">{stats.lessonsCompleted}</span>, tone: "bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className={`card ${s.tone} p-4`}>
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">{s.label}</p>
            <div className="mt-1 text-lg">{s.value}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Продолжить / рекомендация */}
          <section>
            <SectionTitle title="Твой следующий шаг" />
            <div className="grid gap-3">
              {todayPlan && !todayPlan.dayOff && (
                <Link href="/diary" className="card flex items-center gap-4 bg-linear-to-r from-brand-soft to-white p-4 transition hover:-translate-y-0.5">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-white">
                    <NotebookPen size={26} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-brand">Сегодня в дневнике</p>
                    <p className="font-display font-bold">
                      Пройдено {todayPlan.slots.filter((x) => x.status === "done").length} из {todayPlan.slots.length} уроков
                    </p>
                    <p className="truncate text-sm text-slate-500">{todayPlan.slots.map((x) => getSubject(x.subjectId).title).join(" · ")}</p>
                  </div>
                  <ArrowRight className="shrink-0 text-brand" />
                </Link>
              )}
              {cont && <LessonTile lesson={cont} label="Продолжить урок" />}
              {rec && rec.lesson.id !== cont?.id && <LessonTile lesson={rec.lesson} label={`Рекомендуем · ${rec.reason}`} tone="violet" />}
              {!cont && !rec && (
                <div className="card p-5 text-center">
                  <p className="text-3xl"><Emoji e="🎓" /></p>
                  <p className="font-display font-bold">Все доступные уроки пройдены!</p>
                  <p className="text-sm text-slate-500">Сдай итоговые контрольные и загляни в другие предметы.</p>
                </div>
              )}
            </div>
          </section>

          {/* Прогресс по предметам */}
          <section>
            <SectionTitle title="Прогресс по предметам" subtitle={`Программа для ${state.profile.grade} класса`} action={<Link href="/lessons" className="text-sm font-extrabold text-brand">Все предметы →</Link>} />
            <div className="card divide-y divide-slate-100">
              {subjects.map((s) => {
                const p = subjectProgress(state, s.id);
                const course = getCourse(s.id);
                return (
                  <Link key={s.id} href={`/subjects/${s.id}`} className="flex items-center gap-3 p-4 transition hover:bg-slate-50">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl" style={{ background: `linear-gradient(135deg, ${s.gradient[0]}22, ${s.gradient[1]}33)` }}>
                      <Em t={s.emoji} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between text-sm font-extrabold">
                        <span className="truncate">{s.title}</span>
                        <span className="text-slate-500">
                          {p.done}/{course.lessons.length} <Em t={p.examPassed && "· 🏅"} />
                        </span>
                      </div>
                      <ProgressBar value={p.percent / 100} height="h-2" className="mt-1.5" label={s.title} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <SectionTitle title="Серия обучения" />
            <StreakCard />
          </section>
          <section className="card p-5">
            <SectionTitle title="Задания на сегодня" action={<Target size={20} className="text-brand" />} />
            <DailyQuests />
          </section>
          <section className="card p-5">
            <SectionTitle title="Ближайшие достижения" action={<Link href="/achievements" className="text-sm font-extrabold text-brand">Все →</Link>} />
            <div className="space-y-3">
              {nearest.map(({ a, p }) => (
                <div key={a.id} className="flex items-center gap-3">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-linear-to-br text-xl ${RARITY[a.rarity].bg}`}><Em t={a.icon} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">{a.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <ProgressBar value={p.ratio} height="h-2" label={a.title} />
                      <span className="shrink-0 text-xs font-bold text-slate-500 tabular-nums">
                        {p.current}/{p.target}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {nearest.length === 0 && (
                <p className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                  <Sparkles size={16} /> Все достижения открыты!
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
