// Ежедневные задания: каждый день (по Ташкенту) выбираются 3 задания из пула.
// Выбор детерминирован датой, поэтому одинаков на клиенте и на сервере.
import { dayKey } from "./time";
import { REWARDS } from "./economy";

export const QUEST_POOL = [
  { id: "lessons2", title: "Пройди 2 урока", icon: "📘", target: 2, metric: "passed" },
  { id: "correct10", title: "Ответь правильно на 10 вопросов", icon: "✅", target: 10, metric: "correct" },
  { id: "newTopic", title: "Изучи новую тему", icon: "🌟", target: 1, metric: "newTopics" },
  { id: "review", title: "Повтори пройденный материал", icon: "🔁", target: 1, metric: "reviews" },
  { id: "xp60", title: "Заработай 60 XP", icon: "⚡", target: 60, metric: "lessonXp" },
  { id: "perfect1", title: "Пройди урок без ошибок", icon: "🎯", target: 1, metric: "perfect" },
];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function questsForDay(day = dayKey()) {
  const pool = [...QUEST_POOL];
  const picked = [];
  let seed = hash(day);
  while (picked.length < 3) {
    const idx = seed % pool.length;
    picked.push(pool.splice(idx, 1)[0]);
    seed = hash(String(seed));
  }
  return picked;
}

/** Задания дня с прогрессом и статусом получения награды. */
export function dailyQuestStatus(state, day = dayKey()) {
  const stats = state.activity?.[day] || {};
  return questsForDay(day).map((q) => {
    const value = stats[q.metric] || 0;
    const key = `quest:${day}:${q.id}`;
    return {
      ...q,
      day,
      key,
      value: Math.min(value, q.target),
      done: value >= q.target,
      claimed: Boolean(state.claims?.[key]),
      reward: REWARDS.dailyQuest,
    };
  });
}
