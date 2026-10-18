// Баланс игровой экономики. XP — прогресс и рейтинг, Lumos — валюта магазина.
// Lumos не имеет реальной денежной стоимости и никак не влияет на рейтинг.

export const GAME_QUESTIONS = 7;
export const GAME_MAX_MISTAKES = 3; // 4 и больше ошибок — тема не засчитана
export const EXAM_PASS_PERCENT = 80;

export const REWARDS = {
  lessonPass: { xp: 30, lumos: 20, label: "Урок пройден" },
  lessonPerfect: { xp: 10, lumos: 10, label: "Идеальный результат" },
  dailyQuest: { xp: 20, lumos: 15, label: "Ежедневное задание" },
  chapter: { xp: 100, lumos: 50, label: "Глава завершена" },
  examPass: { xp: 200, lumos: 100, label: "Итоговая контрольная сдана" },
  examPerfect: { xp: 0, lumos: 50, label: "Контрольная без ошибок" },
};

// Награды за серию — только Lumos, чтобы серия не искажала рейтинг.
export const STREAK_MILESTONES = [
  { days: 3, lumos: 30, message: "Три дня подряд — привычка начинает складываться!" },
  { days: 7, lumos: 70, message: "Целая неделя знаний! Так держать!" },
  { days: 14, lumos: 150, message: "Две недели без перерыва — это уже стиль жизни." },
  { days: 30, lumos: 300, message: "Месяц обучения! Ты — настоящий герой EduQuest." },
];

export const LUMOS_BOOST_MULTIPLIER = 1.5;

/** Очки внутри мини-игры (только для отображения, на рейтинг не влияют). */
export function gamePoints(correct, comboMax) {
  return correct * 100 + Math.max(0, comboMax - 1) * 25;
}
