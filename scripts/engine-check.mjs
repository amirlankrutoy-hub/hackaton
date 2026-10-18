// Самопроверка игрового движка: npm run check:engine
// Проверяет правила, перечисленные в ТЗ: 4 ошибки из 7, отсутствие повторных
// наград, покупки, достижения, разблокировку и итоговую контрольную.
import assert from "node:assert/strict";
import { createInitialState, runAction, isLessonUnlocked, isExamUnlocked } from "../lib/engine.js";
import { getCourse, getQuestion, ALL_LESSONS, SUBJECTS_WITH_CONTENT, examConfig } from "../lib/content/index.js";
import { pickGameQuestions, pickExamQuestions, gradeAnswer } from "../lib/grading.js";
import { computeStreak } from "../lib/stats.js";
import { levelFromXp, xpForLevel } from "../lib/levels.js";

const right = (q) => (q.type === "match" ? q.pairs.map((_, i) => i) : q.type === "order" ? q.items.map((_, i) => i) : q.answer);
const wrong = (q) => (q.type === "match" ? q.pairs.map((_, i) => (i + 1) % q.pairs.length) : q.type === "order" ? [...q.items.keys()].reverse() : (q.answer + 1) % q.options.length);

function play(state, lessonId, mistakes, now) {
  const qs = pickGameQuestions(lessonId);
  const answers = qs.map((q, i) => (i < mistakes ? wrong(q) : right(q)));
  return runAction(state, "completeGame", { lessonId, questionIds: qs.map((q) => q.id), answers }, now);
}

let checks = 0;
const ok = (cond, msg) => {
  assert.ok(cond, msg);
  checks++;
};

// Контент: у каждого вопроса верный ответ проходит проверку, неверный — нет.
for (const lesson of ALL_LESSONS) {
  ok(lesson.questions.length >= 7, `${lesson.id}: мало вопросов`);
  for (const q of lesson.questions) {
    ok(gradeAnswer(q, right(q)), `${q.id}: верный ответ не принят`);
    ok(!gradeAnswer(q, wrong(q)), `${q.id}: неверный ответ принят`);
    if (q.options) ok(new Set(q.options).size === q.options.length, `${q.id}: повторяются варианты`);
    if (q.pairs) ok(new Set(q.pairs.map((p) => p[1])).size === q.pairs.length, `${q.id}: повторяются пары`);
  }
}

const now = new Date("2026-10-18T10:00:00+05:00");
let s = createInitialState({ id: "u1", name: "Тест", username: "test", grade: 7, now });

// Блокировка второго урока.
ok(!isLessonUnlocked(s, "chem-substances"), "второй урок должен быть закрыт");
assert.throws(() => play(s, "chem-substances", 0, now), /предыдущий урок/);

// 4 ошибки — провал, без наград.
let r = play(s, "chem-intro", 4, now);
ok(!r.result.passed && r.result.totals.xp === 0 && r.state.xp === 0, "4 ошибки должны означать провал без XP");
s = r.state;

// 3 ошибки — успех, 30 XP + 20 Lumos (+ достижение «Первый шаг»).
r = play(s, "chem-intro", 3, now);
ok(r.result.passed, "3 ошибки — урок пройден");
ok(r.result.unlocked.includes("first-step"), "должно открыться «Первый шаг»");
const xpAfterFirst = r.state.xp;
ok(xpAfterFirst === 30 + 10, `XP после первого урока: ${xpAfterFirst}`);
s = r.state;

// Повтор: награды не дублируются, но идеальный результат даёт бонус один раз.
r = play(s, "chem-intro", 0, now);
ok(r.result.gains.some((g) => g.key === "lesson:chem-intro:perfect"), "бонус за идеальный результат");
ok(!r.result.gains.some((g) => g.key === "lesson:chem-intro:pass"), "повторной награды за урок быть не должно");
s = r.state;
r = play(s, "chem-intro", 0, now);
ok(r.result.totals.xp === 0 && r.result.totals.lumos === 0, "третье прохождение без наград");
s = r.state;
ok(isLessonUnlocked(s, "chem-substances"), "следующий урок открылся");

// Покупки.
const balance = s.lumos;
assert.throws(() => runAction(s, "buyItem", { itemId: "costume-crown" }, now), /Не хватает Lumos/);
r = runAction(s, "buyItem", { itemId: "avatar-panda" }, now);
ok(r.state.lumos === balance - 60 + 10, "списание Lumos (+10 за достижение «Коллекционер»)");
s = r.state;
assert.throws(() => runAction(s, "buyItem", { itemId: "avatar-panda" }, now), /уже есть/);
s = runAction(s, "equipItem", { slot: "avatar", itemId: "avatar-panda" }, now).state;
ok(s.profile.equipped.avatar === "avatar-panda", "аватар надет");
ok(s.achievements["first-purchase"], "достижение за покупку");

