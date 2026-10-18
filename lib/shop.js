// Витрина магазина Lumos. Покупки только за внутриигровую валюту,
// реальных платежей нет. Ни один товар не даёт XP — рейтинг остаётся честным.

export const SHOP_CATEGORIES = [
  { id: "avatar", title: "Аватары", icon: "Smile" },
  { id: "costume", title: "Костюмы для Луми", icon: "Shirt" },
  { id: "frame", title: "Рамки профиля", icon: "Frame" },
  { id: "effect", title: "Эффекты наград", icon: "Sparkles" },
  { id: "theme", title: "Темы интерфейса", icon: "Palette" },
  { id: "banner", title: "Украшения профиля", icon: "Image" },
  { id: "boost", title: "Бонусы", icon: "Zap" },
];

// equipSlot — поле профиля, в которое «надевается» предмет.
const SLOT = { avatar: "avatar", costume: "costume", frame: "frame", effect: "xpEffect", theme: "theme", banner: "banner" };

const items = [
  // Аватары
  { id: "avatar-fox", category: "avatar", name: "Лисёнок", description: "Хитрый и любопытный исследователь.", price: 0, emoji: "🦊", bg: ["#fb923c", "#f43f5e"] },
  { id: "avatar-cat", category: "avatar", name: "Котёнок", description: "Любит уютные вечера с книгой.", price: 0, emoji: "🐱", bg: ["#60a5fa", "#a78bfa"] },
  { id: "avatar-panda", category: "avatar", name: "Панда", description: "Спокойствие и сосредоточенность.", price: 60, emoji: "🐼", bg: ["#94a3b8", "#334155"] },
  { id: "avatar-tiger", category: "avatar", name: "Тигр", description: "Смелость в каждом ответе.", price: 90, emoji: "🐯", bg: ["#f59e0b", "#ea580c"] },
  { id: "avatar-penguin", category: "avatar", name: "Пингвин", description: "Не боится сложных задач.", price: 90, emoji: "🐧", bg: ["#38bdf8", "#1d4ed8"] },
  { id: "avatar-koala", category: "avatar", name: "Коала", description: "Неспешно, но всегда до конца.", price: 120, emoji: "🐨", bg: ["#a3e635", "#16a34a"] },
  { id: "avatar-robot", category: "avatar", name: "Робот", description: "Для будущих инженеров и программистов.", price: 150, emoji: "🤖", bg: ["#22d3ee", "#4f46e5"] },
  { id: "avatar-astronaut", category: "avatar", name: "Космонавт", description: "Мечтает о звёздах, как Улугбек.", price: 200, emoji: "🧑‍🚀", bg: ["#6366f1", "#0f172a"] },
  { id: "avatar-unicorn", category: "avatar", name: "Единорог", description: "Редкий и волшебный.", price: 260, emoji: "🦄", bg: ["#f0abfc", "#8b5cf6"] },
  { id: "avatar-dragon", category: "avatar", name: "Дракон", description: "Легендарный хранитель знаний.", price: 350, emoji: "🐉", bg: ["#10b981", "#065f46"] },

  // Костюмы для AI-учителя
  { id: "costume-glasses", category: "costume", name: "Очки учёного", description: "Луми становится ещё умнее на вид.", price: 60 },
  { id: "costume-cap", category: "costume", name: "Шапочка выпускника", description: "Для тех, кто идёт к диплому.", price: 90 },
  { id: "costume-headphones", category: "costume", name: "Наушники", description: "Луми слушает музыку знаний.", price: 120 },
  { id: "costume-scarf", category: "costume", name: "Тёплый шарф", description: "Уютный бирюзовый шарф.", price: 100 },
  { id: "costume-wizard", category: "costume", name: "Шляпа мудреца", description: "Звёздная шляпа волшебника науки.", price: 220 },
  { id: "costume-crown", category: "costume", name: "Корона", description: "Для настоящих королей и королев учёбы.", price: 380 },

  // Рамки
  { id: "frame-gold", category: "frame", name: "Золотая рамка", description: "Блестящая рамка аватара.", price: 80, ring: "linear-gradient(135deg,#fde047,#f59e0b,#fde047)" },
  { id: "frame-neon", category: "frame", name: "Неон", description: "Яркое бирюзовое свечение.", price: 120, ring: "linear-gradient(135deg,#22d3ee,#a855f7)" },
  { id: "frame-crystal", category: "frame", name: "Кристалл Lumos", description: "Рамка из светящихся кристаллов.", price: 180, ring: "conic-gradient(from 0deg,#67e8f9,#818cf8,#c084fc,#67e8f9)" },
  { id: "frame-rainbow", category: "frame", name: "Радуга", description: "Все цвета знаний вокруг аватара.", price: 240, ring: "conic-gradient(#ef4444,#f59e0b,#eab308,#22c55e,#06b6d4,#6366f1,#a855f7,#ef4444)" },

  // Эффекты наград
  { id: "effect-stars", category: "effect", name: "Звёзды", description: "Классический звездопад при наградах.", price: 0, particles: ["⭐", "✨", "🌟"] },
  { id: "effect-crystals", category: "effect", name: "Кристаллы", description: "Дождь из кристаллов Lumos.", price: 120, particles: ["💎", "🔷", "✨"] },
  { id: "effect-hearts", category: "effect", name: "Сердечки", description: "Нежный дождь сердечек.", price: 100, particles: ["💖", "💜", "💙"] },
  { id: "effect-fireworks", category: "effect", name: "Фейерверк", description: "Праздничный салют за каждую победу.", price: 200, particles: ["🎆", "🎇", "🎉"] },

  // Темы
  { id: "theme-default", category: "theme", name: "Небо EduQuest", description: "Фирменная сине-голубая тема.", price: 0, swatch: ["#2563eb", "#7c3aed", "#06b6d4"] },
  { id: "theme-ocean", category: "theme", name: "Океан", description: "Бирюзовые волны и прохлада.", price: 200, swatch: ["#0891b2", "#0d9488", "#38bdf8"] },
  { id: "theme-sunset", category: "theme", name: "Закат над Регистаном", description: "Тёплые оранжевые оттенки.", price: 200, swatch: ["#ea580c", "#db2777", "#f59e0b"] },
  { id: "theme-forest", category: "theme", name: "Чаткальский лес", description: "Свежая зелень гор.", price: 200, swatch: ["#16a34a", "#0f766e", "#84cc16"] },
  { id: "theme-cosmos", category: "theme", name: "Космос", description: "Глубокий фиолетовый космос.", price: 260, swatch: ["#7c3aed", "#4338ca", "#c026d3"] },

  // Украшения профиля (баннеры)
  { id: "banner-mountains", category: "banner", name: "Горы Чимгана", description: "Баннер профиля с горными вершинами.", price: 100, gradient: "linear-gradient(135deg,#0ea5e9,#6366f1 60%,#1e1b4b)", emoji: "🏔️" },
  { id: "banner-silkroad", category: "banner", name: "Шёлковый путь", description: "Караван на закате.", price: 150, gradient: "linear-gradient(135deg,#f59e0b,#ea580c 55%,#7c2d12)", emoji: "🐫" },
  { id: "banner-galaxy", category: "banner", name: "Галактика", description: "Звёзды обсерватории Улугбека.", price: 180, gradient: "linear-gradient(135deg,#312e81,#7c3aed 50%,#db2777)", emoji: "🌌" },
  { id: "banner-aurora", category: "banner", name: "Северное сияние", description: "Переливы бирюзы и зелени.", price: 220, gradient: "linear-gradient(135deg,#10b981,#06b6d4 50%,#8b5cf6)", emoji: "🌠" },

  // Бонусы (расходуемые). XP-бустеров нет намеренно: рейтинг зависит только от учёбы.
  { id: "boost-lumos", category: "boost", name: "Усилитель Lumos ×1,5", description: "+50% Lumos за 3 следующих впервые пройденных урока. На XP и рейтинг не влияет.", price: 50, consumable: true, charges: 3 },
];

export const SHOP_ITEMS = items.map((i) => ({ ...i, equipSlot: SLOT[i.category] || null, consumable: Boolean(i.consumable) }));
export const SHOP_MAP = Object.fromEntries(SHOP_ITEMS.map((i) => [i.id, i]));
export const FREE_ITEMS = SHOP_ITEMS.filter((i) => i.price === 0).map((i) => i.id);

export function getItem(id) {
  return SHOP_MAP[id] || null;
}

export const DEFAULT_EQUIPPED = {
  avatar: "avatar-fox",
  costume: null,
  frame: null,
  xpEffect: "effect-stars",
  theme: "theme-default",
  banner: null,
};
