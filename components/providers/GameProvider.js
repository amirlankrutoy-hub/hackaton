"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import { demoStore } from "@/lib/demoStore";
import { createInitialState, normalizeState, runAction, EngineError } from "@/lib/engine";
import { computeStats } from "@/lib/stats";
import { levelInfo } from "@/lib/levels";
import { dayKey } from "@/lib/time";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { user, mode, getToken } = useAuth();
  const [state, setState] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [celebrations, setCelebrations] = useState([]);
  const [today, setToday] = useState(() => dayKey());
  const stateRef = useRef(null);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Полночь по Ташкенту: обновляем «сегодня», чтобы задания и серия пересчитались.
  useEffect(() => {
    const t = setInterval(() => setToday(dayKey()), 60_000);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async () => {
    setLoadError(null);
    if (!user) {
      setState(null);
      return;
    }
    if (mode === "demo") {
      let s = demoStore.loadState(user.id);
      if (!s) {
        const acc = demoStore.sessionUser();
        s = createInitialState({ id: user.id, name: acc?.name || "Ученик", username: acc?.username || "student", grade: acc?.grade || 7 });
        demoStore.saveState(user.id, s);
      }
      setState(normalizeState(s));
      return;
    }
    try {
      const token = await getToken();
      const res = await fetch("/api/state", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось загрузить прогресс");
      setState(normalizeState(data.state));
    } catch (e) {
      setLoadError(e.message);
    }
  }, [user, mode, getToken]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  // Синхронизация между вкладками в демо-режиме.
  useEffect(() => {
    if (mode !== "demo" || !user) return;
    const onStorage = (e) => {
      if (e.key === demoStore.stateKey(user.id) && e.newValue) setState(normalizeState(JSON.parse(e.newValue)));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [mode, user]);

  // Тема интерфейса из магазина.
  const theme = state?.profile.equipped.theme || "theme-default";
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const enqueue = useCallback((result) => {
    const items = [];
    if (result?.levelUp) items.push({ kind: "level", ...result.levelUp });
    for (const id of result?.unlocked || []) items.push({ kind: "achievement", id });
    if (items.length) setCelebrations((q) => [...q, ...items.map((i) => ({ ...i, key: crypto.randomUUID() }))]);
  }, []);

  /** Выполняет игровое действие. В демо — локально, иначе — на сервере. */
  const dispatch = useCallback(
    async (type, payload = {}) => {
      if (!stateRef.current) throw new Error("Прогресс ещё загружается");
      if (mode === "demo") {
        try {
          const { state: next, result } = runAction(stateRef.current, type, payload);
          if (!demoStore.saveState(user.id, next)) throw new Error("Не удалось сохранить прогресс в браузере");
          stateRef.current = next;
          setState(next);
          enqueue(result);
          return result;
        } catch (e) {
          if (e instanceof EngineError) throw new Error(e.message);
          throw e;
        }
      }
      const token = await getToken();
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type, payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Ошибка сервера");
      const next = normalizeState(data.state);
      stateRef.current = next;
      setState(next);
      enqueue(data.result);
      return data.result;
    },
    [mode, user, getToken, enqueue]
  );

  const resetDemo = useCallback(() => {
    if (mode !== "demo" || !user) return;
    demoStore.resetState(user.id);
    load();
  }, [mode, user, load]);

  const derived = useMemo(() => {
    if (!state) return null;
    return { stats: computeStats(state, today), level: levelInfo(state.xp) };
  }, [state, today]);

  const value = useMemo(
    () => ({
      state,
      ...derived,
      today,
      loading: Boolean(user) && !state && !loadError,
      loadError,
      reload: load,
      dispatch,
      resetDemo,
      celebrations,
      popCelebration: () => setCelebrations((q) => q.slice(1)),
    }),
    [state, derived, today, user, loadError, load, dispatch, resetDemo, celebrations]
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
