// Игровой движок EduQuest: чистые функции над состоянием ученика.
// Один и тот же код выполняется в демо-режиме (в браузере) и на сервере
// (API-маршрут при подключённом Supabase), поэтому правила начисления XP,
// Lumos и достижений нигде не дублируются.
import { dayKey, addDays, weekStartKey, dayStartIso } from "./time";
import { levelFromXp } from "./levels";
import { REWARDS, GAME_QUESTIONS, GAME_MAX_MISTAKES, EXAM_PASS_PERCENT, STREAK_MILESTONES, LUMOS_BOOST_MULTIPLIER } from "./economy";
import { getLesson, getCourse, getChapter, nextLessonId, examConfig } from "./content";
import { gradeAnswer, validateQuestionSet } from "./grading";
import { ACHIEVEMENTS, ACHIEVEMENT_MAP, achievementProgress } from "./achievements";
import { computeStats, computeStreak, subjectProgress } from "./stats";
import { dailyQuestStatus } from "./quests";
import { getItem, FREE_ITEMS, DEFAULT_EQUIPPED } from "./shop";
import { CAREER_QUESTIONS, scoreCareer } from "./career";
import { getQuestion } from "./content";

export class EngineError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const uid = () => globalThis.crypto.randomUUID();
const MAX_HISTORY = 100;
const MAX_NOTIFICATIONS = 30;

export const LANGUAGES = [
  { id: "ru", title: "Русский", available: true },
  { id: "uz", title: "Oʻzbekcha", available: false },
  { id: "en", title: "English", available: false },
];

export function createInitialState({ id, name, username, grade, now = new Date() }) {
  return normalizeState({
    profile: { id, name, username, grade, createdAt: now.toISOString() },
  });
}

/** Заполняет отсутствующие поля (старые сохранения, данные из БД). */
export function normalizeState(raw = {}) {
  const profile = raw.profile || {};
  return {
    version: 1,
    profile: {
      id: profile.id,
      name: profile.name || "Ученик",
      username: profile.username || "student",
      grade: profile.grade || 7,
      createdAt: profile.createdAt || new Date().toISOString(),
      language: profile.language || "ru",
      equipped: { ...DEFAULT_EQUIPPED, ...(profile.equipped || {}) },
      privacy: { isPublic: true, hideRealName: false, showInLeaderboard: true, ...(profile.privacy || {}) },
    },
    xp: raw.xp || 0,
    lumos: raw.lumos || 0,
    xpEvents: raw.xpEvents || [],
    lumosTx: raw.lumosTx || [],
    claims: raw.claims || {},
    lessons: raw.lessons || {},
    gameResults: raw.gameResults || [],
    exams: raw.exams || {},
    examResults: raw.examResults || [],
    achievements: raw.achievements || {},
    inventory: raw.inventory || {},
    boosts: { lumos: 0, ...(raw.boosts || {}) },
    activity: raw.activity || {},
    counters: raw.counters || {},
    career: raw.career || null,
    notifications: raw.notifications || [],
    lastLessonId: raw.lastLessonId || null,
  };
}

// ---------- Вспомогательные проверки доступа (используются и в интерфейсе) ----------

export function isLessonUnlocked(state, lessonId) {
  const lesson = getLesson(lessonId);
  if (!lesson) return false;
  if (lesson.index === 0) return true;
  const prev = getCourse(lesson.subjectId).lessons[lesson.index - 1];
  return Boolean(state.lessons?.[prev.id]?.completed);
}

export function isExamUnlocked(state, subjectId) {
  const course = getCourse(subjectId);
  return Boolean(course && course.lessons.every((l) => state.lessons?.[l.id]?.completed));
}

export function ownsItem(state, itemId) {
  return FREE_ITEMS.includes(itemId) || Boolean(state.inventory?.[itemId]?.qty);
}

export function weeklyXp(state, now = new Date()) {
  // Сравниваем как время, а не как строки: форматы ISO с «Z» и «+05:00» не сопоставимы лексикографически.
  const since = Date.parse(dayStartIso(weekStartKey(now)));
  return state.xpEvents.filter((e) => Date.parse(e.at) >= since).reduce((sum, e) => sum + e.amount, 0);
}

// ---------- Транзакция ----------

