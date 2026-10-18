// Уровни: первые проходятся быстро (2–3 урока), дальше шаг растёт линейно,
// поэтому для высоких уровней нужны регулярные занятия.
export const MAX_LEVEL = 100;

/** XP, нужный для перехода с уровня n на n+1. */
export function xpStep(n) {
  return 80 + 40 * (n - 1);
}

/** Суммарный XP, необходимый для достижения уровня L. */
export function xpForLevel(L) {
  const n = L - 1;
  return 80 * n + 20 * n * (n - 1);
}

export function levelFromXp(xp) {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) level++;
  return level;
}

export function levelInfo(xp) {
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const next = level < MAX_LEVEL ? xpForLevel(level + 1) : base;
  const span = Math.max(1, next - base);
  return {
    level,
    title: levelTitle(level),
    current: xp - base,
    needed: span,
    progress: level >= MAX_LEVEL ? 1 : (xp - base) / span,
    toNext: Math.max(0, next - xp),
  };
}

const TITLES = [
  [1, "Новичок"],
  [3, "Искатель"],
  [5, "Исследователь"],
  [8, "Знаток"],
  [12, "Эрудит"],
  [16, "Мудрец"],
  [20, "Магистр знаний"],
  [30, "Легенда EduQuest"],
];

export function levelTitle(level) {
  let title = TITLES[0][1];
  for (const [min, t] of TITLES) if (level >= min) title = t;
  return title;
}
