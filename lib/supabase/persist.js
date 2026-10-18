// Преобразование состояния ученика <-> строки таблиц Supabase.
// Сервер загружает состояние, выполняет действие движка (lib/engine.js)
// и записывает только изменившиеся строки.
import { normalizeState } from "../engine";

export class ConflictError extends Error {}

const by = (rows, key) => Object.fromEntries((rows || []).map((r) => [r[key], r]));

export async function loadUserState(admin, userId) {
  const q = (table, cols = "*") => admin.from(table).select(cols).eq("user_id", userId);
  const [profile, lessons, games, examP, examR, xp, lumos, claims, ach, inv, act, career, notes] = await Promise.all([
    admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
    q("lesson_progress"),
    q("game_results").order("at", { ascending: false }).limit(100),
    q("exam_progress"),
    q("exam_results").order("at", { ascending: false }).limit(100),
    q("xp_events").order("at", { ascending: false }).limit(500),
    q("lumos_transactions").order("at", { ascending: false }).limit(500),
    q("reward_claims", "key, at"),
    q("user_achievements"),
    q("inventory"),
    q("activity_days").order("day", { ascending: false }).limit(1000),
    q("career_results").order("at", { ascending: false }).limit(1),
    q("notifications").order("at", { ascending: false }).limit(30),
  ]);
  const failed = [profile, lessons, games, examP, examR, xp, lumos, claims, ach, inv, act, career, notes].find((r) => r.error);
  if (failed) throw failed.error;
  const p = profile.data;
  if (!p) return null;

  const state = normalizeState({
    profile: {
      id: p.id,
      name: p.name,
      username: p.username,
      grade: p.grade,
      language: p.language,
      createdAt: p.created_at,
      equipped: p.equipped,
      privacy: { isPublic: p.is_public, hideRealName: p.hide_real_name, showInLeaderboard: p.show_in_leaderboard },
    },
    xp: p.xp,
    lumos: p.lumos,
    boosts: p.boosts,
    counters: p.counters,
    lastLessonId: p.last_lesson_id,
    lessons: Object.fromEntries(
      lessons.data.map((r) => [
        r.lesson_id,
        clean({
          completed: r.completed,
          bestCorrect: r.best_correct,
          lastCorrect: r.last_correct,
          attempts: r.attempts,
          failures: r.failures,
          perfect: r.perfect,
          viewedAt: r.viewed_at,
          completedAt: r.completed_at,
          lastAt: r.last_at,
        }),
      ])
    ),
    gameResults: games.data.reverse().map((r) => ({ id: r.id, lessonId: r.lesson_id, correct: r.correct, mistakes: r.mistakes, total: r.total, passed: r.passed, perfect: r.perfect, xp: r.xp, lumos: r.lumos, at: r.at })),
    exams: Object.fromEntries(examP.data.map((r) => [r.subject_id, { attempts: r.attempts, bestPercent: r.best_percent, lastPercent: r.last_percent, passed: r.passed, passedAt: r.passed_at }])),
    examResults: examR.data.reverse().map((r) => ({ id: r.id, subjectId: r.subject_id, correct: r.correct, total: r.total, percent: r.percent, passed: r.passed, xp: r.xp, lumos: r.lumos, at: r.at })),
    xpEvents: xp.data.reverse().map(({ id, amount, reason, key, at }) => ({ id, amount, reason, key, at })),
    lumosTx: lumos.data.reverse().map(({ id, amount, reason, key, at }) => ({ id, amount, reason, key, at })),
    claims: Object.fromEntries(claims.data.map((r) => [r.key, r.at])),
    achievements: Object.fromEntries(ach.data.map((r) => [r.achievement_id, r.unlocked_at])),
    inventory: Object.fromEntries(inv.data.map((r) => [r.item_id, { qty: r.qty, acquiredAt: r.acquired_at }])),
    activity: Object.fromEntries(act.data.map((r) => [r.day, r.stats])),
    career: career.data[0] ? { answers: career.data[0].answers, ranking: career.data[0].ranking, at: career.data[0].at } : null,
    notifications: notes.data.map(({ id, kind, title, text, read, at }) => ({ id, kind, title, text, read, at })),
  });
  return { state, version: p.version };
}

function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined));
}

function added(before, after) {
  const ids = new Set(before.map((x) => x.id));
  return after.filter((x) => !ids.has(x.id));
}

function changedKeys(before, after) {
  return Object.keys(after).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
}

async function run(promise) {
  const { error } = await promise;
  if (error) throw error;
}

