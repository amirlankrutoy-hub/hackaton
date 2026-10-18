"use client";
import { useId, useState } from "react";
import { Sun, Moon, RotateCcw, Play, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { Em, Emoji, SvgEmoji } from "@/components/ui/Emoji";

// ---------- Карточки ключевых понятий ----------
export function Cards({ items = [] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((it, i) => (
        <div key={i} className="animate-rise rounded-2xl bg-linear-to-br from-white to-brand-soft p-3 ring-1 ring-slate-200/70" style={{ animationDelay: `${i * 80}ms` }}>
          <span className="text-2xl"><Em t={it.icon} /></span>
          <p className="mt-1 font-extrabold leading-tight">{it.title}</p>
          <p className="text-xs text-slate-500">{it.text}</p>
        </div>
      ))}
    </div>
  );
}

// ---------- Клетка ----------
const ORGANELLES = {
  membrane: { name: "Мембрана", text: "Тонкая оболочка: защищает клетку и пропускает нужные вещества." },
  wall: { name: "Клеточная стенка", text: "Прочный каркас из целлюлозы — только у растений." },
  cytoplasm: { name: "Цитоплазма", text: "Полужидкое содержимое, в котором находятся все органоиды." },
  nucleus: { name: "Ядро", text: "Хранит наследственную информацию (ДНК) и управляет клеткой." },
  mito: { name: "Митохондрия", text: "«Электростанция» клетки: вырабатывает энергию." },
  chloro: { name: "Хлоропласт", text: "Зелёный органоид, в нём идёт фотосинтез. Только у растений." },
  vacuole: { name: "Вакуоль", text: "Запасает воду и вещества. У растений — крупная, с клеточным соком." },
};

export function Cell() {
  const [plant, setPlant] = useState(true);
  const [sel, setSel] = useState("nucleus");
  const hit = (id) => ({ onClick: () => setSel(id), className: `cursor-pointer transition ${sel === id ? "opacity-100" : "opacity-90 hover:opacity-100"}`, style: { filter: sel === id ? "drop-shadow(0 0 6px rgb(37 99 235 / .8))" : "none" } });
  return (
    <div>
      <div className="mb-2 flex gap-2">
        <button onClick={() => setPlant(true)} className={`flex-1 rounded-xl py-2 text-sm font-extrabold ${plant ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`}>
          <Emoji e="🌿" /> Растительная
        </button>
        <button onClick={() => { setPlant(false); if (sel === "wall" || sel === "chloro") setSel("nucleus"); }} className={`flex-1 rounded-xl py-2 text-sm font-extrabold ${!plant ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-600"}`}>
          <Emoji e="🐾" /> Животная
        </button>
      </div>
      <svg viewBox="0 0 240 170" className="w-full">
        {plant ? (
          <>
            <rect x="10" y="10" width="220" height="150" rx="14" fill="#bbf7d0" stroke="#16a34a" strokeWidth="6" {...hit("wall")} />
            <rect x="20" y="20" width="200" height="130" rx="10" fill="#f0fdf4" stroke="#86efac" strokeWidth="3" {...hit("membrane")} />
          </>
        ) : (
          <ellipse cx="120" cy="85" rx="108" ry="74" fill="#fff1f2" stroke="#fb7185" strokeWidth="4" {...hit("membrane")} />
        )}
        <rect x="40" y="40" width="160" height="90" rx="40" fill="transparent" {...hit("cytoplasm")} />
        {plant ? <rect x="104" y="36" width="88" height="80" rx="24" fill="#bae6fd" opacity="0.9" {...hit("vacuole")} /> : <circle cx="160" cy="62" r="12" fill="#bae6fd" {...hit("vacuole")} />}
        <circle cx="72" cy="80" r="24" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="3" {...hit("nucleus")} />
        <circle cx="72" cy="80" r="7" fill="#7c3aed" pointerEvents="none" />
        <g {...hit("mito")}>
          <ellipse cx="120" cy="134" rx="18" ry="8" fill="#fdba74" stroke="#ea580c" strokeWidth="2" />
          <ellipse cx="60" cy="130" rx="14" ry="7" fill="#fdba74" stroke="#ea580c" strokeWidth="2" />
        </g>
        {plant && (
          <g {...hit("chloro")}>
            {[[160, 132], [196, 132], [40, 44], [200, 40]].map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y} rx="12" ry="7" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
            ))}
          </g>
        )}
      </svg>
      <div className="mt-2 rounded-2xl bg-slate-50 p-3 text-sm">
        <b className="text-brand">{ORGANELLES[sel].name}.</b> {ORGANELLES[sel].text}
      </div>
      <p className="mt-1 text-center text-xs font-bold text-slate-400">Нажимай на части клетки</p>
    </div>
  );
}

