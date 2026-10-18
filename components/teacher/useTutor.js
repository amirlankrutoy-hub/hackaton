"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

let cached = null;

/** Доступен ли AI-учитель (на сервере задан ANTHROPIC_API_KEY). */
export function useTutorAvailability() {
  const [enabled, setEnabled] = useState(cached);
  useEffect(() => {
    if (cached !== null) return;
    fetch("/api/tutor")
      .then((r) => r.json())
      .then((d) => {
        cached = Boolean(d.enabled);
        setEnabled(cached);
      })
      .catch(() => {
        cached = false;
        setEnabled(false);
      });
  }, []);
  return enabled;
}

export function useAskTutor() {
  const { getToken } = useAuth();
  return async ({ lessonId, mode, question, grade, history }) => {
    const token = await getToken();
    const res = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ lessonId, mode, question, grade, history }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "AI-учитель недоступен");
    return data.answer;
  };
}