function begin(state, now) {
  const s = normalizeState(structuredClone(state));
  return { state: s, now, iso: now.toISOString(), day: dayKey(now), gains: [], unlocked: [], levelBefore: levelFromXp(s.xp) };
}

function dayStats(tx) {
  if (!tx.state.activity[tx.day]) tx.state.activity[tx.day] = {};
  return tx.state.activity[tx.day];
}

function bump(obj, key, by = 1) {
  obj[key] = (obj[key] || 0) + by;
}

function notify(tx, kind, title, text) {
  tx.state.notifications.unshift({ id: uid(), at: tx.iso, kind, title, text, read: false });
  tx.state.notifications = tx.state.notifications.slice(0, MAX_NOTIFICATIONS);
}

/** Единственная точка начисления наград. Повторный ключ — повторной награды нет. */
function grant(tx, key, { xp = 0, lumos = 0, label }) {
  if (tx.state.claims[key]) return false;
  tx.state.claims[key] = tx.iso;
  if (xp) {
    tx.state.xp += xp;
    tx.state.xpEvents.push({ id: uid(), amount: xp, reason: label, key, at: tx.iso });
    bump(dayStats(tx), "xp", xp);
  }
  if (lumos) {
    tx.state.lumos += lumos;
    tx.state.lumosTx.push({ id: uid(), amount: lumos, reason: label, key, at: tx.iso });
  }
  tx.gains.push({ key, label, xp, lumos });
  return true;
}

function checkStreak(tx) {
  const streak = computeStreak(tx.state.activity, tx.day);
  if (!streak.activeToday) return;
  const runStart = addDays(tx.day, -(streak.current - 1));
  for (const m of STREAK_MILESTONES) {
    if (streak.current >= m.days && grant(tx, `streak:${m.days}:${runStart}`, { lumos: m.lumos, label: `Серия ${m.days} дней` })) {
      notify(tx, "streak", `Серия ${m.days} дней! +${m.lumos} Lumos`, m.message);
    }
  }
}

function evaluateAchievements(tx) {
  for (let pass = 0; pass < 3; pass++) {
    const stats = computeStats(tx.state, tx.day);
    let changed = false;
    for (const a of ACHIEVEMENTS) {
      if (tx.state.achievements[a.id]) continue;
      if (!achievementProgress(a, stats).done) continue;
      tx.state.achievements[a.id] = tx.iso;
      grant(tx, `achievement:${a.id}`, { ...a.reward, label: `Достижение «${a.title}»` });
      tx.unlocked.push(a.id);
      notify(tx, "achievement", `Новое достижение: ${a.title}`, a.description);
      changed = true;
    }
    if (!changed) break;
  }
}

function commit(tx, result = {}) {
  evaluateAchievements(tx);
  const levelAfter = levelFromXp(tx.state.xp);
  const levelUp = levelAfter > tx.levelBefore ? { from: tx.levelBefore, to: levelAfter } : null;
  if (levelUp) notify(tx, "level", `Новый уровень: ${levelAfter}!`, "Продолжай в том же духе.");
  const totals = tx.gains.reduce((t, g) => ({ xp: t.xp + g.xp, lumos: t.lumos + g.lumos }), { xp: 0, lumos: 0 });
  tx.state.xpEvents = tx.state.xpEvents.slice(-500);
  tx.state.lumosTx = tx.state.lumosTx.slice(-500);
  return { state: tx.state, result: { ...result, gains: tx.gains, totals, unlocked: tx.unlocked, levelUp } };
}

// ---------- Действия ----------

