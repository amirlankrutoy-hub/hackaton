"use client";
import { useState } from "react";
import { Lock, Check } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import ProgressBar from "@/components/ui/ProgressBar";
import { PageHeader } from "@/components/ui/Misc";
import XpAmount from "@/components/ui/XpBadge";
import { LumosAmount } from "@/components/ui/LumosIcon";
import { ACHIEVEMENTS, RARITY, achievementProgress } from "@/lib/achievements";
import { formatDate } from "@/lib/time";
import { Emoji, Em } from "@/components/ui/Emoji";

function AchievementCard({ a, stats, unlockedAt }) {
  const p = achievementProgress(a, stats);
  const r = RARITY[a.rarity];
  return (
    <div className={`card relative flex flex-col overflow-hidden p-5 transition ${unlockedAt ? "" : "opacity-90"}`}>
      {unlockedAt && <span className="shine pointer-events-none absolute inset-0" />}
      <div className="flex items-start gap-4">
        <span className={`relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-linear-to-br text-3xl shadow-sm ${unlockedAt ? r.bg : "from-slate-100 to-slate-200"}`}>
          <span className={unlockedAt ? "" : "opacity-40 grayscale"}><Em t={a.medal || a.icon} /></span>
          {!unlockedAt && (
            <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white text-slate-400 shadow">
              <Lock size={13} />
            </span>
          )}
          {unlockedAt && (
            <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white shadow">
              <Check size={14} strokeWidth={3} />
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: r.color }}>
            {r.label}
          </span>
          <h3 className="font-display font-bold leading-tight">{a.title}</h3>
          <p className="text-sm text-slate-500">{a.description}</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600"><Emoji e="🎯" /> {a.condition}</p>
      <div className="mt-3 flex items-center gap-2">
        <ProgressBar value={p.ratio} height="h-2.5" barClass={unlockedAt ? "bg-emerald-500" : "bg-brand-gradient"} label={a.title} />
        <span className="shrink-0 text-xs font-extrabold tabular-nums text-slate-500">
          {p.current}/{p.target}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
        <span className="flex gap-2">
          {a.reward.xp > 0 && <XpAmount value={`+${a.reward.xp}`} size={12} />}
          {a.reward.lumos > 0 && <LumosAmount value={`+${a.reward.lumos}`} size={13} />}
          {a.master && <span>Медаль + сертификат</span>}
        </span>
        {unlockedAt && <span>{formatDate(unlockedAt)}</span>}
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const { state, stats } = useGame();
  const [filter, setFilter] = useState("all");
  const unlockedCount = ACHIEVEMENTS.filter((a) => state.achievements[a.id]).length;
  const list = ACHIEVEMENTS.filter((a) => (filter === "open" ? state.achievements[a.id] : filter === "locked" ? !state.achievements[a.id] : true));
  const general = list.filter((a) => !a.master);
  const masters = list.filter((a) => a.master);

  return (
    <div>
      <PageHeader title="Достижения" subtitle={`Открыто ${unlockedCount} из ${ACHIEVEMENTS.length}. Достижения открываются автоматически, награда выдаётся один раз.`} emoji="🏅" />

      <div className="card mb-6 p-5">
        <div className="mb-2 flex justify-between text-sm font-extrabold">
          <span>Коллекция</span>
          <span>{Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%</span>
        </div>
        <ProgressBar value={unlockedCount / ACHIEVEMENTS.length} label="Коллекция достижений" />
        <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-slate-400">Медали мастеров предметов</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACHIEVEMENTS.filter((a) => a.master).map((a) => (
            <span key={a.id} title={a.title} className={`grid h-12 w-12 place-items-center rounded-full text-2xl ${state.achievements[a.id] ? "shadow-md ring-4 ring-amber-300" : "bg-slate-100 opacity-40 grayscale"}`} style={state.achievements[a.id] ? { background: "radial-gradient(circle at 30% 30%, #fef3c7, #f59e0b)" } : undefined}>
              <Em t={a.medal} />
            </span>
          ))}
        </div>
      </div>

      <div className="mb-5 flex gap-1.5">
        {[
          ["all", "Все"],
          ["open", "Открытые"],
          ["locked", "Закрытые"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} className={`rounded-xl px-4 py-2 text-sm font-extrabold ${filter === id ? "bg-brand text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>
            {label}
          </button>
        ))}
      </div>

      {general.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {general.map((a) => (
            <AchievementCard key={a.id} a={a} stats={stats} unlockedAt={state.achievements[a.id]} />
          ))}
        </div>
      )}
      {masters.length > 0 && (
        <>
          <h2 className="font-display mb-3 mt-8 text-lg font-bold">Мастер предмета</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {masters.map((a) => (
              <AchievementCard key={a.id} a={a} stats={stats} unlockedAt={state.achievements[a.id]} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
