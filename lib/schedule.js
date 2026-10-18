// Дневник: расписание уроков на каждый день (по календарю Ташкента).
// Расписание не хранится — оно вычисляется из даты, класса и прогресса
// «на начало дня», поэтому каждый день обновляется само и одинаково
// выглядит на клиенте и на сервере. Пройденный сегодня урок остаётся
// в сегодняшнем расписании с оценкой, а на следующий день его место
// занимает следующая тема.
import { addDays, dayKey, dayStartIso, weekStartKey } from "./time";
import { getCourse, getLesson, getSubject } from "./content";
import { subjectsForStudent } from "./recommend";
import { EXAM_PASS_PERCENT } from "./economy";

export const SLOT_TIMES = [
  ["08:30", "09:15"],
  ["09:25", "10:10"],
  ["10:25", "11:10"],
  ["11:20", "12:05"],
  ["12:15", "13:00"],
];
export const LESSONS_PER_DAY = 4;
export const WEEKDAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
export const WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const DAY_MS = 24 * 60 * 60 * 1000;

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle(list, seed) {
  const a = [...list];
  let s = hash(seed);
  for (let i = a.length - 1; i > 0; i--) {
    s = hash(String(s));
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Номер дня недели: 0 = понедельник … 6 = воскресенье. */
export function weekdayIndex(day) {
  const [y, m, d] = day.split("-").map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

/** Школьная оценка по пятибалльной системе за мини-игру из 7 вопросов. */
export function gradeFor(correct) {
  if (correct >= 6) return 5;
  if (correct === 5) return 4;
  return 3; // 4 верных — минимальный проходной результат
}

export function gradeForExam(percent) {
  if (percent >= 95) return 5;
  if (percent >= EXAM_PASS_PERCENT) return 4;
  return null;
}

const at = (iso) => (iso ? Date.parse(iso) : NaN);

/**
 * Расписание на день day (YYYY-MM-DD). today нужен, чтобы отметить прошедшие дни.
 * slot: { n, time, subjectId, kind: "lesson"|"exam"|"review", lessonId?, status, grade?, attempts, lockedBy? }
 * status: done | todo | locked | missed | planned
 */
export function daySchedule(state, day, today) {
  const wd = weekdayIndex(day);
  if (wd === 6) return { day, weekday: wd, dayOff: true, slots: [] };
  // До регистрации ученика расписания нет — не показываем «пропущенные» уроки.
  if (state.profile.createdAt && day < dayKey(new Date(state.profile.createdAt))) return { day, weekday: wd, dayOff: false, beforeStart: true, slots: [] };

  const start = at(dayStartIso(day));
  const end = start + DAY_MS;
  const before = (iso) => at(iso) < start;
  const within = (iso) => at(iso) >= start && at(iso) < end;
  const isPast = day < today;
  const isFuture = day > today;

  const subjects = subjectsForStudent(state).map((s) => s.id);
  if (!subjects.length) return { day, weekday: wd, dayOff: false, slots: [] };
  const order = seededShuffle(subjects, `${day}:${state.profile.grade}:${state.profile.id}`);
  const plan = Array.from({ length: LESSONS_PER_DAY }, (_, i) => order[i % order.length]);

  const assigned = new Set();
  const completedBefore = (id) => state.lessons[id]?.completed && before(state.lessons[id].completedAt);
  const resultsToday = (pred) => state.gameResults.filter((r) => pred(r) && within(r.at));

  const slots = plan.map((subjectId, i) => {
    const course = getCourse(subjectId);
    const base = { n: i + 1, time: SLOT_TIMES[i], subjectId };
    // Следующая тема предмета по состоянию на начало дня (с учётом уже поставленных сегодня).
    const lesson = course.lessons.find((l) => !assigned.has(l.id) && !completedBefore(l.id));

    if (lesson) {
      assigned.add(lesson.id);
      const prev = lesson.index > 0 ? course.lessons[lesson.index - 1] : null;
      const games = resultsToday((r) => r.lessonId === lesson.id);
      const passed = games.filter((r) => r.passed);
      const doneToday = state.lessons[lesson.id]?.completed && within(state.lessons[lesson.id].completedAt);
      let status;
      if (doneToday || passed.length) status = "done";
      else if (isFuture) status = "planned";
      else if (isPast) status = "missed";
      else if (prev && !state.lessons[prev.id]?.completed) status = "locked";
      else status = "todo";
      return {
        ...base,
        kind: "lesson",
        lessonId: lesson.id,
        status,
        grade: passed.length ? gradeFor(Math.max(...passed.map((r) => r.correct))) : null,
        attempts: games.length,
        lockedBy: status === "locked" ? prev.id : null,
      };
    }

    const exam = state.exams[subjectId];
    if (!exam?.passed || !before(exam.passedAt)) {
      const tries = state.examResults.filter((r) => r.subjectId === subjectId && within(r.at));
      const best = tries.length ? Math.max(...tries.map((r) => r.percent)) : null;
      const passedToday = tries.some((r) => r.passed);
      return {
        ...base,
        kind: "exam",
        status: passedToday ? "done" : isFuture ? "planned" : isPast ? "missed" : "todo",
        grade: passedToday ? gradeForExam(best) : null,
        percent: best,
        attempts: tries.length,
      };
    }

    // Курс пройден — повторение: выбираем тему детерминированно по дате.
    const pool = course.lessons.filter((l) => !assigned.has(l.id));
    const review = (pool.length ? pool : course.lessons)[hash(`${day}:${subjectId}:${i}`) % (pool.length || course.lessons.length)];
    assigned.add(review.id);
    const games = resultsToday((r) => r.lessonId === review.id && r.passed);
    return {
      ...base,
      kind: "review",
      lessonId: review.id,
      status: games.length ? "done" : isFuture ? "planned" : isPast ? "missed" : "todo",
      grade: games.length ? gradeFor(Math.max(...games.map((r) => r.correct))) : null,
      attempts: games.length,
    };
  });

  return { day, weekday: wd, dayOff: false, slots };
}

/** Неделя с понедельника по воскресенье, в которую входит day. */
export function weekSchedule(state, day, today) {
  const monday = weekStartKey(new Date(`${day}T12:00:00+05:00`));
  return Array.from({ length: 7 }, (_, i) => daySchedule(state, addDays(monday, i), today));
}

/** Оценки за неделю по предметам: { subjectId: [5, 4, …] }. */
export function weekGrades(week) {
  const out = {};
  for (const d of week) for (const s of d.slots) if (s.grade) (out[s.subjectId] ||= []).push(s.grade);
  return out;
}

export function slotTitle(slot) {
  if (slot.kind === "exam") return `Итоговая контрольная: ${getSubject(slot.subjectId).title}`;
  const l = getLesson(slot.lessonId);
  return slot.kind === "review" ? `Повторение: ${l.title}` : l.title;
}

export function slotHref(slot) {
  if (slot.kind === "exam") return `/exam/${slot.subjectId}`;
  return slot.kind === "review" ? `/lesson/${slot.lessonId}/game` : `/lesson/${slot.lessonId}`;
}
