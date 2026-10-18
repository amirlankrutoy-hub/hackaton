// Проверка ответов. Одна и та же функция используется в браузере (мгновенная
// обратная связь) и на сервере (повторная проверка перед начислением наград).
import { getQuestion, getLesson, getCourse, examConfig } from "./content";
import { GAME_QUESTIONS } from "./economy";

/**
 * Формат ответа зависит от типа вопроса:
 * - mcq / definition / formula / image / fill: индекс варианта в исходном массиве options;
 * - match: массив, где answer[i] — индекс правой части, выбранной для левой части i;
 * - order: массив исходных индексов items в порядке, выбранном учеником.
 */
export function gradeAnswer(question, answer) {
  if (!question) return false;
  switch (question.type) {
    case "match":
      return (
        Array.isArray(answer) &&
        answer.length === question.pairs.length &&
        answer.every((right, left) => right === left)
      );
    case "order":
      return (
        Array.isArray(answer) &&
        answer.length === question.items.length &&
        answer.every((item, pos) => item === pos)
      );
    default:
      return Number.isInteger(answer) && answer === question.answer;
  }
}

/** Текст правильного ответа для экрана разбора. */
export function correctAnswerText(question) {
  switch (question.type) {
    case "match":
      return question.pairs.map(([l, r]) => `${l} — ${r}`).join("; ");
    case "order":
      return question.items.join(" → ");
    default:
      return question.options[question.answer];
  }
}

/** Текст ответа ученика для экрана разбора. */
export function givenAnswerText(question, answer) {
  if (answer === undefined || answer === null) return "Нет ответа";
  switch (question.type) {
    case "match":
      return Array.isArray(answer)
        ? question.pairs.map(([l], i) => `${l} — ${question.pairs[answer[i]]?.[1] ?? "?"}`).join("; ")
        : "Нет ответа";
    case "order":
      return Array.isArray(answer) ? answer.map((i) => question.items[i]).join(" → ") : "Нет ответа";
    default:
      return question.options[answer] ?? "Нет ответа";
  }
}

export function shuffle(list, random = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Набор из 7 вопросов для мини-игры. При повторе в первую очередь берутся
 * вопросы, которых не было в прошлой попытке, а порядок всегда новый.
 */
export function pickGameQuestions(lessonId, previousIds = []) {
  const lesson = getLesson(lessonId);
  if (!lesson) return [];
  const prev = new Set(previousIds);
  const fresh = shuffle(lesson.questions.filter((q) => !prev.has(q.id)));
  const seen = shuffle(lesson.questions.filter((q) => prev.has(q.id)));
  return shuffle([...fresh, ...seen].slice(0, GAME_QUESTIONS));
}

/** Вопросы итоговой контрольной: равномерно из всех уроков курса. */
export function pickExamQuestions(subjectId) {
  const course = getCourse(subjectId);
  const cfg = examConfig(subjectId);
  if (!course || !cfg) return [];
  const picked = [];
  for (const lesson of course.lessons) picked.push(...shuffle(lesson.questions).slice(0, cfg.perLesson));
  return shuffle(shuffle(picked).slice(0, cfg.total));
}

/**
 * Проверка набора вопросов, присланного клиентом: вопросы должны существовать,
 * не повторяться и принадлежать нужному уроку / предмету.
 */
export function validateQuestionSet(ids, { lessonId, subjectId, min, max }) {
  if (!Array.isArray(ids) || ids.length < min || ids.length > max) return "Неверное количество вопросов";
  if (new Set(ids).size !== ids.length) return "Вопросы повторяются";
  for (const id of ids) {
    const q = getQuestion(id);
    if (!q) return "Неизвестный вопрос";
    if (lessonId && q.lessonId !== lessonId) return "Вопрос из другого урока";
    if (subjectId && getLesson(q.lessonId)?.subjectId !== subjectId) return "Вопрос из другого предмета";
  }
  return null;
}