// Весь курс химии + контрольная.
for (const l of getCourse("chemistry").lessons) {
  if (!s.lessons[l.id]?.completed) s = play(s, l.id, 1, now).state;
}
ok(isExamUnlocked(s, "chemistry"), "контрольная открыта");
const cfg = examConfig("chemistry");
const exam = pickExamQuestions("chemistry");
ok(exam.length === cfg.total && cfg.total >= 15 && cfg.total <= 25, "размер контрольной");
// 70% — не сдана, «Мастер предмета» не открывается.
const fails = Math.ceil(exam.length * 0.3);
r = runAction(s, "submitExam", { subjectId: "chemistry", questionIds: exam.map((q) => q.id), answers: exam.map((q, i) => (i < fails ? wrong(q) : right(q))) }, now);
ok(!r.result.passed && !r.state.achievements["master-chemistry"], "без 80% нет мастера");
ok(r.result.weakLessons.length > 0, "есть темы для повторения");
s = r.state;
r = runAction(s, "submitExam", { subjectId: "chemistry", questionIds: exam.map((q) => q.id), answers: exam.map(right) }, now);
ok(r.result.passed && r.result.percent === 100, "контрольная сдана на 100%");
ok(r.state.achievements["master-chemistry"] && r.state.achievements["absolute-champion"] && r.state.achievements["chem-genius"], "достижения за контрольную");
const xpExam = r.result.totals.xp;
s = r.state;
r = runAction(s, "submitExam", { subjectId: "chemistry", questionIds: exam.map((q) => q.id), answers: exam.map(right) }, now);
ok(r.result.totals.xp === 0, "повторная сдача без наград");
ok(xpExam >= 200, "большая награда XP за контрольную");

// Ежедневные задания: нельзя забрать дважды.
const day = r.state;
const { dailyQuestStatus } = await import("../lib/quests.js");
const done = dailyQuestStatus(day, "2026-10-18").filter((q) => q.done);
if (done.length) {
  const after = runAction(day, "claimQuest", { questId: done[0].id }, now).state;
  assert.throws(() => runAction(after, "claimQuest", { questId: done[0].id }, now), /уже получена/);
  checks++;
}

// Серия: несколько действий в один день не увеличивают серию дважды.
const act = { "2026-10-16": { games: 1 }, "2026-10-17": { games: 3 }, "2026-10-18": { games: 5 } };
ok(computeStreak(act, "2026-10-18").current === 3, "серия 3 дня");
ok(computeStreak(act, "2026-10-19").current === 3, "серия сохраняется до конца следующего дня");
ok(computeStreak(act, "2026-10-20").current === 0, "серия прерывается после пропуска");

// Уровни.
ok(levelFromXp(0) === 1 && levelFromXp(xpForLevel(2)) === 2 && levelFromXp(xpForLevel(2) - 1) === 1, "уровни");

// Все предметы с контентом имеют контрольную 15–25 вопросов.
for (const id of SUBJECTS_WITH_CONTENT) {
  const c = examConfig(id);
  ok(c.total >= 15 && c.total <= 25 && pickExamQuestions(id).length === c.total, `${id}: контрольная`);
}
ok(getQuestion("chem-intro:0"), "реестр вопросов");

// Дневник: расписание на день, обновление на следующий день, выходной.
{
  const { daySchedule, gradeFor } = await import("../lib/schedule.js");
  const now2 = new Date("2026-10-19T09:00:00+05:00"); // понедельник
  let st = createInitialState({ id: "u2", name: "Дневник", username: "diary", grade: 7, now: now2 });
  const mon = daySchedule(st, "2026-10-19", "2026-10-19");
  ok(!mon.dayOff && mon.slots.length === 4, "4 урока в понедельник");
  ok(daySchedule(st, "2026-10-25", "2026-10-19").dayOff, "воскресенье — выходной");
  const orders = ["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24"].map((d) => daySchedule(st, d, "2026-10-19").slots.map((x) => x.subjectId).join());
  ok(new Set(orders).size > 1, "расписание меняется от дня к дню");
  const first = mon.slots.find((x) => x.kind === "lesson" && x.status === "todo");
  ok(first, "есть урок для входа");
  st = play(st, first.lessonId, 0, now2).state;
  const monAfter = daySchedule(st, "2026-10-19", "2026-10-19").slots.find((x) => x.n === first.n);
  ok(monAfter.status === "done" && monAfter.grade === 5 && monAfter.lessonId === first.lessonId, "сегодняшний урок остаётся в расписании с оценкой 5");
  const tue = daySchedule(st, "2026-10-20", "2026-10-19").slots.filter((x) => x.subjectId === first.subjectId);
  ok(tue.every((x) => x.lessonId !== first.lessonId), "завтра по этому предмету — следующая тема");
  ok(gradeFor(7) === 5 && gradeFor(5) === 4 && gradeFor(4) === 3, "пятибалльные оценки");
  const dup = daySchedule(st, "2026-10-21", "2026-10-19").slots.filter((x) => x.kind === "lesson");
  ok(new Set(dup.map((x) => x.lessonId)).size === dup.length, "в один день тема не повторяется");
  const lockedSlot = daySchedule(createInitialState({ id: "u3", name: "a", username: "aaa", grade: 7, now: now2 }), "2026-10-19", "2026-10-19").slots.find((x) => x.status === "locked");
  if (lockedSlot) ok(lockedSlot.lockedBy, "закрытый урок знает, что пройти перед ним");
}

console.log(`✔ Движок EduQuest: ${checks} проверок пройдено`);
