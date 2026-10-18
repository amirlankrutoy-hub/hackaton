// Генерирует supabase/seed.sql из учебного контента (lib/content).
// Контент живёт в коде, а БД получает зеркальную копию каталога:
// npm run db:seed-sql
import { writeFileSync } from "node:fs";
import { SUBJECTS, getCourse, hasContent } from "../lib/content/index.js";
import { ACHIEVEMENTS } from "../lib/achievements.js";
import { SHOP_ITEMS } from "../lib/shop.js";
import { QUEST_POOL } from "../lib/quests.js";

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const j = (v) => `${q(JSON.stringify(v))}::jsonb`;
const lines = ["-- Сгенерировано scripts/export-seed-sql.mjs — не редактируйте вручную.", "begin;"];

for (const s of SUBJECTS) {
  lines.push(
    `insert into public.subjects (id, title, description, category, grade_from, grade_to, has_content) values (${q(s.id)}, ${q(s.title)}, ${q(s.description)}, ${q(s.category)}, ${s.grades[0]}, ${s.grades[1]}, ${hasContent(s.id)}) on conflict (id) do update set title = excluded.title, description = excluded.description, category = excluded.category, grade_from = excluded.grade_from, grade_to = excluded.grade_to, has_content = excluded.has_content;`
  );
  const course = getCourse(s.id);
  if (!course) continue;
  course.chapters.forEach((c, ci) => {
    lines.push(`insert into public.chapters (id, subject_id, title, position) values (${q(c.id)}, ${q(s.id)}, ${q(c.title)}, ${ci}) on conflict (id) do update set title = excluded.title, position = excluded.position;`);
  });
  for (const l of course.lessons) {
    lines.push(`insert into public.lessons (id, subject_id, chapter_id, title, grade, position, minutes) values (${q(l.id)}, ${q(s.id)}, ${q(l.chapterId)}, ${q(l.title)}, ${l.grade}, ${l.index}, ${l.minutes}) on conflict (id) do update set title = excluded.title, grade = excluded.grade, position = excluded.position, minutes = excluded.minutes;`);
    l.questions.forEach((qq, qi) => {
      const { id, lessonId, type, prompt, answer, ...rest } = qq;
      const correct = type === "match" ? qq.pairs.map((_, i) => i) : type === "order" ? qq.items.map((_, i) => i) : answer;
      lines.push(`insert into public.questions (id, lesson_id, type, prompt, payload, answer, position) values (${q(id)}, ${q(lessonId)}, ${q(type)}, ${q(prompt)}, ${j(rest)}, ${j(correct)}, ${qi}) on conflict (id) do update set type = excluded.type, prompt = excluded.prompt, payload = excluded.payload, answer = excluded.answer, position = excluded.position;`);
    });
  }
}
for (const a of ACHIEVEMENTS) {
  lines.push(`insert into public.achievements (id, title, description, condition, rarity, reward_xp, reward_lumos) values (${q(a.id)}, ${q(a.title)}, ${q(a.description)}, ${q(a.condition)}, ${q(a.rarity)}, ${a.reward.xp}, ${a.reward.lumos}) on conflict (id) do update set title = excluded.title, description = excluded.description, condition = excluded.condition, rarity = excluded.rarity, reward_xp = excluded.reward_xp, reward_lumos = excluded.reward_lumos;`);
}
for (const i of SHOP_ITEMS) {
  lines.push(`insert into public.shop_items (id, category, name, description, price, consumable) values (${q(i.id)}, ${q(i.category)}, ${q(i.name)}, ${q(i.description)}, ${i.price}, ${i.consumable}) on conflict (id) do update set name = excluded.name, description = excluded.description, price = excluded.price, consumable = excluded.consumable;`);
}
for (const d of QUEST_POOL) {
  lines.push(`insert into public.daily_quest_pool (id, title, metric, target) values (${q(d.id)}, ${q(d.title)}, ${q(d.metric)}, ${d.target}) on conflict (id) do update set title = excluded.title, metric = excluded.metric, target = excluded.target;`);
}
lines.push("commit;");
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), lines.join("\n") + "\n");
console.log(`supabase/seed.sql: ${lines.length - 3} строк`);
