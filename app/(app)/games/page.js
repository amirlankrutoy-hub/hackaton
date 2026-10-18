"use client";
import Link from "next/link";
import { Gamepad2, Lock, Star, Trophy } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { PageHeader } from "@/components/ui/Misc";
import Badge from "@/components/ui/Badge";
import { SUBJECTS_WITH_CONTENT, getSubject, getCourse } from "@/lib/content";
import { isLessonUnlocked, isExamUnlocked } from "@/lib/engine";
import { Em, Emoji } from "@/components/ui/Emoji";

export default function GamesPage() {
  const { state, stats } = useGame();
  const c = state.counters;
  return (
    <div>
      <PageHeader title="Мини-игры" subtitle="Закрепляй знания: каждая игра — 7 вопросов по теме урока" emoji="🎮" />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Сыграно", c.gamesPlayed || 0],
          ["Побед", c.passedGames || 0],
          ["Без ошибок", c.perfectGames || 0],
          ["Верных ответов", stats.correctAnswers],
        ].map(([l, v]) => (
          <div key={l} className="card p-4">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{l}</p>
            <p className="font-display text-2xl font-extrabold">{v}</p>
          </div>
        ))}
      </div>
      <p className="mb-5 rounded-2xl bg-brand-soft px-4 py-3 text-sm font-bold text-brand">
        Совет: перед новой игрой послушай объяснение Луми. Повторные игры не дают XP за уже пройденный урок, но засчитываются в ежедневные задания и достижения.
      </p>
      <div className="space-y-6">
        {SUBJECTS_WITH_CONTENT.map((sid) => {
          const s = getSubject(sid);
          const course = getCourse(sid);
          const examOpen = isExamUnlocked(state, sid);
          return (
            <section key={sid}>
              <h2 className="font-display mb-3 text-lg font-bold">
                <Em t={s.emoji} /> {s.title}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {course.lessons.map((l) => {
                  const open = isLessonUnlocked(state, l.id);
                  const p = state.lessons[l.id];
                  return (
                    <Link key={l.id} href={open ? (p?.completed ? `/lesson/${l.id}/game` : `/lesson/${l.id}`) : `/subjects/${sid}`} className={`card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 ${open ? "" : "opacity-60"}`}>
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-50 text-2xl">{open ? l.emoji : <Lock size={20} className="text-slate-400" />}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-extrabold">{l.title}</p>
                        <p className="text-xs text-slate-500">{p?.completed ? `Лучший результат ${p.bestCorrect}/7` : open ? "Сначала объяснение, потом игра" : "Закрыто"}</p>
                      </div>
                      {p?.perfect ? <Star className="shrink-0 text-amber-400" fill="currentColor" size={20} /> : p?.completed ? <Badge tone="green">Пройдено</Badge> : open ? <Gamepad2 className="shrink-0 text-brand" size={20} /> : null}
                    </Link>
                  );
                })}
                <Link href={`/exam/${sid}`} className={`card flex items-center gap-3 p-4 ${examOpen ? "ring-2 ring-amber-300" : "opacity-60"}`}>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-2xl">{state.exams[sid]?.passed ? <Emoji e="🏅" /> : <Trophy className="text-amber-500" size={22} />}</span>
                  <div className="min-w-0">
                    <p className="font-extrabold">Итоговая контрольная</p>
                    <p className="text-xs text-slate-500">{state.exams[sid] ? `Лучший результат ${state.exams[sid].bestPercent}%` : examOpen ? "Открыта!" : "После всех уроков"}</p>
                  </div>
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
