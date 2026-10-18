"use client";
import { Flame } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { STREAK_MILESTONES } from "@/lib/economy";
import { addDays, weekStartKey, formatShort } from "@/lib/time";
import LumosIcon from "@/components/ui/LumosIcon";
import { Em } from "@/components/ui/Emoji";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function message(streak) {
  if (streak.activeToday && streak.current >= 7) return "Невероятная серия! Ты настоящий чемпион.";
  if (streak.activeToday) return "Сегодня ты уже занимался — так держать!";
  if (streak.current > 0) return "Пройди урок сегодня, чтобы продолжить серию.";
  return "Начни новую серию с одного урока — это займёт 7 минут.";
}

export default function StreakCard({ compact = false }) {
  const { stats, state, today } = useGame();
  const s = stats.streak;
  const next = STREAK_MILESTONES.find((m) => m.days > s.current);
  const start = weekStartKey(new Date(`${today}T12:00:00+05:00`));
  const week = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const active = (d) => (state.activity[d]?.games || 0) + (state.activity[d]?.exams || 0) > 0;

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${s.current ? "bg-linear-to-br from-orange-400 to-rose-500 text-white shadow-lg" : "bg-slate-100 text-slate-400"}`}>
          <Flame size={34} fill="currentColor" className={s.activeToday ? "animate-wiggle" : ""} />
        </div>
        <div>
          <p className="font-display text-3xl font-extrabold leading-none">
            {s.current} <span className="text-base text-slate-500">{s.current === 1 ? "день" : s.current >= 2 && s.current <= 4 ? "дня" : "дней"}</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">{message(s)}</p>
        </div>
      </div>
      {!compact && (
        <>
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {week.map((d, i) => (
              <div key={d} className="flex flex-col items-center gap-1" title={formatShort(d)}>
                <span className={`text-[11px] font-extrabold ${d === today ? "text-brand" : "text-slate-400"}`}>{WEEKDAYS[i]}</span>
                <span className={`grid h-9 w-9 place-items-center rounded-xl text-sm ${active(d) ? "bg-orange-100 text-orange-500" : d > today ? "bg-slate-50 text-slate-300" : "bg-slate-100 text-slate-300"} ${d === today ? "ring-2 ring-brand/40" : ""}`}>
                  <Em t={active(d) ? "🔥" : "·"} />
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-orange-50 px-3 py-2 text-sm">
            <span className="font-bold text-orange-700">{next ? `Цель: ${next.days} дней подряд` : "Все цели серии достигнуты!"}</span>
            {next && (
              <span className="inline-flex items-center gap-1 font-extrabold text-violet-700">
                +{next.lumos} <LumosIcon size={16} />
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">Лучшая серия: {s.best} · Пропустил день? Не беда — просто начни снова.</p>
        </>
      )}
    </div>
  );
}