// ---------- Фотосинтез ----------
export function Photosynthesis() {
  const [light, setLight] = useState(true);
  return (
    <div>
      <div className="relative h-52 overflow-hidden rounded-2xl transition-colors duration-700" style={{ background: light ? "linear-gradient(#e0f2fe,#f0fdf4)" : "linear-gradient(#1e293b,#334155)" }}>
        <span className={`absolute left-4 top-3 text-4xl transition-all duration-700 ${light ? "opacity-100" : "translate-y-8 opacity-0"}`}><Emoji e="☀️" /></span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-7xl"><Emoji e="🌿" /></span>
        <div className="absolute inset-x-0 bottom-0 h-6 bg-amber-800/60" />
        {light && (
          <>
            <span className="absolute left-[18%] top-[45%] animate-float rounded-full bg-slate-700/80 px-2 py-0.5 text-xs font-extrabold text-white">CO₂ →</span>
            <span className="absolute bottom-8 left-[22%] animate-float rounded-full bg-sky-600/80 px-2 py-0.5 text-xs font-extrabold text-white" style={{ animationDelay: "0.5s" }}>
              H₂O ↑
            </span>
            <span className="absolute right-[14%] top-[30%] animate-float rounded-full bg-emerald-600/90 px-2 py-0.5 text-xs font-extrabold text-white" style={{ animationDelay: "0.3s" }}>
              → O₂
            </span>
            <span className="absolute right-[18%] top-[58%] animate-float rounded-full bg-amber-500/90 px-2 py-0.5 text-xs font-extrabold text-white" style={{ animationDelay: "0.8s" }}>
              глюкоза <Emoji e="🍬" />
            </span>
          </>
        )}
        {!light && <span className="absolute inset-x-0 top-1/3 text-center text-sm font-extrabold text-white">Темно: фотосинтез остановился <Emoji e="🌙" /></span>}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-slate-600">6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂</span>
        <button onClick={() => setLight(!light)} className="inline-flex items-center gap-1 rounded-xl bg-brand px-3 py-2 text-sm font-extrabold text-white">
          {light ? <Moon size={16} /> : <Sun size={16} />} {light ? "Выключить свет" : "Включить свет"}
        </button>
      </div>
    </div>
  );
}

// ---------- Пищевая цепь (собери сам) ----------
const CHAIN = [
  { e: "🌾", t: "Трава", role: "продуцент" },
  { e: "🦗", t: "Кузнечик", role: "консумент I" },
  { e: "🐸", t: "Лягушка", role: "консумент II" },
  { e: "🐍", t: "Змея", role: "консумент III" },
  { e: "🦅", t: "Орёл", role: "консумент IV" },
];
const SHUFFLED = [2, 4, 0, 3, 1];

