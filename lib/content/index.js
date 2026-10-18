// Реестр учебного контента. Чтобы добавить предмет, создай файл в ./lessons
// по образцу существующих и подключи его в COURSES — всё остальное
// (каталог, разблокировка, мини-игры, контрольные, достижения) подхватится само.
import chemistry from "./lessons/chemistry";
import math from "./lessons/math";
import physics from "./lessons/physics";
import biology from "./lessons/biology";
import history from "./lessons/history";
import english from "./lessons/english";
import informatics from "./lessons/informatics";
import { SUBJECTS, SUBJECT_MAP, getSubject, subjectAvailableForGrade, GRADES } from "./subjects";
import { GAME_QUESTIONS } from "../economy";

const COURSES = [math, chemistry, physics, biology, history, english, informatics];

const LESSONS = [];
const LESSON_MAP = {};
const QUESTION_MAP = {};
const COURSE_MAP = {};

for (const course of COURSES) {
  const subjectLessons = [];
  const chapters = course.chapters.map((chapter) => {
    const lessons = chapter.lessons.map((raw) => {
      const lesson = {
        ...raw,
        subjectId: course.subjectId,
        chapterId: chapter.id,
        index: subjectLessons.length,
        questions: raw.questions.map((q, i) => ({ ...q, id: `${raw.id}:${i}`, lessonId: raw.id })),
      };
      if (lesson.questions.length < GAME_QUESTIONS) {
        throw new Error(`Урок ${raw.id}: нужно минимум ${GAME_QUESTIONS} вопросов`);
      }
      lesson.questions.forEach((q) => (QUESTION_MAP[q.id] = q));
      subjectLessons.push(lesson);
      LESSONS.push(lesson);
      LESSON_MAP[lesson.id] = lesson;
      return lesson;
    });
    return { id: chapter.id, title: chapter.title, lessonIds: lessons.map((l) => l.id) };
  });
  COURSE_MAP[course.subjectId] = { subjectId: course.subjectId, chapters, lessons: subjectLessons };
}

export { SUBJECTS, SUBJECT_MAP, GRADES, getSubject, subjectAvailableForGrade };
export const ALL_LESSONS = LESSONS;

export function getLesson(id) {
  return LESSON_MAP[id] || null;
}

export function getQuestion(id) {
  return QUESTION_MAP[id] || null;
}

/** Содержимое курса: { chapters: [{id,title,lessonIds}], lessons: [...] } или null. */
export function getCourse(subjectId) {
  return COURSE_MAP[subjectId] || null;
}

export function hasContent(subjectId) {
  return Boolean(COURSE_MAP[subjectId]);
}

export const SUBJECTS_WITH_CONTENT = COURSES.map((c) => c.subjectId);

export function getChapter(subjectId, chapterId) {
  return COURSE_MAP[subjectId]?.chapters.find((c) => c.id === chapterId) || null;
}

export function nextLessonId(lessonId) {
  const lesson = LESSON_MAP[lessonId];
  if (!lesson) return null;
  const list = COURSE_MAP[lesson.subjectId].lessons;
  return list[lesson.index + 1]?.id || null;
}

export function prevLessonId(lessonId) {
  const lesson = LESSON_MAP[lessonId];
  if (!lesson || lesson.index === 0) return null;
  return COURSE_MAP[lesson.subjectId].lessons[lesson.index - 1].id;
}

/** Параметры итоговой контрольной: 15–20 вопросов из всех тем курса. */
export function examConfig(subjectId) {
  const course = COURSE_MAP[subjectId];
  if (!course) return null;
  const n = course.lessons.length;
  const total = Math.min(25, Math.max(15, n * 2 + 2));
  return {
    subjectId,
    total,
    perLesson: Math.ceil(total / n),
    minQuestions: 15,
    maxQuestions: 25,
    secondsPerQuestion: 60,
  };
}

/** Классы, для которых есть готовый контент по предмету. */
export function contentGrades(subjectId) {
  const course = COURSE_MAP[subjectId];
  if (!course) return [];
  return [...new Set(course.lessons.map((l) => l.grade))].sort((a, b) => a - b);
}
