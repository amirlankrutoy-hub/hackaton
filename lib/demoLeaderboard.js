// ТЕСТОВЫЕ ДАННЫЕ для демо-режима. Это вымышленные ученики, в интерфейсе они
// всегда помечены значком «демо». При подключённом Supabase не используются.
const raw = [
  ["Азиза", "aziza_star", "avatar-unicorn", "frame-rainbow", 3420, 410, 31, 9],
  ["Тимур", "timur_math", "avatar-tiger", "frame-gold", 3050, 280, 28, 8],
  ["Мадина", "madina_bio", "avatar-koala", "frame-crystal", 2780, 520, 27, 7],
  ["Жасур", "jasur_dev", "avatar-robot", "frame-neon", 2510, 190, 24, 10],
  ["Нилуфар", "nilufar_ok", "avatar-cat", null, 2200, 340, 22, 7],
  ["Бобур", "bobur07", "avatar-dragon", "frame-gold", 1980, 150, 20, 8],
  ["Севара", "sevara_chem", "avatar-panda", null, 1760, 300, 18, 7],
  ["Санжар", "sanjar_phys", "avatar-astronaut", "frame-neon", 1540, 120, 16, 9],
  ["Камила", "kamila_eng", "avatar-penguin", null, 1320, 260, 14, 6],
  ["Отабек", "otabek_hist", "avatar-fox", null, 1150, 90, 12, 8],
  ["Дилноза", "dilnoza", "avatar-unicorn", null, 980, 210, 11, 5],
  ["Шахзод", "shahzod_it", "avatar-robot", null, 860, 140, 10, 7],
  ["Малика", "malika_m", "avatar-cat", null, 720, 180, 9, 6],
  ["Улугбек", "ulugbek_astro", "avatar-astronaut", null, 610, 60, 8, 9],
  ["Лола", "lola_reads", "avatar-koala", null, 480, 110, 6, 5],
  ["Фаррух", "farrukh", "avatar-panda", null, 390, 40, 5, 7],
  ["Зарина", "zarina_z", "avatar-penguin", null, 270, 90, 4, 6],
  ["Ислом", "islom_go", "avatar-tiger", null, 160, 30, 2, 8],
];

export const DEMO_STUDENTS = raw.map(([name, username, avatar, frame, xp, weeklyXp, lessonsCompleted, grade], i) => ({
  id: `demo-${i + 1}`,
  name,
  username,
  avatar,
  frame,
  xp,
  weeklyXp,
  lessonsCompleted,
  grade,
  demo: true,
}));
