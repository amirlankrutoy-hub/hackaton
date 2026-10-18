import { getLesson, getCourse, SUBJECTS, SUBJECTS_WITH_CONTENT, subjectAvailableForGrade, contentGrades } from "./content";
import { isLessonUnlocked } from "./engine";

/** Первый открытый, но не пройденный урок предмета. */
export function nextOpenLesson(state, subjectId) {
  const course = getCourse(subjectId);
  if (!course) return null;
  return course.lessons.find((l) => !state.lessons[l.id]?.completed && isLessonUnlocked(state, l.id)) || null;
}

/** Предметы с контентом, подходящие классу ученика (или все, если таких нет). */
export function subjectsForStudent(state) {
  const grade = state.profile.grade;
  const fit = SUBJECTS.filter((s) => SUBJECTS_WITH_CONTENT.includes(s.id) && subjectAvailableForGrade(s, grade));
  return fit.length ? fit : SUBJECTS.filter((s) => SUBJECTS_WITH_CONTENT.includes(s.id));
}

/** Урок, который стоит продолжить: последний открытый незавершённый. */
export function continueLesson(state) {
  const last = state.lastLessonId && getLesson(state.lastLessonId);
  if (last && !state.lessons[last.id]?.completed) return last;
  if (last) return nextOpenLesson(state, last.subjectId);
  return null;
}

/** Рекомендация: продолжить текущий предмет, затем начать новый предмет своего класса. */
export function recommendLesson(state) {
  const cont = continueLesson(state);
  if (cont) return { lesson: cont, reason: "Продолжи начатую тему" };
  const subjects = subjectsForStudent(state);
  const fresh = subjects.find((s) => !getCourse(s.id).lessons.some((l) => state.lessons[l.id]?.completed));
  if (fresh) {
    const grades = contentGrades(fresh.id);
    return { lesson: getCourse(fresh.id).lessons[0], reason: `Новый предмет для тебя · ${grades.join("–")} класс` };
  }
  for (const s of subjects) {
    const l = nextOpenLesson(state, s.id);
    if (l) return { lesson: l, reason: "Следующий шаг в курсе" };
  }
  return null;
}
