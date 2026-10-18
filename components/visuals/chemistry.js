"use client";
import { useEffect, useId, useMemo, useState } from "react";
import { Play, RotateCcw, Check, Minus, Plus } from "lucide-react";
import { Em, Emoji, SvgEmoji } from "@/components/ui/Emoji";

const ATOM_COLORS = { H: "#e2e8f0", O: "#ef4444", C: "#334155", N: "#3b82f6", Na: "#a855f7", Cl: "#22c55e", Mg: "#f59e0b" };

// ---------- Модели молекул ----------
const MOLECULES = {
  H2O: { name: "Вода", atoms: [["O", 50, 46, 18], ["H", 24, 66, 12], ["H", 76, 66, 12]] },
  O2: { name: "Кислород", atoms: [["O", 36, 50, 17], ["O", 64, 50, 17]] },
  H2: { name: "Водород", atoms: [["H", 38, 50, 13], ["H", 62, 50, 13]] },
  N2: { name: "Азот", atoms: [["N", 36, 50, 16], ["N", 64, 50, 16]] },
  CO2: { name: "Углекислый газ", atoms: [["O", 20, 50, 15], ["C", 50, 50, 16], ["O", 80, 50, 15]] },
  CH4: { name: "Метан", atoms: [["C", 50, 50, 16], ["H", 26, 30, 11], ["H", 74, 30, 11], ["H", 26, 72, 11], ["H", 74, 72, 11]] },
};
const FORMULA_LABEL = { H2O: "H₂O", O2: "O₂", H2: "H₂", N2: "N₂", CO2: "CO₂", CH4: "CH₄" };