export function FoodChain() {
  const [picked, setPicked] = useState([]);
  const nextOk = picked.length;
  const [wrong, setWrong] = useState(null);
  const pick = (i) => {
    if (picked.includes(i)) return;
    if (i === nextOk) {
      setPicked([...picked, i]);
      setWrong(null);
    } else setWrong(i);
  };
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-slate-500">Собери пищевую цепь: нажимай по порядку, начиная с продуцента</p>
      <div className="flex flex-wrap justify-center gap-2">
        {SHUFFLED.map((i) => (
          <button key={i} onClick={() => pick(i)} disabled={picked.includes(i)} className={`rounded-2xl px-3 py-2 text-center font-bold transition ${picked.includes(i) ? "bg-slate-100 opacity-40" : wrong === i ? "animate-shake bg-rose-100" : "bg-white shadow hover:-translate-y-0.5"}`}>
            <span className="block text-3xl"><Em t={CHAIN[i].e} /></span>
            <span className="text-xs">{CHAIN[i].t}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex min-h-16 flex-wrap items-center justify-center gap-1 rounded-2xl bg-emerald-50 p-2">
        {picked.length === 0 && <span className="text-sm text-slate-400">Здесь появится цепь</span>}
        {picked.map((i, k) => (
          <span key={i} className="animate-pop flex items-center gap-1">
            {k > 0 && <span className="font-extrabold text-emerald-600">→</span>}
            <span className="rounded-xl bg-white px-2 py-1 text-center text-xs font-bold shadow-sm">
              <span className="block text-xl"><Em t={CHAIN[i].e} /></span>
              {CHAIN[i].role}
            </span>
          </span>
        ))}
      </div>
      {picked.length === CHAIN.length && (
        <div className="mt-2 flex items-center justify-center gap-2 text-sm font-extrabold text-emerald-600">
          Цепь собрана! Энергия Солнца прошла через 5 звеньев.
          <button onClick={() => setPicked([])} className="rounded-lg p-1 text-slate-400 hover:text-brand" aria-label="Собрать заново">
            <RotateCcw size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Лента времени ----------
export function Timeline({ events = [] }) {
  const [sel, setSel] = useState(0);
  const ev = events[sel];
  return (
    <div>
      <div className="relative mb-4 mt-2 flex justify-between px-2">
        <div className="absolute inset-x-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-linear-to-r from-amber-300 via-brand to-brand-2" />
        {events.map((e, i) => (
          <button key={i} onClick={() => setSel(i)} className={`relative z-10 grid h-9 w-9 place-items-center rounded-full border-4 text-xs font-extrabold transition ${sel === i ? "scale-125 border-brand bg-white text-brand" : "border-white bg-brand-tint text-brand"}`} aria-label={e.title}>
            {i + 1}
          </button>
        ))}
      </div>
      <div key={sel} className="animate-rise rounded-2xl bg-linear-to-br from-amber-50 to-white p-4 ring-1 ring-amber-200">
        <span className="font-display text-sm font-bold text-amber-600">{ev.year}</span>
        <p className="text-lg font-extrabold">{ev.title}</p>
        <p className="text-sm text-slate-600">{ev.text}</p>
      </div>
    </div>
  );
}

// ---------- Карта Шёлкового пути ----------
const CITIES = [
  { id: "xian", name: "Чанъань (Китай)", x: 300, y: 70, text: "Начало пути: отсюда везли шёлк, фарфор и чай." },
  { id: "fergana", name: "Фергана", x: 222, y: 58, text: "Славилась «небесными конями», за которыми приезжали из Китая." },
  { id: "chach", name: "Чач (Ташкент)", x: 196, y: 46, text: "Крупный торговый город на северной ветке пути." },
  { id: "samarkand", name: "Самарканд", x: 172, y: 72, text: "Столица Согда, центр торговли и производства бумаги." },
  { id: "bukhara", name: "Бухара", x: 146, y: 80, text: "Город караван-сараев, медресе и ремесленников." },
  { id: "khiva", name: "Хива", x: 118, y: 62, text: "Последний оазис перед пустынями на пути в Европу." },
  { id: "merv", name: "Мерв", x: 112, y: 104, text: "Важный узел дорог в Иран и на Ближний Восток." },
  { id: "rome", name: "Средиземноморье", x: 20, y: 86, text: "Конечная точка: сюда доставляли шёлк и специи." },
];

export function SilkRoad() {
  const [sel, setSel] = useState("samarkand");
  const city = CITIES.find((c) => c.id === sel);
  const path = "M300 70 L222 58 L172 72 L146 80 L118 62 L60 74 L20 86";
  return (
    <div>
      <svg viewBox="0 0 320 130" className="w-full rounded-2xl bg-linear-to-br from-amber-100 via-orange-50 to-yellow-50">
        <path d="M0 20 Q80 0 160 24 T320 18" stroke="#fde68a" strokeWidth="18" fill="none" opacity="0.6" />
        <path d={path} stroke="#b45309" strokeWidth="3" strokeDasharray="6 5" fill="none" />
        <path d="M222 58 L196 46 L172 72" stroke="#b45309" strokeWidth="2" strokeDasharray="4 4" fill="none" />
        <path d="M146 80 L112 104 L60 74" stroke="#b45309" strokeWidth="2" strokeDasharray="4 4" fill="none" />
        {CITIES.map((c) => (
          <g key={c.id} onClick={() => setSel(c.id)} className="cursor-pointer">
            <circle cx={c.x} cy={c.y} r={sel === c.id ? 8 : 6} fill={sel === c.id ? "#ea580c" : "#fff"} stroke="#b45309" strokeWidth="2.5" />
            <text x={c.x} y={c.y - 11} textAnchor="middle" fontSize="8" fontWeight="800" fill="#78350f">
              {c.name.split(" ")[0]}
            </text>
          </g>
        ))}
        <SvgEmoji e="🐫" x={250} y={100} size={16} />
        <SvgEmoji e="🐫" x={268} y={100} size={16} />
      </svg>
      <div className="mt-2 rounded-2xl bg-orange-50 p-3 text-sm">
        <b className="text-orange-700">{city.name}.</b> {city.text}
      </div>
    </div>
  );
}

// ---------- Флаг Узбекистана ----------
const FLAG_PARTS = {
  blue: "Голубой цвет — символ неба и воды, источников жизни.",
  white: "Белый цвет — символ мира и чистоты помыслов.",
  green: "Зелёный цвет — символ природы и новой жизни.",
  red: "Тонкие красные полосы — жизненная сила, текущая в каждом человеке.",
  moon: "Полумесяц — символ молодой независимой республики.",
  stars: "12 звёзд — символ духовности; по одной из трактовок — 12 месяцев года.",
};

export function Flag() {
  const [sel, setSel] = useState("blue");
  const stars = [];
  const rows = [[3, 0], [4, 1], [5, 2]];
  rows.forEach(([n, r]) => {
    for (let i = 0; i < n; i++) stars.push([94 - (n - 1 - i) * 13, 14 + r * 12]);
  });
  return (
    <div>
      <svg viewBox="0 0 250 125" className="w-full overflow-hidden rounded-xl shadow-md">
        <rect width="250" height="40" fill="#0099b5" onClick={() => setSel("blue")} className="cursor-pointer" />
        <rect y="40" width="250" height="3" fill="#ce1126" onClick={() => setSel("red")} className="cursor-pointer" />
        <rect y="43" width="250" height="39" fill="#fff" onClick={() => setSel("white")} className="cursor-pointer" />
        <rect y="82" width="250" height="3" fill="#ce1126" onClick={() => setSel("red")} className="cursor-pointer" />
        <rect y="85" width="250" height="40" fill="#1eb53a" onClick={() => setSel("green")} className="cursor-pointer" />
        <g onClick={() => setSel("moon")} className="cursor-pointer">
          <circle cx="30" cy="20" r="13" fill="#fff" />
          <circle cx="35" cy="20" r="11" fill="#0099b5" />
        </g>
        <g onClick={() => setSel("stars")} className="cursor-pointer" fill="#fff">
          {stars.map(([x, y], i) => (
            <text key={i} x={x} y={y} fontSize="9" textAnchor="middle">
              ★
            </text>
          ))}
        </g>
      </svg>
      <div className="mt-2 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700">{FLAG_PARTS[sel]}</div>
      <p className="mt-1 text-center text-xs font-bold text-slate-400">Нажимай на части флага</p>
    </div>
  );
}

// ---------- Времена английского ----------
const TENSES = {
  simple: { title: "Present Simple", mark: "every day", where: [0.15, 0.35, 0.55, 0.75, 0.95], ex: ["I go to school every day.", "She reads books on Sundays."], formula: "V / V+s" },
  continuous: { title: "Present Continuous", mark: "now", where: [0.55], ex: ["I am reading now.", "They are playing football at the moment."], formula: "am/is/are + V-ing" },
  past: { title: "Past Simple", mark: "yesterday", where: [0.22], ex: ["I visited Bukhara last summer.", "We saw a film yesterday."], formula: "V-ed / 2-я форма" },
};

export function Tense({ tense = "simple" }) {
  const [t, setT] = useState(tense);
  const aid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const cur = TENSES[t];
  return (
    <div>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {Object.entries(TENSES).map(([k, v]) => (
          <button key={k} onClick={() => setT(k)} className={`rounded-xl px-1 py-2 text-xs font-extrabold sm:text-sm ${t === k ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}>
            {v.title}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 300 60" className="w-full">
        <line x1="10" y1="30" x2="290" y2="30" stroke="#94a3b8" strokeWidth="3" markerEnd={`url(#${aid}a)`} />
        <defs>
          <marker id={`${aid}a`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="#94a3b8" />
          </marker>
        </defs>
        <line x1="165" y1="14" x2="165" y2="46" stroke="#e11d48" strokeWidth="2.5" />
        <text x="165" y="10" textAnchor="middle" fontSize="9" fontWeight="800" fill="#e11d48">
          СЕЙЧАС
        </text>
        <text x="30" y="55" fontSize="9" fill="#64748b" fontWeight="700">прошлое</text>
        <text x="245" y="55" fontSize="9" fill="#64748b" fontWeight="700">будущее</text>
        {cur.where.map((w, i) => (
          <circle key={`${t}-${i}`} cx={10 + w * 280} cy="30" r="8" fill="var(--brand)" className="animate-pop" style={{ animationDelay: `${i * 90}ms` }} />
        ))}
      </svg>
      <div className="mt-2 rounded-2xl bg-slate-50 p-3 text-sm">
        <p className="font-extrabold text-brand">
          {cur.formula} · маркер: «{cur.mark}»
        </p>
        {cur.ex.map((e) => (
          <p key={e} className="font-semibold">• {e}</p>
        ))}
      </div>
    </div>
  );
}

// ---------- Флеш-карточки слов ----------
export function WordCards({ cards = [] }) {
  const [open, setOpen] = useState({});
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-slate-500">Нажми, чтобы увидеть перевод</p>
      <div className="grid grid-cols-2 gap-2">
        {cards.map((c, i) => (
          <button key={i} onClick={() => setOpen({ ...open, [i]: !open[i] })} className={`h-20 rounded-2xl text-lg font-extrabold transition ${open[i] ? "bg-brand-2 text-white" : "bg-linear-to-br from-orange-50 to-rose-50 text-ink ring-1 ring-orange-200"}`}>
            {open[i] ? c.back : c.front}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Двоичный переключатель ----------
export function Binary() {
  const [bits, setBits] = useState([0, 0, 0, 0, 1, 0, 1, 1]);
  const weights = [128, 64, 32, 16, 8, 4, 2, 1];
  const value = bits.reduce((s, b, i) => s + b * weights[i], 0);
  return (
    <div>
      <div className="grid grid-cols-8 gap-1">
        {bits.map((b, i) => (
          <button key={i} onClick={() => setBits(bits.map((x, j) => (j === i ? 1 - x : x)))} className={`flex flex-col items-center rounded-xl py-2 transition ${b ? "bg-brand text-white shadow-lg" : "bg-slate-100 text-slate-500"}`} aria-label={`Бит со значением ${weights[i]}`}>
            <span className="text-lg"><Emoji e={b ? "💡" : "⚫"} /></span>
            <span className="font-display text-xl font-extrabold">{b}</span>
            <span className="text-[10px] font-bold opacity-80">{weights[i]}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-center font-display text-lg font-bold">
        {bits.join("")}₂ = <span className="text-brand">{value}</span>₁₀
      </p>
      <p className="text-center text-xs text-slate-500">{bits.map((b, i) => (b ? weights[i] : null)).filter(Boolean).join(" + ") || "0"}</p>
    </div>
  );
}

// ---------- Робот-исполнитель ----------
const SIZE = 5;
const GOAL = { x: 4, y: 3 };
const WALLS = [{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }];
const MOVES = { up: [0, 1, ArrowUp], down: [0, -1, ArrowDown], left: [-1, 0, ArrowLeft], right: [1, 0, ArrowRight] };

export function Robot() {
  const [program, setProgram] = useState([]);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setStatus("");
    let p = { x: 0, y: 0 };
    setPos(p);
    for (const cmd of program) {
      await new Promise((r) => setTimeout(r, 380));
      const [dx, dy] = MOVES[cmd];
      const n = { x: p.x + dx, y: p.y + dy };
      if (n.x < 0 || n.y < 0 || n.x >= SIZE || n.y >= SIZE || WALLS.some((w) => w.x === n.x && w.y === n.y)) {
        setStatus("💥 Робот упёрся в стену! Исправь алгоритм.");
        setRunning(false);
        return;
      }
      p = n;
      setPos(p);
    }
    setStatus(p.x === GOAL.x && p.y === GOAL.y ? `🎉 Цель достигнута за ${program.length} команд!` : "Робот не дошёл до звезды. Попробуй ещё.");
    setRunning(false);
  };

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto grid grid-cols-5 gap-1 rounded-2xl bg-slate-100 p-2">
          {Array.from({ length: SIZE * SIZE }, (_, i) => {
            const x = i % SIZE;
            const y = SIZE - 1 - Math.floor(i / SIZE);
            const wall = WALLS.some((w) => w.x === x && w.y === y);
            return (
              <div key={i} className={`grid h-9 w-9 place-items-center rounded-lg text-lg ${wall ? "bg-slate-500" : "bg-white"}`}>
                <Em t={pos.x === x && pos.y === y ? "🤖" : GOAL.x === x && GOAL.y === y ? "⭐" : wall ? "🧱" : ""} />
              </div>
            );
          })}
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-slate-500">Составь алгоритм, чтобы робот дошёл до <Emoji e="⭐" />, обходя стены</p>
          <div className="mb-2 flex gap-1.5">
            {Object.entries(MOVES).map(([k, [, , I]]) => (
              <button key={k} disabled={running || program.length >= 14} onClick={() => setProgram([...program, k])} className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white disabled:opacity-50" aria-label={k}>
                <I size={18} />
              </button>
            ))}
            <button disabled={running} onClick={() => { setProgram([]); setPos({ x: 0, y: 0 }); setStatus(""); }} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-200 text-slate-600" aria-label="Очистить">
              <Trash2 size={18} />
            </button>
          </div>
          <div className="flex min-h-10 flex-wrap gap-1 rounded-xl bg-slate-50 p-2">
            {program.length === 0 && <span className="text-xs text-slate-400">Программа пуста</span>}
            {program.map((c, i) => {
              const I = MOVES[c][2];
              return (
                <span key={i} className="grid h-7 w-7 place-items-center rounded-lg bg-white text-brand shadow-sm">
                  <I size={14} />
                </span>
              );
            })}
          </div>
          <button disabled={running || !program.length} onClick={run} className="mt-2 inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-extrabold text-white disabled:opacity-50">
            <Play size={16} /> Выполнить
          </button>
          {status && <p className="animate-rise mt-2 text-sm font-extrabold"><Em t={status} /></p>}
        </div>
      </div>
    </div>
  );
}

// ---------- Устройство компьютера ----------
const PARTS = [
  { id: "cpu", e: "🧠", name: "Процессор", kind: "Обработка", text: "Выполняет команды программ — миллиарды операций в секунду." },
  { id: "ram", e: "🗂️", name: "Оперативная память", kind: "Временное хранение", text: "Хранит данные запущенных программ, очищается при выключении." },
  { id: "ssd", e: "💾", name: "SSD / жёсткий диск", kind: "Долговременное хранение", text: "Хранит файлы и программы даже без питания." },
  { id: "monitor", e: "🖥️", name: "Монитор", kind: "Вывод", text: "Показывает изображение." },
  { id: "keyboard", e: "⌨️", name: "Клавиатура", kind: "Ввод", text: "Вводит текст и команды." },
  { id: "mouse", e: "🖱️", name: "Мышь", kind: "Ввод", text: "Управляет указателем на экране." },
  { id: "printer", e: "🖨️", name: "Принтер", kind: "Вывод", text: "Печатает документы на бумаге." },
  { id: "mic", e: "🎤", name: "Микрофон", kind: "Ввод", text: "Записывает звук." },
];
const KIND_TONE = { Ввод: "bg-sky-100 text-sky-700", Вывод: "bg-violet-100 text-violet-700", Обработка: "bg-rose-100 text-rose-700", "Временное хранение": "bg-amber-100 text-amber-700", "Долговременное хранение": "bg-emerald-100 text-emerald-700" };

export function Computer() {
  const [sel, setSel] = useState(PARTS[0]);
  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {PARTS.map((p) => (
          <button key={p.id} onClick={() => setSel(p)} className={`rounded-2xl p-2 text-center transition ${sel.id === p.id ? "bg-brand-soft ring-2 ring-brand" : "bg-slate-50 hover:bg-slate-100"}`}>
            <span className="block text-2xl"><Em t={p.e} /></span>
            <span className="text-[11px] font-bold leading-tight">{p.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm">
        <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-extrabold ${KIND_TONE[sel.kind]}`}>{sel.kind}</span>
        <p>
          <b>{sel.name}.</b> {sel.text}
        </p>
      </div>
    </div>
  );
}
