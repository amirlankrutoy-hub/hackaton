"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/components/providers/GameProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { weeklyXp } from "@/lib/engine";

/** Записи рейтинга: только я (демо-режим) или реальные пользователи (Supabase). */
export function useLeaderboardEntries() {
  const { mode, getToken } = useAuth();
  const { state, stats } = useGame();
  const [remote, setRemote] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "supabase") return;
    let alive = true;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/leaderboard", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (alive) setRemote(data.entries);
      } catch (e) {
        if (alive) setError(e.message || "Не удалось загрузить рейтинг");
      }
    })();
    return () => {
      alive = false;
    };
  }, [mode, getToken, state.xp]);

  const p = state.profile;
  const me = {
    id: p.id,
    name: p.privacy.hideRealName ? p.username : p.name,
    username: p.username,
    avatar: p.equipped.avatar,
    frame: p.equipped.frame,
    xp: state.xp,
    weeklyXp: weeklyXp(state),
    lessonsCompleted: stats.lessonsCompleted,
    me: true,
  };
  if (mode === "supabase") {
    const list = remote ? remote.map((e) => (e.id === p.id ? { ...e, ...me } : e)) : null;
    return { entries: list, me, error };
  }
  const list = p.privacy.showInLeaderboard ? [me] : [];
  return { entries: list, me, error: "" };
}


/** Место ученика в глобальном рейтинге по XP (null, пока загружается). */
export function useMyRank() {
  const { entries, me } = useLeaderboardEntries();
  if (!entries) return null;
  const list = entries.some((e) => e.me) ? entries : [...entries, me];
  return [...list].sort((a, b) => b.xp - a.xp).findIndex((e) => e.me) + 1;
}