function completeGame(tx, { lessonId, questionIds, answers }) {
  const lesson = getLesson(lessonId);
  if (!lesson) throw new EngineError("NOT_FOUND", "Урок не найден");
  if (!isLessonUnlocked(tx.state, lessonId)) throw new EngineError("LOCKED", "Сначала пройди предыдущий урок");
  const err = validateQuestionSet(questionIds, { lessonId, min: GAME_QUESTIONS, max: GAME_QUESTIONS });
  if (err) throw new EngineError("BAD_REQUEST", err);
  if (!Array.isArray(answers) || answers.length !== questionIds.length) throw new EngineError("BAD_REQUEST", "Нет ответов");

  const details = questionIds.map((id, i) => ({ id, correct: gradeAnswer(getQuestion(id), answers[i]) }));
  const correct = details.filter((d) => d.correct).length;
  const mistakes = GAME_QUESTIONS - correct;
  const passed = mistakes <= GAME_MAX_MISTAKES;
  const perfect = mistakes === 0;

  const s = tx.state;
  const day = dayStats(tx);
  bump(s.counters, "gamesPlayed");
  bump(s.counters, "correctAnswers", correct);
  bump(day, "games");
  bump(day, "correct", correct);

  const p = s.lessons[lessonId] || { attempts: 0 };
  const wasCompleted = Boolean(p.completed);
  p.attempts = (p.attempts || 0) + 1;
  p.lastAt = tx.iso;
  p.lastCorrect = correct;
  let chapterCompleted = null;
  let lessonXp = 0;

  if (passed) {
    bump(s.counters, "passedGames");
    bump(day, "passed");
    if (perfect) {
      bump(s.counters, "perfectGames");
      bump(day, "perfect");
    }
    if (wasCompleted || p.failures) bump(day, "reviews");
    if (!wasCompleted) {
      p.completed = true;
      p.completedAt = tx.iso;
      bump(day, "newTopics");
    }
    let lumos = REWARDS.lessonPass.lumos;
    const boosted = !s.claims[`lesson:${lessonId}:pass`] && s.boosts.lumos > 0;
    if (boosted) lumos = Math.round(lumos * LUMOS_BOOST_MULTIPLIER);
    if (grant(tx, `lesson:${lessonId}:pass`, { xp: REWARDS.lessonPass.xp, lumos, label: `${REWARDS.lessonPass.label}: ${lesson.title}${boosted ? " (усилитель)" : ""}` })) {
      lessonXp += REWARDS.lessonPass.xp;
      if (boosted) s.boosts.lumos -= 1;
    }
    if (perfect && grant(tx, `lesson:${lessonId}:perfect`, { ...REWARDS.lessonPerfect, label: `${REWARDS.lessonPerfect.label}: ${lesson.title}` })) {
      lessonXp += REWARDS.lessonPerfect.xp;
    }
    const chapter = getChapter(lesson.subjectId, lesson.chapterId);
    if (chapter.lessonIds.every((id) => s.lessons[id]?.completed || id === lessonId)) {
      if (grant(tx, `chapter:${chapter.id}`, { ...REWARDS.chapter, label: `${REWARDS.chapter.label}: ${chapter.title}` })) {
        chapterCompleted = chapter.title;
        lessonXp += REWARDS.chapter.xp;
        notify(tx, "reward", `Глава «${chapter.title}» завершена!`, `+${REWARDS.chapter.xp} XP и +${REWARDS.chapter.lumos} Lumos`);
      }
    }
    bump(day, "lessonXp", lessonXp);
  } else {
    p.failures = (p.failures || 0) + 1;
  }
  p.bestCorrect = Math.max(p.bestCorrect ?? 0, correct);
  if (perfect) p.perfect = true;
  s.lessons[lessonId] = p;
  s.lastLessonId = lessonId;

  const totalGain = tx.gains.reduce((t, g) => ({ xp: t.xp + g.xp, lumos: t.lumos + g.lumos }), { xp: 0, lumos: 0 });
  s.gameResults.push({ id: uid(), lessonId, correct, mistakes, total: GAME_QUESTIONS, passed, perfect, at: tx.iso, ...totalGain });
  s.gameResults = s.gameResults.slice(-MAX_HISTORY);
  checkStreak(tx);

  return {
    passed,
    perfect,
    correct,
    mistakes,
    total: GAME_QUESTIONS,
    details,
    alreadyCompleted: wasCompleted,
    chapterCompleted,
    nextLessonId: nextLessonId(lessonId),
    examUnlocked: passed && isExamUnlocked(s, lesson.subjectId) && !s.exams[lesson.subjectId]?.passed,
    subjectProgress: subjectProgress(s, lesson.subjectId),
  };
}

