// Все «календарные» расчёты (серии, ежедневные задания, недельный рейтинг)
// ведутся по часовому поясу Ташкента, а не по часовому поясу браузера.
export const TIMEZONE = "Asia/Tashkent";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Календарная дата в Ташкенте в формате YYYY-MM-DD. */
export function dayKey(date = new Date()) {
  return dayFormatter.format(date instanceof Date ? date : new Date(date));
}

/** Сдвиг даты YYYY-MM-DD на n дней (работаем в UTC, чтобы не зависеть от DST). */
export function addDays(key, n) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

/** Понедельник текущей недели (по Ташкенту) в формате YYYY-MM-DD. */
export function weekStartKey(date = new Date()) {
  const key = dayKey(date);
  const [y, m, d] = key.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = вс
  const offset = weekday === 0 ? -6 : 1 - weekday;
  return addDays(key, offset);
}

/** Начало дня YYYY-MM-DD в Ташкенте как ISO-время (UTC+5, без перехода на летнее время). */
export function dayStartIso(key) {
  return `${key}T00:00:00+05:00`;
}

export function lastNDays(n, today = dayKey()) {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)));
}

const shortDate = new Intl.DateTimeFormat("ru-RU", { timeZone: TIMEZONE, day: "numeric", month: "short" });
const fullDate = new Intl.DateTimeFormat("ru-RU", { timeZone: TIMEZONE, day: "numeric", month: "long", year: "numeric" });

export function formatShort(key) {
  return shortDate.format(new Date(`${key}T12:00:00+05:00`));
}

export function formatDate(iso) {
  return fullDate.format(new Date(iso));
}

/** Склонение: plural(5, ["урок", "урока", "уроков"]) */
export function plural(n, forms) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}