export function MoleculeSvg({ formula, size = 96 }) {
  const m = MOLECULES[formula];
  if (!m) return null;
  const [cx, cy] = [m.atoms[0][1], m.atoms[0][2]];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-label={m.name}>
      {m.atoms.slice(1).map(([, x, y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#94a3b8" strokeWidth="5" />
      ))}
      {formula === "O2" || formula === "H2" || formula === "N2" ? <line x1="36" y1="50" x2="64" y2="50" stroke="#94a3b8" strokeWidth="5" /> : null}
      {m.atoms.map(([el, x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={ATOM_COLORS[el]} stroke="rgb(15 23 42 / 0.15)" strokeWidth="1.5" />
          <circle cx={x - r / 3} cy={y - r / 3} r={r / 3.2} fill="#fff" opacity="0.5" />
          <text x={x} y={y + 4} textAnchor="middle" fontSize={r * 0.75} fontWeight="800" fill={el === "H" ? "#334155" : "#fff"}>
            {el}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Molecules({ items = [] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((f) => (
        <div key={f} className="flex flex-col items-center rounded-2xl bg-slate-50 p-3">
          <MoleculeSvg formula={f} />
          <span className="font-display text-lg font-bold">{FORMULA_LABEL[f]}</span>
          <span className="text-center text-xs text-slate-500">{MOLECULES[f]?.name}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Физические и химические явления ----------
const PHENOMENA = [
  { e: "🧊", t: "Таяние льда", chem: false },
  { e: "🔥", t: "Горение бумаги", chem: true },
  { e: "🔩", t: "Ржавление гвоздя", chem: true },
  { e: "♨️", t: "Кипение воды", chem: false },
  { e: "🥛", t: "Скисание молока", chem: true },
  { e: "✂️", t: "Разрезание бумаги", chem: false },
];

export function Phenomena() {
  const [answers, setAnswers] = useState({});
  const score = PHENOMENA.filter((p, i) => answers[i] === p.chem).length;
  return (
    <div>
      <p className="mb-3 text-sm font-bold text-slate-500">Мини-тренажёр: распредели явления</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {PHENOMENA.map((p, i) => {
          const a = answers[i];
          const state = a === undefined ? "" : a === p.chem ? "ring-2 ring-emerald-400 bg-emerald-50" : "ring-2 ring-rose-300 bg-rose-50";
          return (
            <div key={i} className={`flex items-center gap-2 rounded-2xl bg-slate-50 p-2.5 ${state}`}>
              <span className="text-2xl"><Em t={p.e} /></span>
              <span className="flex-1 text-sm font-bold">{p.t}</span>
              <button onClick={() => setAnswers({ ...answers, [i]: false })} className="rounded-lg bg-sky-100 px-2 py-1 text-xs font-extrabold text-sky-700 hover:bg-sky-200">
                Физ.
              </button>
              <button onClick={() => setAnswers({ ...answers, [i]: true })} className="rounded-lg bg-violet-100 px-2 py-1 text-xs font-extrabold text-violet-700 hover:bg-violet-200">
                Хим.
              </button>
            </div>
          );
        })}
      </div>
      {Object.keys(answers).length === PHENOMENA.length && (
        <p className="animate-rise mt-3 text-center font-extrabold text-emerald-600">
          Верно {score} из {PHENOMENA.length}! <Em t={score === PHENOMENA.length ? "Отлично! 🎉" : "Нажми ещё раз, чтобы исправить."} />
        </p>
      )}
    </div>
  );
}

// ---------- Агрегатные состояния ----------
const STATES = {
  solid: { label: "Твёрдое", note: "Частицы плотно упакованы и колеблются на месте", emoji: "🧊" },
  liquid: { label: "Жидкое", note: "Частицы близко, но свободно перемещаются", emoji: "💧" },
  gas: { label: "Газообразное", note: "Частицы далеко друг от друга и быстро летают", emoji: "♨️" },
};

export function States() {
  const [mode, setMode] = useState("solid");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), mode === "gas" ? 450 : 700);
    return () => clearInterval(t);
  }, [mode]);
  const particles = useMemo(() => {
    const rnd = (seed) => {
      const x = Math.sin(seed * 9301 + tick * 49297) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: 25 }, (_, i) => {
      if (mode === "solid") {
        const col = i % 5;
        const row = Math.floor(i / 5);
        return { x: 30 + col * 20 + (rnd(i) - 0.5) * 3, y: 30 + row * 20 + (rnd(i + 50) - 0.5) * 3 };
      }
      if (mode === "liquid") return { x: 18 + rnd(i) * 124, y: 70 + rnd(i + 99) * 56 };
      return { x: 10 + rnd(i) * 140, y: 10 + rnd(i + 99) * 120 };
    });
  }, [mode, tick]);
  return (
    <div>
      <div className="mb-3 flex gap-2">
        {Object.entries(STATES).map(([k, v]) => (
          <button key={k} onClick={() => setMode(k)} className={`flex-1 rounded-xl px-2 py-2 text-sm font-extrabold transition ${mode === k ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            <Em t={v.emoji} /> {v.label}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 160 140" className="h-44 w-full rounded-2xl bg-linear-to-b from-sky-50 to-blue-100">
        {particles.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="7" fill="var(--brand)" opacity="0.85" style={{ transition: `cx ${mode === "gas" ? 0.45 : 0.7}s linear, cy ${mode === "gas" ? 0.45 : 0.7}s linear` }} />
        ))}
      </svg>
      <p className="mt-2 text-center text-sm font-bold text-slate-600">{STATES[mode].note}</p>
    </div>
  );
}

// ---------- Модель атома ----------
const ELEMENTS = [
  ["H", "Водород", 1], ["He", "Гелий", 4], ["Li", "Литий", 7], ["Be", "Бериллий", 9], ["B", "Бор", 11], ["C", "Углерод", 12], ["N", "Азот", 14], ["O", "Кислород", 16], ["F", "Фтор", 19], ["Ne", "Неон", 20],
  ["Na", "Натрий", 23], ["Mg", "Магний", 24], ["Al", "Алюминий", 27], ["Si", "Кремний", 28], ["P", "Фосфор", 31], ["S", "Сера", 32], ["Cl", "Хлор", 35.5], ["Ar", "Аргон", 40], ["K", "Калий", 39], ["Ca", "Кальций", 40],
];
const METALS = new Set(["Li", "Be", "Na", "Mg", "Al", "K", "Ca"]);
const NOBLE = new Set(["He", "Ne", "Ar"]);

function shells(z) {
  const caps = [2, 8, 8, 2];
  const out = [];
  let left = z;
  for (const c of caps) {
    if (left <= 0) break;
    out.push(Math.min(c, left));
    left -= c;
  }
  return out;
}

export function AtomModel({ protons = 6 }) {
  const [z, setZ] = useState(protons);
  const nid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [sym, name, mass] = ELEMENTS[z - 1];
  const neutrons = Math.round(mass) - z;
  const sh = shells(z);
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 220 220" className="h-56 w-56">
        {sh.map((n, si) => {
          const r = 40 + si * 22;
          return (
            <g key={si}>
              <circle cx="110" cy="110" r={r} fill="none" stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="4 4" />
              <g style={{ transformOrigin: "110px 110px", animation: `orbit ${6 + si * 3}s linear infinite` }}>
                {Array.from({ length: n }, (_, i) => {
                  const a = (i / n) * Math.PI * 2;
                  return <circle key={i} cx={110 + r * Math.cos(a)} cy={110 + r * Math.sin(a)} r="5" fill="#06b6d4" stroke="#fff" strokeWidth="1.5" />;
                })}
              </g>
            </g>
          );
        })}
        <circle cx="110" cy="110" r="24" fill={`url(#${nid}n)`} />
        <defs>
          <radialGradient id={`${nid}n`}>
            <stop offset="0" stopColor="#fda4af" />
            <stop offset="1" stopColor="#e11d48" />
          </radialGradient>
        </defs>
        <text x="110" y="116" textAnchor="middle" fill="#fff" fontWeight="800" fontSize="16">
          {sym}
        </text>
      </svg>
      <div className="grid w-full grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl bg-rose-50 p-2"><b className="block text-lg text-rose-600">{z}</b>протонов (+)</div>
        <div className="rounded-xl bg-slate-100 p-2"><b className="block text-lg text-slate-700">{neutrons}</b>нейтронов</div>
        <div className="rounded-xl bg-cyan-50 p-2"><b className="block text-lg text-cyan-600">{z}</b>электронов (−)</div>
      </div>
      <label className="w-full text-sm font-bold text-slate-600">
        {name} — элемент № {z} · электроны по слоям: {sh.join(", ")}
        <input type="range" min="1" max="20" value={z} onChange={(e) => setZ(Number(e.target.value))} className="mt-2 w-full accent-brand" aria-label="Порядковый номер элемента" />
      </label>
    </div>
  );
}

// ---------- Символы элементов ----------
const SYMBOLS = [["H", "Водород", "Hydrogenium", "аш"], ["O", "Кислород", "Oxygenium", "о"], ["C", "Углерод", "Carboneum", "цэ"], ["Fe", "Железо", "Ferrum", "феррум"], ["Cu", "Медь", "Cuprum", "купрум"], ["Au", "Золото", "Aurum", "аурум"], ["Ag", "Серебро", "Argentum", "аргентум"], ["N", "Азот", "Nitrogenium", "эн"]];

export function Symbols() {
  const [open, setOpen] = useState({});
  return (
    <div>
      <p className="mb-3 text-sm font-bold text-slate-500">Нажми на карточку, чтобы перевернуть</p>
      <div className="grid grid-cols-4 gap-2">
        {SYMBOLS.map(([s, ru, lat, read]) => (
          <button key={s} onClick={() => setOpen({ ...open, [s]: !open[s] })} className={`aspect-square rounded-2xl p-1 text-center transition ${open[s] ? "bg-brand text-white" : "bg-slate-50 hover:bg-brand-soft"}`}>
            {open[s] ? (
              <span className="flex h-full flex-col items-center justify-center text-[11px] leading-tight font-bold">
                <span className="text-sm font-extrabold">{ru}</span>
                <span className="opacity-80">{lat}</span>
                <span className="opacity-80">«{read}»</span>
              </span>
            ) : (
              <span className="font-display text-2xl font-extrabold text-brand">{s}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Мини-таблица Менделеева (элементы 1–20) ----------
const POS = { H: [1, 1], He: [1, 8], Li: [2, 1], Be: [2, 2], B: [2, 3], C: [2, 4], N: [2, 5], O: [2, 6], F: [2, 7], Ne: [2, 8], Na: [3, 1], Mg: [3, 2], Al: [3, 3], Si: [3, 4], P: [3, 5], S: [3, 6], Cl: [3, 7], Ar: [3, 8], K: [4, 1], Ca: [4, 2] };

export function Periodic() {
  const [sel, setSel] = useState(11);
  const [sym, name, mass] = ELEMENTS[sel - 1];
  const kind = METALS.has(sym) ? "Металл" : NOBLE.has(sym) ? "Благородный газ" : "Неметалл";
  const [period, group] = POS[sym];
  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))" }}>
        {ELEMENTS.map(([s], i) => {
          const [r, c] = POS[s];
          const color = METALS.has(s) ? "bg-amber-100 text-amber-800" : NOBLE.has(s) ? "bg-violet-100 text-violet-800" : "bg-sky-100 text-sky-800";
          return (
            <button key={s} onClick={() => setSel(i + 1)} style={{ gridRow: r, gridColumn: c }} className={`aspect-square rounded-lg text-center transition ${color} ${sel === i + 1 ? "ring-2 ring-brand scale-110" : "hover:scale-105"}`}>
              <span className="block text-[9px] leading-none opacity-70">{i + 1}</span>
              <span className="text-sm font-extrabold">{s}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-white text-center shadow">
          <span className="text-[10px] font-bold text-slate-400">{sel}</span>
          <span className="font-display -mt-2 text-2xl font-extrabold text-brand">{sym}</span>
        </div>
        <div className="text-sm">
          <b className="text-base">{name}</b> · {kind}
          <br />
          Период {period}, группа {group} · масса ≈ {mass}
          <br />
          {sel} протонов и {sel} электронов
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
        <span><Emoji e="🟨" /> металлы</span>
        <span><Emoji e="🟦" /> неметаллы</span>
        <span><Emoji e="🟪" /> благородные газы</span>
      </div>
    </div>
  );
}

// ---------- Анимация реакции 2H₂ + O₂ → 2H₂O ----------
const START = [
  ["H", 14, 40], ["H", 30, 40], ["H", 14, 78], ["H", 30, 78], ["O", 62, 52], ["O", 62, 70],
];
const END = [
  ["H", 112, 30], ["H", 142, 30], ["H", 112, 82], ["H", 142, 82], ["O", 127, 46], ["O", 127, 98],
];

export function Reaction() {
  const [done, setDone] = useState(false);
  const atoms = done ? END : START;
  return (
    <div>
      <svg viewBox="0 0 170 120" className="h-48 w-full rounded-2xl bg-linear-to-br from-violet-50 to-cyan-50">
        <text x="85" y="66" textAnchor="middle" fontSize="16" fill="#94a3b8" fontWeight="800">
          {done ? "" : "→"}
        </text>
        {atoms.map(([el, x, y], i) => (
          <g key={i} style={{ transform: `translate(${x}px, ${y}px)`, transition: `transform 1.4s cubic-bezier(.6,-0.3,.3,1.3) ${i * 0.06}s` }}>
            <circle r={el === "O" ? 11 : 7.5} fill={ATOM_COLORS[el]} stroke="rgb(15 23 42 / 0.2)" />
            <text y="3.5" textAnchor="middle" fontSize={el === "O" ? 9 : 7} fontWeight="800" fill={el === "O" ? "#fff" : "#334155"}>
              {el}
            </text>
          </g>
        ))}
        {done && <text x="127" y="116" textAnchor="middle" fontSize="8" fontWeight="800" fill="#7c3aed" className="animate-pop">2 молекулы воды</text>}
        {done && <SvgEmoji e="💧" x={150} y={109} size={9} className="animate-pop" />}
        {!done && (
          <>
            <text x="22" y="104" textAnchor="middle" fontSize="7" fontWeight="800" fill="#64748b">2H₂</text>
            <text x="62" y="96" textAnchor="middle" fontSize="7" fontWeight="800" fill="#64748b">O₂</text>
          </>
        )}
      </svg>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-display font-bold">2H₂ + O₂ → 2H₂O</span>
        <button onClick={() => setDone(!done)} className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-extrabold text-white">
          {done ? <RotateCcw size={16} /> : <Play size={16} />} {done ? "Сначала" : "Запустить реакцию"}
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-500">Посчитай атомы: и до, и после реакции их 4 водорода и 2 кислорода — они только «поменяли партнёров».</p>
    </div>
  );
}

// ---------- Типы реакций ----------
const TYPES = [
  { id: "comb", title: "Соединение", scheme: "A + B → AB", ex: "C + O₂ → CO₂", before: [["A", "#f59e0b"], ["B", "#06b6d4"]], after: [["AB", "#8b5cf6"]] },
  { id: "dec", title: "Разложение", scheme: "AB → A + B", ex: "CaCO₃ → CaO + CO₂", before: [["AB", "#8b5cf6"]], after: [["A", "#f59e0b"], ["B", "#06b6d4"]] },
  { id: "sub", title: "Замещение", scheme: "A + BC → AC + B", ex: "Fe + CuSO₄ → FeSO₄ + Cu", before: [["A", "#f59e0b"], ["BC", "#ec4899"]], after: [["AC", "#f97316"], ["B", "#06b6d4"]] },
  { id: "ex", title: "Обмен", scheme: "AB + CD → AD + CB", ex: "NaOH + HCl → NaCl + H₂O", before: [["AB", "#8b5cf6"], ["CD", "#22c55e"]], after: [["AD", "#0ea5e9"], ["CB", "#eab308"]] },
];

export function ReactionTypes() {
  const [i, setI] = useState(0);
  const t = TYPES[i];
  const Chip = ([label, color]) => (
    <span key={label} className="animate-pop rounded-full px-3 py-1.5 font-display text-sm font-bold text-white shadow" style={{ background: color }}>
      {label}
    </span>
  );
  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TYPES.map((x, idx) => (
          <button key={x.id} onClick={() => setI(idx)} className={`rounded-xl px-2 py-2 text-sm font-extrabold ${i === idx ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}>
            {x.title}
          </button>
        ))}
      </div>
      <div key={t.id} className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-slate-50 p-4">
        {t.before.map(Chip)}
        <span className="text-xl font-extrabold text-slate-400">→</span>
        {t.after.map(Chip)}
      </div>
      <p className="mt-2 text-center text-sm font-bold text-slate-600">
        {t.scheme} · пример: {t.ex}
      </p>
    </div>
  );
}

// ---------- Тренажёр уравнивания ----------
const EQUATIONS = [
  { left: [["H₂", { H: 2 }], ["O₂", { O: 2 }]], right: [["H₂O", { H: 2, O: 1 }]], answer: [2, 1, 2] },
  { left: [["Mg", { Mg: 1 }], ["O₂", { O: 2 }]], right: [["MgO", { Mg: 1, O: 1 }]], answer: [2, 1, 2] },
  { left: [["N₂", { N: 1 * 2 }], ["H₂", { H: 2 }]], right: [["NH₃", { N: 1, H: 3 }]], answer: [1, 3, 2] },
];

export function Balancer() {
  const [eqI, setEqI] = useState(0);
  const eq = EQUATIONS[eqI];
  const terms = [...eq.left, ...eq.right];
  const [k, setK] = useState(terms.map(() => 1));
  const count = (list, offset) => {
    const totals = {};
    list.forEach(([, atoms], i) => {
      for (const [el, n] of Object.entries(atoms)) totals[el] = (totals[el] || 0) + n * k[i + offset];
    });
    return totals;
  };
  const L = count(eq.left, 0);
  const R = count(eq.right, eq.left.length);
  const elements = [...new Set([...Object.keys(L), ...Object.keys(R)])];
  const balanced = elements.every((el) => L[el] === R[el]);
  const change = (i, d) => setK(k.map((v, j) => (j === i ? Math.max(1, Math.min(6, v + d)) : v)));
  const next = () => {
    const n = (eqI + 1) % EQUATIONS.length;
    setEqI(n);
    setK([...EQUATIONS[n].left, ...EQUATIONS[n].right].map(() => 1));
  };
  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-slate-50 p-3">
        {terms.map(([f], i) => (
          <div key={i} className="flex items-center gap-1">
            {i === eq.left.length && <span className="mx-1 text-xl font-extrabold text-slate-400">→</span>}
            {i > 0 && i !== eq.left.length && <span className="mx-1 text-lg font-extrabold text-slate-400">+</span>}
            <div className="flex flex-col items-center">
              <button onClick={() => change(i, 1)} className="rounded-md p-0.5 text-slate-400 hover:bg-white hover:text-brand" aria-label="Увеличить коэффициент">
                <Plus size={16} />
              </button>
              <span className="font-display text-xl font-extrabold">
                <span className="text-brand">{k[i] > 1 ? k[i] : ""}</span>
                {f}
              </span>
              <button onClick={() => change(i, -1)} className="rounded-md p-0.5 text-slate-400 hover:bg-white hover:text-brand" aria-label="Уменьшить коэффициент">
                <Minus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-white p-2 ring-1 ring-slate-200">
          <b>Слева:</b> {elements.map((el) => `${el} — ${L[el] || 0}`).join(", ")}
        </div>
        <div className="rounded-xl bg-white p-2 ring-1 ring-slate-200">
          <b>Справа:</b> {elements.map((el) => `${el} — ${R[el] || 0}`).join(", ")}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`font-extrabold ${balanced ? "text-emerald-600" : "text-slate-500"}`}>
          {balanced ? (
            <span className="inline-flex items-center gap-1">
              <Check size={18} /> Уравнено!
            </span>
          ) : (
            "Подбери коэффициенты кнопками + и −"
          )}
        </span>
        <button onClick={next} className="rounded-xl bg-brand-soft px-3 py-2 text-sm font-extrabold text-brand">
          Другая реакция
        </button>
      </div>
    </div>
  );
}

// ---------- Шкала pH ----------
const PH_EXAMPLES = [
  [1, "Желудочный сок"], [2, "Лимонный сок"], [3, "Уксус"], [5, "Чёрный чай"], [6, "Молоко"], [7, "Чистая вода"], [8, "Морская вода"], [9, "Пищевая сода"], [10, "Мыльный раствор"], [12, "Известковая вода"], [13, "Средство для чистки труб"],
];

export function Ph() {
  const [ph, setPh] = useState(7);
  const hue = (ph / 14) * 260;
  const near = PH_EXAMPLES.reduce((a, b) => (Math.abs(b[0] - ph) < Math.abs(a[0] - ph) ? b : a));
  const kind = ph < 7 ? "кислая" : ph === 7 ? "нейтральная" : "щелочная";
  return (
    <div>
      <div className="h-6 w-full rounded-full" style={{ background: "linear-gradient(90deg,#dc2626,#f97316,#facc15,#84cc16,#22c55e,#14b8a6,#3b82f6,#6366f1,#7c3aed)" }} />
      <input type="range" min="0" max="14" value={ph} onChange={(e) => setPh(Number(e.target.value))} className="mt-2 w-full accent-brand" aria-label="pH" />
      <div className="mt-2 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl font-display text-xl font-extrabold text-white" style={{ background: `hsl(${hue} 75% 50%)` }}>
          {ph}
        </span>
        <div className="text-sm">
          Среда: <b>{kind}</b>
          <br />
          Например: {near[1]} (pH ≈ {near[0]})
          <br />
          {ph < 7 ? "Лакмус — красный" : ph > 7 ? "Лакмус — синий, фенолфталеин — малиновый" : "Лакмус — фиолетовый"}
        </div>
      </div>
    </div>
  );
}
