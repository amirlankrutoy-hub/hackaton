"use client";
import { useMemo, useState } from "react";
import { Search, Crown, Users, Info, EyeOff } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { useLeaderboardEntries } from "@/components/game/useLeaderboard";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { PageHeader, EmptyState } from "@/components/ui/Misc";
import { levelFromXp } from "@/lib/levels";
import { weekStartKey, formatShort } from "@/lib/time";
import { Emoji } from "@/components/ui/Emoji";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const { state } = useGame();
  const { entries, me, error, demo } = useLeaderboardEntries();
  const [tab, setTab] = useState("global");
  const [query, setQuery] = useState("");
  const hidden = !state.profile.privacy.showInLeaderboard;

  const ranked = useMemo(() => {
    if (!entries) return [];
    const key = tab === "weekly" ? "weeklyXp" : "xp";
    return [...entries].sort((a, b) => b[key] - a[key] || b.lessonsCompleted - a.lessonsCompleted).map((e, i) => ({ ...e, rank: i + 1, score: e[key] }));
  }, [entries, tab]);

  const myRow = ranked.find((e) => e.me);
  const hypothetical = hidden && entries ? [...entries, me].sort((a, b) => (tab === "weekly" ? b.weeklyXp - a.weeklyXp : b.xp - a.xp)).findIndex((e) => e.me) + 1 : null;
  const q = query.trim().toLowerCase();
  const filtered = q ? ranked.filter((e) => e.name.toLowerCase().includes(q) || e.username?.toLowerCase().includes(q)) : ranked;
  const top3 = ranked.slice(0, 3);

  return (
    <div>
      <PageHeader title="Глобальный рейтинг" subtitle="Место определяется только опытом (XP) за учёбу. Lumos и покупки не влияют." emoji="🏆" />

      {demo && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>Тестовые данные: в демо-режиме рейтинг заполнен вымышленными учениками (отмечены значком «демо»), чтобы показать работу таблицы. После подключения Supabase здесь будут только реальные пользователи.</p>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1.5 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200">
          {[
            ["global", "Все время"],
            ["weekly", "Эта неделя"],
            ["friends", "Друзья"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`rounded-xl px-4 py-2 text-sm font-extrabold transition ${tab === id ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {label}
            </button>
          ))}
        </div>
        {tab !== "friends" && (
          <label className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти ученика по имени или нику" className="h-12 w-full rounded-2xl border-2 border-slate-200 bg-white pl-10 pr-4 font-semibold outline-none focus:border-brand" />
          </label>
        )}
      </div>

      {tab === "friends" ? (
        <EmptyState emoji="🤝" title="Рейтинг друзей появится позже" text="Мы работаем над функцией друзей: можно будет добавлять одноклассников и соревноваться с ними. Пока сравни себя с другими во вкладках «Все время» и «Эта неделя».">
          <Users className="mt-2 text-slate-300" size={40} />
        </EmptyState>
      ) : error ? (
        <EmptyState emoji="⚠️" title="Рейтинг не загрузился" text={error} />
      ) : !entries ? (
        <div className="card p-10 text-center font-bold text-slate-400">Загружаем рейтинг…</div>
      ) : (
        <>
          {tab === "weekly" && <p className="mb-4 text-sm font-bold text-slate-500">XP, заработанные с понедельника {formatShort(weekStartKey())} (время Ташкента).</p>}

          {/* Моё место */}
          <div className="card mb-5 flex items-center gap-4 bg-brand-soft p-4 ring-2 ring-brand/20">
            <span className="font-display w-12 text-center text-2xl font-extrabold text-brand">#{myRow ? myRow.rank : hypothetical}</span>
            <Avatar avatar={me.avatar} frame={me.frame} size={48} />
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">Твоё место</p>
              <p className="text-sm text-slate-500">
                {tab === "weekly" ? `${me.weeklyXp} XP за неделю` : `${me.xp} XP всего`} · уровень {levelFromXp(me.xp)}
              </p>
            </div>
            {hidden && (
              <Badge tone="slate">
                <EyeOff size={12} /> скрыт
              </Badge>
            )}
          </div>
          {hidden && <p className="-mt-3 mb-5 text-xs font-bold text-slate-400">Ты скрыл себя из рейтинга в настройках — другие ученики тебя не видят. Место показано только тебе.</p>}

          {/* Пьедестал */}
          {!q && top3.length === 3 && (
            <div className="mb-6 grid grid-cols-3 items-end gap-2 sm:gap-4">
              {[top3[1], top3[0], top3[2]].map((e) => {
                const h = e.rank === 1 ? "h-32" : e.rank === 2 ? "h-24" : "h-20";
                return (
                  <div key={e.id} className="flex flex-col items-center text-center">
                    {e.rank === 1 && <Crown className="mb-1 text-amber-400" fill="currentColor" size={28} />}
                    <Avatar avatar={e.avatar} frame={e.frame} size={e.rank === 1 ? 72 : 58} />
                    <p className="mt-1 max-w-full truncate text-sm font-extrabold">{e.name}</p>
                    <p className="text-xs font-bold text-slate-500">{e.score} XP</p>
                    <div className={`mt-2 grid w-full place-items-center rounded-t-2xl ${h} ${e.rank === 1 ? "bg-linear-to-b from-amber-300 to-amber-400" : e.rank === 2 ? "bg-linear-to-b from-slate-200 to-slate-300" : "bg-linear-to-b from-orange-200 to-orange-300"}`}>
                      <span className="text-3xl"><Emoji e={MEDALS[e.rank - 1]} /></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Таблица */}
          <div className="card overflow-hidden">
            <div className="grid grid-cols-[3rem_1fr_4rem_5rem] gap-2 border-b border-slate-100 px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-400 sm:grid-cols-[3.5rem_1fr_5rem_6rem_6rem]">
              <span>Место</span>
              <span>Ученик</span>
              <span className="text-center">Ур.</span>
              <span className="text-right">{tab === "weekly" ? "XP/нед." : "XP"}</span>
              <span className="hidden text-right sm:block">Уроков</span>
            </div>
            {filtered.length === 0 && <p className="p-6 text-center font-bold text-slate-400">Никого не нашли по запросу «{query}»</p>}
            {filtered.map((e) => (
              <div key={e.id} className={`grid grid-cols-[3rem_1fr_4rem_5rem] items-center gap-2 border-b border-slate-50 px-4 py-3 last:border-0 sm:grid-cols-[3.5rem_1fr_5rem_6rem_6rem] ${e.me ? "bg-brand-soft" : ""}`}>
                <span className="font-display text-lg font-extrabold text-slate-500">{e.rank <= 3 ? <Emoji e={MEDALS[e.rank - 1]} /> : e.rank}</span>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar avatar={e.avatar} frame={e.frame} size={38} />
                  <div className="min-w-0">
                    <p className="truncate font-extrabold">
                      {e.name} {e.me && <Badge tone="brand">Это ты</Badge>} {e.demo && <Badge tone="slate">демо</Badge>}
                    </p>
                    {e.username && <p className="truncate text-xs text-slate-400">@{e.username}</p>}
                  </div>
                </div>
                <span className="text-center font-extrabold text-brand">{levelFromXp(e.xp)}</span>
                <span className="text-right font-display font-bold tabular-nums">{e.score}</span>
                <span className="hidden text-right font-bold text-slate-500 sm:block">{e.lessonsCompleted}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
