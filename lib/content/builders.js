// Компактные конструкторы вопросов для учебного контента.
// Идентификаторы вопросам назначаются автоматически в реестре (lessonId:index).

/** Вопрос с четырьмя (или двумя-тремя) вариантами ответа. */
export const mcq = (prompt, options, answer, explain) => ({ type: "mcq", prompt, options, answer, explain });

/** Выбор правильного определения термина. */
export const def = (term, options, answer, explain) => ({
  type: "definition",
  prompt: "Выбери верное определение",
  term,
  options,
  answer,
  explain,
});

/** Определение правильной формулы / записи. */
export const formula = (prompt, options, answer, explain) => ({ type: "formula", prompt, options, answer, explain });

/** Задание с изображением. image: { kind, ... } — см. components/game/QuestionImage. */
export const pic = (image, prompt, options, answer, explain) => ({ type: "image", image, prompt, options, answer, explain });

/** Заполнение пропуска: в prompt пропуск обозначается «___». */
export const fill = (prompt, options, answer, explain) => ({ type: "fill", prompt, options, answer, explain });

/** Соединение пар: pairs = [[левое, правое], ...] в правильном соответствии. */
export const match = (prompt, pairs, explain) => ({ type: "match", prompt, pairs, explain });

/** Расстановка шагов: items перечислены в правильном порядке. */
export const order = (prompt, items, explain) => ({ type: "order", prompt, items, explain });

/** Верно / неверно. */
export const tf = (statement, isTrue, explain) => ({
  type: "mcq",
  prompt: `Верно ли утверждение: «${statement}»`,
  options: ["Верно", "Неверно"],
  answer: isTrue ? 0 : 1,
  explain,
});
