import { dayKey, addDays } from "./time";
import { levelFromXp } from "./levels";
import { getLesson, getCourse } from "./content";

/** Серия обучения считается по календарным дням Ташкента с хотя бы одной попыткой. */
export function computeStreak(activity = {}, today = dayKey()) {
  const active = (d) => (activity[d]?.games || 0) + (activity[d]?.exams || 0) > 0;
  const activeToday = active(today);
  let cursor = activeToday ? today : addDays(today, -1);
  let current = 0;
  while (active(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  const days = Object.keys(activity).filter(active).sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return { current, best: Math.max(best, current), activeToday };
}

export function computeStats(state, today = dayKey()) {
  const perSubject = {};
  let lessonsCompleted = 0;
  for (const [lessonId, p] of Object.entries(state.lessons || {})) {
    if (!p.completed) continue;
    const lesson = getLesson(lessonId);
    if (!lesson) continue;
    lessonsCompleted++;
    perSubject[lesson.subjectId] = (perSubject[lesson.subjectId] || 0) + 1;
  }
  const exams = state.exams || {};
  const examsPassed = Object.values(exams).filter((e) => e.passed).length;
  const c = state.counters || {};
  return {
    xp: state.xp || 0,
    level: levelFromXp(state.xp || 0),
    lessonsCompleted,
    perSubject,
    subjectsStudied: Object.keys(perSubject).length,
    passedGames: c.passedGames || 0,
    perfectGames: c.perfectGames || 0,
    correctAnswers: c.correctAnswers || 0,
    purchases: c.purchases || 0,
    questsClaimed: c.questsClaimed || 0,
    examsPassed,
    perfectExams: Object.values(exams).filter((e) => e.bestPercent === 100).length,
    examPassedFor: (subjectId) => Boolean(exams[subjectId]?.passed),
    careerDone: Boolean(state.career),
    streak: computeStreak(state.activity, today),
  };
}

/** Прогресс по предмету в процентах (уроки + итоговая контрольная). */
export function subjectProgress(state, subjectId) {
  const course = getCourse(subjectId);
  if (!course) return { done: 0, total: 0, percent: 0, examPassed: false, started: false };
  const done = course.lessons.filter((l) => state.lessons?.[l.id]?.completed).length;
  const examPassed = Boolean(state.exams?.[subjectId]?.passed);
  const total = course.lessons.length;
  const started = done > 0 || course.lessons.some((l) => state.lessons?.[l.id]);
  const percent = Math.round(((done + (examPassed ? 1 : 0)) / (total + 1)) * 100);
  return { done, total, percent, examPassed, started };
}

/** Уровень знаний по предмету — по доле пройденного и среднему результату. */
export function knowledgeLevel(state, subjectId) {
  const course = getCourse(subjectId);
  if (!course) return { label: "Скоро", tone: "slate" };
  const scores = course.lessons.map((l) => state.lessons?.[l.id]?.bestCorrect).filter((s) => s !== undefined);
  if (state.exams?.[subjectId]?.passed) return { label: "Мастер", tone: "gold" };
  if (!scores.length) return { label: "Новичок", tone: "slate" };
  const share = scores.length / course.lessons.length;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length / 7;
  if (share >= 0.7 && avg >= 0.85) return { label: "Продвинутый", tone: "violet" };
  if (share >= 0.3) return { label: "Уверенный", tone: "blue" };
  return { label: "Начальный", tone: "teal" };
}
