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

/** Ответ без AI: ищем частый вопрос по ключевым словам. */
export function offlineAnswer(lesson, question) {
  const q = question.toLowerCase();
  const hit = lesson.faq?.find((f) => f.keys.some((k) => q.includes(k.toLowerCase())));
  if (hit) return hit.answer;
  const step = lesson.steps.find((s) => s.title.toLowerCase().split(/\s+/).some((w) => w.length > 4 && q.includes(w.slice(0, -1))));
  if (step) return `${step.simple}\n\nПодробнее: ${step.text}`;
  return null;
}
