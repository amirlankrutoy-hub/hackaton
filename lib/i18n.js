// Словари интерфейса. Сейчас активен русский; узбекский и английский
// подключаются добавлением словаря и включением языка в LANGUAGES (lib/engine.js).
const ru = {
  "nav.diary": "Дневник",
  "nav.dashboard": "Главная",
  "nav.lessons": "Войти в уроки",
  "nav.mySubjects": "Мои предметы",
  "nav.games": "Мини-игры",
  "nav.leaderboard": "Глобальный рейтинг",
  "nav.achievements": "Достижения",
  "nav.shop": "Магазин",
  "nav.career": "Выбор профессии",
  "nav.profile": "Профиль",
  "nav.settings": "Настройки",
  "common.level": "Уровень",
  "common.start": "Начать",
  "common.continue": "Продолжить",
  "common.lessons": "уроков",
  "common.logout": "Выйти",
  "common.demo": "Демо-режим",
};

const dictionaries = { ru, uz: {}, en: {} };

export function t(key, lang = "ru") {
  return dictionaries[lang]?.[key] ?? ru[key] ?? key;
}
