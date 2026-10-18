// Достижения открываются автоматически (см. engine.evaluateAchievements),
// награда выдаётся один раз — ключ награды achievement:<id>.
import { SUBJECTS_WITH_CONTENT, getSubject, getCourse } from "./content";

export const RARITY = {
  common: { label: "Обычное", color: "#64748b", bg: "from-slate-100 to-slate-200", ring: "ring-slate-300" },
  rare: { label: "Редкое", color: "#2563eb", bg: "from-sky-100 to-blue-200", ring: "ring-blue-300" },
  epic: { label: "Эпическое", color: "#7c3aed", bg: "from-violet-100 to-fuchsia-200", ring: "ring-violet-300" },
  legendary: { label: "Легендарное", color: "#d97706", bg: "from-amber-100 to-yellow-200", ring: "ring-amber-300" },
};

const base = [
  { id: "first-step", title: "Первый шаг", icon: "🚀", rarity: "common", description: "Начало большого пути.", condition: "Завершить первый урок", reward: { xp: 10, lumos: 10 }, progress: (s) => [s.lessonsCompleted, 1] },
  { id: "perfect-answer", title: "Идеальный ответ", icon: "🎯", rarity: "rare", description: "Ни одной ошибки!", condition: "Пройти мини-игру без ошибок", reward: { xp: 20, lumos: 25 }, progress: (s) => [s.perfectGames, 1] },
  { id: "chem-genius", title: "Химический гений", icon: "⚗️", rarity: "epic", description: "Вещества тебе подвластны.", condition: "Пройти 10 этапов курса химии: 9 уроков и итоговую контрольную", reward: { xp: 50, lumos: 60 }, progress: (s) => [(s.perSubject.chemistry || 0) + (s.examPassedFor("chemistry") ? 1 : 0), 10] },
  { id: "mathematician", title: "Математик", icon: "📐", rarity: "rare", description: "Числа — твои друзья.", condition: "Завершить 5 уроков математики", reward: { xp: 30, lumos: 40 }, progress: (s) => [s.perSubject.math || 0, 5] },
  { id: "spark", title: "Огонёк", icon: "🔥", rarity: "common", description: "Привычка учиться зажглась.", condition: "Заниматься 3 дня подряд", reward: { xp: 0, lumos: 20 }, progress: (s) => [s.streak.best, 3] },
  { id: "unstoppable", title: "Неудержимый", icon: "⚡", rarity: "epic", description: "Неделя без перерывов!", condition: "Заниматься 7 дней подряд", reward: { xp: 40, lumos: 60 }, progress: (s) => [s.streak.best, 7] },
  { id: "bookworm", title: "Книжный червь", icon: "📚", rarity: "legendary", description: "Знания — твоя суперсила.", condition: "Успешно пройти 50 мини-игр (повторы тоже считаются)", reward: { xp: 100, lumos: 150 }, progress: (s) => [s.passedGames, 50] },
  { id: "explorer", title: "Исследователь", icon: "🧭", rarity: "rare", description: "Любопытство без границ.", condition: "Пройти хотя бы один урок в 5 разных предметах", reward: { xp: 40, lumos: 50 }, progress: (s) => [s.subjectsStudied, 5] },
  { id: "subject-expert", title: "Знаток предмета", icon: "🎓", rarity: "epic", description: "Первая победа над итоговым испытанием.", condition: "Сдать любую итоговую контрольную", reward: { xp: 50, lumos: 50 }, progress: (s) => [s.examsPassed, 1] },
  { id: "absolute-champion", title: "Абсолютный чемпион", icon: "🏆", rarity: "legendary", description: "Безупречно!", condition: "Сдать итоговую контрольную на 100%", reward: { xp: 100, lumos: 150 }, progress: (s) => [s.perfectExams, 1] },
  { id: "learning-master", title: "Мастер обучения", icon: "🧙", rarity: "legendary", description: "Высокий уровень — результат упорства.", condition: "Достичь 10 уровня", reward: { xp: 0, lumos: 200 }, progress: (s) => [s.level, 10] },
  { id: "hundred", title: "Сотня", icon: "💯", rarity: "rare", description: "Сто верных ответов.", condition: "Дать 100 правильных ответов в мини-играх", reward: { xp: 30, lumos: 40 }, progress: (s) => [s.correctAnswers, 100] },
  { id: "daily-hero", title: "Герой дня", icon: "🗓️", rarity: "rare", description: "Задания выполнены!", condition: "Выполнить 10 ежедневных заданий", reward: { xp: 30, lumos: 40 }, progress: (s) => [s.questsClaimed, 10] },
  { id: "self-discovery", title: "Самопознание", icon: "🔮", rarity: "common", description: "Первый шаг к выбору профессии.", condition: "Пройти тест «Кем стать?»", reward: { xp: 10, lumos: 20 }, progress: (s) => [s.careerDone ? 1 : 0, 1] },
  { id: "first-purchase", title: "Коллекционер", icon: "🛍️", rarity: "common", description: "Первая покупка за Lumos.", condition: "Купить любой предмет в магазине", reward: { xp: 0, lumos: 10 }, progress: (s) => [s.purchases, 1] },
];

// «Мастер предмета» — отдельное достижение и медаль для каждого курса.
// Открывается ТОЛЬКО после успешной сдачи итоговой контрольной (≥ 80%).
const masters = SUBJECTS_WITH_CONTENT.map((subjectId) => {
  const subject = getSubject(subjectId);
  return {
    id: `master-${subjectId}`,
    title: `Мастер предмета: ${subject.title}`,
    icon: "🏅",
    medal: subject.emoji,
    subjectId,
    rarity: "legendary",
    description: `Курс «${subject.title}» пройден полностью.`,
    condition: `Сдать итоговую контрольную по предмету «${subject.title}» на 80% и выше`,
    reward: { xp: 0, lumos: 0 }, // большая награда выдаётся за саму контрольную
    progress: (s) => [s.examPassedFor(subjectId) ? 1 : 0, 1],
    master: true,
    lessons: getCourse(subjectId).lessons.length,
  };
});

export const ACHIEVEMENTS = [...base, ...masters];
export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export function achievementProgress(a, stats) {
  const [current, target] = a.progress(stats);
  return { current: Math.min(current, target), target, done: current >= target, ratio: Math.min(1, current / target) };
}