function submitExam(tx, { subjectId, questionIds, answers }) {
  const cfg = examConfig(subjectId);
  if (!cfg) throw new EngineError("NOT_FOUND", "Предмет не найден");
  if (!isExamUnlocked(tx.state, subjectId)) throw new EngineError("LOCKED", "Контрольная откроется после всех уроков предмета");
  const err = validateQuestionSet(questionIds, { subjectId, min: cfg.total, max: cfg.total });
  if (err) throw new EngineError("BAD_REQUEST", err);
  if (!Array.isArray(answers) || answers.length !== questionIds.length) throw new EngineError("BAD_REQUEST", "Нет ответов");

  const details = questionIds.map((id, i) => ({ id, correct: gradeAnswer(getQuestion(id), answers[i]) }));
  const correct = details.filter((d) => d.correct).length;
  const percent = Math.round((correct / cfg.total) * 100);
  const passed = percent >= EXAM_PASS_PERCENT;

  const weak = {};
  details.forEach((d) => {
    if (!d.correct) {
      const lid = getQuestion(d.id).lessonId;
      weak[lid] = (weak[lid] || 0) + 1;
    }
  });
  const weakLessons = Object.entries(weak)
    .sort((a, b) => b[1] - a[1])
    .map(([lessonId, count]) => ({ lessonId, count }));

  const s = tx.state;
  const day = dayStats(tx);
  bump(day, "exams");
  bump(day, "reviews");
  bump(day, "correct", correct);
  bump(s.counters, "examsTaken");

  const prev = s.exams[subjectId] || { attempts: 0, bestPercent: 0, passed: false };
  const firstPass = passed && !prev.passed;
  s.exams[subjectId] = {
    attempts: prev.attempts + 1,
    bestPercent: Math.max(prev.bestPercent, percent),
    passed: prev.passed || passed,
    passedAt: prev.passedAt || (passed ? tx.iso : null),
    lastPercent: percent,
  };
  if (passed) {
    grant(tx, `exam:${subjectId}:pass`, { ...REWARDS.examPass, label: REWARDS.examPass.label });
    if (percent === 100) grant(tx, `exam:${subjectId}:perfect`, { ...REWARDS.examPerfect, label: REWARDS.examPerfect.label });
  }
  const totalGain = tx.gains.reduce((t, g) => ({ xp: t.xp + g.xp, lumos: t.lumos + g.lumos }), { xp: 0, lumos: 0 });
  s.examResults.push({ id: uid(), subjectId, correct, total: cfg.total, percent, passed, at: tx.iso, ...totalGain });
  s.examResults = s.examResults.slice(-MAX_HISTORY);
  checkStreak(tx);

  return { percent, passed, firstPass, correct, total: cfg.total, details, weakLessons, threshold: EXAM_PASS_PERCENT };
}

function buyItem(tx, { itemId }) {
  const item = getItem(itemId);
  if (!item || item.price <= 0) throw new EngineError("NOT_FOUND", "Товар не найден");
  const s = tx.state;
  if (!item.consumable && ownsItem(s, itemId)) throw new EngineError("ALREADY_OWNED", "Этот предмет уже есть в инвентаре");
  if (s.lumos < item.price) throw new EngineError("INSUFFICIENT", `Не хватает Lumos: нужно ещё ${item.price - s.lumos}`);
  s.lumos -= item.price;
  s.lumosTx.push({ id: uid(), amount: -item.price, reason: `Покупка: ${item.name}`, key: `purchase:${uid()}`, at: tx.iso });
  const inv = s.inventory[itemId] || { qty: 0, acquiredAt: tx.iso };
  inv.qty += 1;
  s.inventory[itemId] = inv;
  if (item.id === "boost-lumos") s.boosts.lumos += item.charges;
  bump(s.counters, "purchases");
  return { item: { id: item.id, name: item.name }, balance: s.lumos };
}

function equipItem(tx, { slot, itemId }) {
  const s = tx.state;
  if (!(slot in DEFAULT_EQUIPPED)) throw new EngineError("BAD_REQUEST", "Неизвестный слот");
  if (itemId === null) {
    if (["avatar", "theme", "xpEffect"].includes(slot)) throw new EngineError("BAD_REQUEST", "Этот слот нельзя оставить пустым");
    s.profile.equipped[slot] = null;
    return { slot, itemId: null };
  }
  const item = getItem(itemId);
  if (!item || item.equipSlot !== slot) throw new EngineError("BAD_REQUEST", "Предмет нельзя надеть в этот слот");
  if (!ownsItem(s, itemId)) throw new EngineError("NOT_OWNED", "Сначала купи этот предмет");
  s.profile.equipped[slot] = itemId;
  return { slot, itemId };
}