export async function saveUserState(admin, userId, before, after, version) {
  const p = after.profile;
  const lessonsCompleted = Object.values(after.lessons).filter((l) => l.completed).length;

  // 1. Профиль с проверкой версии: параллельные запросы не перезапишут друг друга.
  const { data, error } = await admin
    .from("profiles")
    .update({
      name: p.name,
      username: p.username,
      grade: p.grade,
      language: p.language,
      equipped: p.equipped,
      is_public: p.privacy.isPublic,
      hide_real_name: p.privacy.hideRealName,
      show_in_leaderboard: p.privacy.showInLeaderboard,
      xp: after.xp,
      lumos: after.lumos,
      lessons_completed: lessonsCompleted,
      boosts: after.boosts,
      counters: after.counters,
      last_lesson_id: after.lastLessonId,
      version: version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .eq("version", version)
    .select("version");
  if (error) throw error;
  if (!data?.length) throw new ConflictError("Состояние изменилось, повторите действие");

  const uid = { user_id: userId };
  const ops = [];

  // 2. Ключи наград — первичный ключ (user_id, key) не даст начислить дважды.
  const newClaims = Object.keys(after.claims).filter((k) => !before.claims[k]);
  if (newClaims.length) ops.push(admin.from("reward_claims").insert(newClaims.map((key) => ({ ...uid, key, at: after.claims[key] }))));

  const xpNew = added(before.xpEvents, after.xpEvents);
  if (xpNew.length) ops.push(admin.from("xp_events").insert(xpNew.map((e) => ({ ...uid, ...e }))));
  const lumosNew = added(before.lumosTx, after.lumosTx);
  if (lumosNew.length) ops.push(admin.from("lumos_transactions").insert(lumosNew.map((e) => ({ ...uid, ...e }))));

  const games = added(before.gameResults, after.gameResults);
  if (games.length) {
    ops.push(
      admin.from("game_results").insert(
        games.map((g) => ({ ...uid, id: g.id, lesson_id: g.lessonId, correct: g.correct, mistakes: g.mistakes, total: g.total, passed: g.passed, perfect: g.perfect, xp: g.xp, lumos: g.lumos, at: g.at }))
      )
    );
  }
  const exams = added(before.examResults, after.examResults);
  if (exams.length) {
    ops.push(
      admin.from("exam_results").insert(
        exams.map((e) => ({ ...uid, id: e.id, subject_id: e.subjectId, correct: e.correct, total: e.total, percent: e.percent, passed: e.passed, xp: e.xp, lumos: e.lumos, at: e.at }))
      )
    );
  }

  const lessonKeys = changedKeys(before.lessons, after.lessons);
  if (lessonKeys.length) {
    ops.push(
      admin.from("lesson_progress").upsert(
        lessonKeys.map((id) => {
          const l = after.lessons[id];
          return {
            ...uid,
            lesson_id: id,
            completed: Boolean(l.completed),
            best_correct: l.bestCorrect ?? null,
            last_correct: l.lastCorrect ?? null,
            attempts: l.attempts || 0,
            failures: l.failures || 0,
            perfect: Boolean(l.perfect),
            viewed_at: l.viewedAt || null,
            completed_at: l.completedAt || null,
            last_at: l.lastAt || null,
          };
        })
      )
    );
  }

  const examKeys = changedKeys(before.exams, after.exams);
  if (examKeys.length) {
    ops.push(
      admin.from("exam_progress").upsert(
        examKeys.map((id) => {
          const e = after.exams[id];
          return { ...uid, subject_id: id, attempts: e.attempts, best_percent: e.bestPercent, last_percent: e.lastPercent ?? null, passed: e.passed, passed_at: e.passedAt || null };
        })
      )
    );
  }

  const achNew = Object.keys(after.achievements).filter((k) => !before.achievements[k]);
  if (achNew.length) ops.push(admin.from("user_achievements").insert(achNew.map((id) => ({ ...uid, achievement_id: id, unlocked_at: after.achievements[id] }))));

  const invKeys = changedKeys(before.inventory, after.inventory);
  if (invKeys.length) ops.push(admin.from("inventory").upsert(invKeys.map((id) => ({ ...uid, item_id: id, qty: after.inventory[id].qty, acquired_at: after.inventory[id].acquiredAt }))));

  const dayKeys = changedKeys(before.activity, after.activity);
  if (dayKeys.length) ops.push(admin.from("activity_days").upsert(dayKeys.map((day) => ({ ...uid, day, stats: after.activity[day] }))));

  if (after.career && after.career.at !== before.career?.at) {
    ops.push(admin.from("career_results").insert({ ...uid, answers: after.career.answers, ranking: after.career.ranking, at: after.career.at }));
  }

  const notesNew = added(before.notifications, after.notifications);
  if (notesNew.length) ops.push(admin.from("notifications").insert(notesNew.map((n) => ({ ...uid, ...n }))));
  const readIds = after.notifications.filter((n) => n.read && before.notifications.find((b) => b.id === n.id && !b.read)).map((n) => n.id);
  if (readIds.length) ops.push(admin.from("notifications").update({ read: true }).eq("user_id", userId).in("id", readIds));

  for (const op of ops) await run(op);
}