function claimQuest(tx, { questId }) {
  const quest = dailyQuestStatus(tx.state, tx.day).find((q) => q.id === questId);
  if (!quest) throw new EngineError("NOT_FOUND", "Сегодня такого задания нет");
  if (!quest.done) throw new EngineError("NOT_READY", "Задание ещё не выполнено");
  if (!grant(tx, quest.key, { ...REWARDS.dailyQuest, label: `${REWARDS.dailyQuest.label}: ${quest.title}` })) {
    throw new EngineError("ALREADY_CLAIMED", "Награда уже получена");
  }
  bump(tx.state.counters, "questsClaimed");
  return { questId };
}

function saveCareer(tx, { answers }) {
  if (!Array.isArray(answers) || answers.length !== CAREER_QUESTIONS.length) throw new EngineError("BAD_REQUEST", "Ответь на все вопросы");
  answers.forEach((a, i) => {
    if (!Number.isInteger(a) || !CAREER_QUESTIONS[i].options[a]) throw new EngineError("BAD_REQUEST", "Некорректный ответ");
  });
  const ranking = scoreCareer(answers);
  tx.state.career = { answers, ranking, at: tx.iso };
  return { ranking };
}

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export function validateProfilePatch(patch) {
  const out = {};
  if ("name" in patch) {
    const name = String(patch.name).trim();
    if (name.length < 2 || name.length > 40) throw new EngineError("BAD_REQUEST", "Имя должно быть от 2 до 40 символов");
    out.name = name;
  }
  if ("username" in patch) {
    if (!USERNAME_RE.test(patch.username)) throw new EngineError("BAD_REQUEST", "Никнейм: 3–20 латинских букв, цифр или «_»");
    out.username = patch.username;
  }
  if ("grade" in patch) {
    const g = Number(patch.grade);
    if (!Number.isInteger(g) || g < 1 || g > 11) throw new EngineError("BAD_REQUEST", "Класс — от 1 до 11");
    out.grade = g;
  }
  if ("language" in patch) {
    if (!LANGUAGES.find((l) => l.id === patch.language && l.available)) throw new EngineError("BAD_REQUEST", "Этот язык пока недоступен");
    out.language = patch.language;
  }
  if ("privacy" in patch) {
    out.privacy = {};
    for (const k of ["isPublic", "hideRealName", "showInLeaderboard"]) {
      if (k in patch.privacy) out.privacy[k] = Boolean(patch.privacy[k]);
    }
  }
  return out;
}

function updateProfile(tx, patch) {
  const clean = validateProfilePatch(patch || {});
  const p = tx.state.profile;
  Object.assign(p, { ...clean, privacy: { ...p.privacy, ...(clean.privacy || {}) } });
  return { profile: p };
}

function viewLesson(tx, { lessonId }) {
  if (!getLesson(lessonId)) throw new EngineError("NOT_FOUND", "Урок не найден");
  if (!isLessonUnlocked(tx.state, lessonId)) throw new EngineError("LOCKED", "Сначала пройди предыдущий урок");
  const p = tx.state.lessons[lessonId] || { attempts: 0 };
  p.viewedAt = tx.iso;
  tx.state.lessons[lessonId] = p;
  tx.state.lastLessonId = lessonId;
  return {};
}

function readNotifications(tx) {
  tx.state.notifications.forEach((n) => (n.read = true));
  return {};
}

const ACTIONS = { completeGame, submitExam, buyItem, equipItem, claimQuest, saveCareer, updateProfile, viewLesson, readNotifications };
export const ACTION_TYPES = Object.keys(ACTIONS);

/** Выполняет действие и возвращает { state, result }. Исходное состояние не изменяется. */
export function runAction(state, type, payload = {}, now = new Date()) {
  const fn = ACTIONS[type];
  if (!fn) throw new EngineError("BAD_REQUEST", "Неизвестное действие");
  const tx = begin(state, now);
  const result = fn(tx, payload);
  return commit(tx, result);
}

export { ACHIEVEMENT_MAP };
