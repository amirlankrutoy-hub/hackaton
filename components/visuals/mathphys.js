"use client";
import { useEffect, useState } from "react";
import { Minus, Plus, Play } from "lucide-react";
import { Emoji, Em } from "@/components/ui/Emoji";

function Stepper({ label, value, onChange, min = 1, max = 12 }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-2 py-1.5">
      <span className="text-sm font-bold text-slate-500">{label}</span>
      <button onClick={() => onChange(Math.max(min, value - 1))} className="rounded-lg bg-white p-1 shadow-sm hover:text-brand" aria-label={`Уменьшить: ${label}`}>
        <Minus size={14} />
      </button>
      <span className="w-6 text-center font-display font-bold">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} className="rounded-lg bg-white p-1 shadow-sm hover:text-brand" aria-label={`Увеличить: ${label}`}>
        <Plus size={14} />
      </button>
    </div>
  );
}

// ---------- Разряды числа ----------
export function PlaceValue({ value = 4507 }) {
  const [n, setN] = useState(String(value));
  const digits = n.replace(/\D/g, "").slice(0, 7) || "0";
  const names = ["единицы", "десятки", "сотни", "тыс.", "десятки тыс.", "сотни тыс.", "миллионы"];
  const rev = digits.split("").reverse();
  return (
    <div>
      <input value={n} onChange={(e) => setN(e.target.value)} inputMode="numeric" className="mb-3 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-center font-display text-2xl font-bold focus:border-brand focus:outline-none" aria-label="Введи число" />
      <div className="flex flex-row-reverse justify-center gap-1.5">
        {rev.map((d, i) => (
          <div key={i} className={`flex w-14 flex-col items-center rounded-xl p-2 ${i >= 3 ? "bg-violet-50" : "bg-sky-50"}`}>
            <span className="font-display text-2xl font-extrabold text-brand">{d}</span>
            <span className="text-center text-[10px] font-bold leading-tight text-slate-500">{names[i]}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-xs font-bold text-slate-500">Голубые — класс единиц, фиолетовые — класс тысяч и выше</p>
    </div>
  );
}

// ---------- Круг-дробь ----------
export function FractionPie({ num = 3, den = 8, size = 160, interactive = true }) {
  const [a, setA] = useState(num);
  const [b, setB] = useState(den);
  const n = interactive ? Math.min(a, b) : num;
  const d = interactive ? b : den;
  const r = 70;
  const slices = Array.from({ length: d }, (_, i) => {
    const a0 = (i / d) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / d) * Math.PI * 2 - Math.PI / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = `M80 80 L${80 + r * Math.cos(a0)} ${80 + r * Math.sin(a0)} A${r} ${r} 0 ${large} 1 ${80 + r * Math.cos(a1)} ${80 + r * Math.sin(a1)} Z`;
    return <path key={i} d={d === 1 ? undefined : p} fill={i < n ? "var(--brand)" : "#e2e8f0"} stroke="#fff" strokeWidth="2.5" />;
  });
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 160 160" width={size} height={size}>
        {d === 1 ? <circle cx="80" cy="80" r={r} fill={n ? "var(--brand)" : "#e2e8f0"} /> : slices}
      </svg>
      {interactive && (
        <>
          <div className="font-display text-2xl font-extrabold">
            <span className="text-brand">{n}</span>/<span>{d}</span>
            <span className="ml-3 text-base text-slate-500">≈ {(n / d).toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Stepper label="Числитель" value={a} onChange={setA} min={0} max={b} />
            <Stepper label="Знаменатель" value={b} onChange={(v) => { setB(v); if (a > v) setA(v); }} min={1} max={12} />
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Числовой луч 0…1 ----------
export function NumberLine({ value = 0.7 }) {
  const [v, setV] = useState(Math.round(value * 100));
  return (
    <div>
      <svg viewBox="0 0 320 70" className="w-full">
        <line x1="10" y1="35" x2="310" y2="35" stroke="#334155" strokeWidth="3" />
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <line x1={10 + i * 30} y1="25" x2={10 + i * 30} y2="45" stroke="#334155" strokeWidth="2" />
            <text x={10 + i * 30} y="62" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="700">
              {i === 0 ? "0" : i === 10 ? "1" : `0,${i}`}
            </text>
          </g>
        ))}
        <circle cx={10 + v * 3} cy="35" r="9" fill="var(--brand)" stroke="#fff" strokeWidth="3" />
      </svg>
      <input type="range" min="0" max="100" value={v} onChange={(e) => setV(Number(e.target.value))} className="w-full accent-brand" aria-label="Значение на луче" />
      <p className="text-center font-display text-lg font-bold">
        {(v / 100).toFixed(2).replace(".", ",")} = {v}/100 {v % 10 === 0 ? `= ${v / 10}/10` : ""}
      </p>
    </div>
  );
}

// ---------- Сетка процентов ----------
export function PercentGrid({ value = 35, interactive = true }) {
  const [p, setP] = useState(value);
  const shown = interactive ? p : value;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="grid w-full max-w-[220px] grid-cols-10 gap-0.5">
        {Array.from({ length: 100 }, (_, i) => (
          <span key={i} className={`aspect-square rounded-[3px] ${i < shown ? "bg-brand" : "bg-slate-200"}`} />
        ))}
      </div>
      {interactive && (
        <>
          <input type="range" min="0" max="100" value={p} onChange={(e) => setP(Number(e.target.value))} className="w-full accent-brand" aria-label="Процент" />
          <p className="font-display text-lg font-bold">
            {p}% = {p}/100 = {(p / 100).toFixed(2).replace(".", ",")} · {p}% от 300 = {(300 * p) / 100}
          </p>
        </>
      )}
    </div>
  );
}

// ---------- Площадь и периметр ----------
export function AreaGrid({ w = 5, h = 3, interactive = true }) {
  const [a, setA] = useState(w);
  const [b, setB] = useState(h);
  const W = interactive ? a : w;
  const H = interactive ? b : h;
  const cell = 22;
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${W * cell + 40} ${H * cell + 36}`} className="max-h-48 w-full">
        {Array.from({ length: W * H }, (_, i) => (
          <rect key={i} x={20 + (i % W) * cell} y={8 + Math.floor(i / W) * cell} width={cell - 2} height={cell - 2} rx="3" fill="var(--brand-tint)" />
        ))}
        <rect x="19" y="7" width={W * cell} height={H * cell} fill="none" stroke="var(--brand)" strokeWidth="3" rx="3" />
        <text x={20 + (W * cell) / 2} y={H * cell + 28} textAnchor="middle" fontSize="12" fontWeight="800" fill="#334155">
          {W} см
        </text>
        <text x="10" y={8 + (H * cell) / 2} textAnchor="middle" fontSize="12" fontWeight="800" fill="#334155" transform={`rotate(-90 10 ${8 + (H * cell) / 2})`}>
          {H} см
        </text>
      </svg>
      {interactive && (
        <>
          <div className="flex flex-wrap justify-center gap-2">
            <Stepper label="Длина a" value={a} onChange={setA} max={10} />
            <Stepper label="Ширина b" value={b} onChange={setB} max={6} />
          </div>
          <div className="grid w-full grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-sky-50 p-2 text-sm">
              Площадь S = {a} · {b} = <b className="text-brand">{a * b} см²</b>
            </div>
            <div className="rounded-xl bg-violet-50 p-2 text-sm">
              Периметр P = 2 · ({a} + {b}) = <b className="text-brand-2">{2 * (a + b)} см</b>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Шкала прибора и цена деления ----------
export function ScaleSvg({ from = 20, to = 30, divisions = 5, pointer = null }) {
  const step = (to - from) / divisions;
  return (
    <svg viewBox="0 0 300 70" className="w-full">
      <rect x="10" y="20" width="280" height="30" rx="6" fill="#f8fafc" stroke="#cbd5e1" />
      {Array.from({ length: divisions + 1 }, (_, i) => {
        const x = 20 + (i * 260) / divisions;
        const major = i === 0 || i === divisions;
        return (
          <g key={i}>
            <line x1={x} y1="20" x2={x} y2={major ? 44 : 36} stroke="#334155" strokeWidth={major ? 2.5 : 1.5} />
            {major && (
              <text x={x} y="64" textAnchor="middle" fontSize="12" fontWeight="800" fill="#334155">
                {i === 0 ? from : to}
              </text>
            )}
          </g>
        );
      })}
      {pointer !== null && <path d={`M${20 + ((pointer - from) / (to - from)) * 260} 14 l-6 -10 h12 z`} fill="#e11d48" />}
      <text x="150" y="14" textAnchor="middle" fontSize="9" fill="#94a3b8">
        {pointer === null ? `${divisions} делений` : `цена деления ${String(step).replace(".", ",")}`}
      </text>
    </svg>
  );
}

export function Measure() {
  const [divs, setDivs] = useState(5);
  const [pos, setPos] = useState(3);
  const step = 10 / divs;
  const reading = 20 + pos * step;
  return (
    <div>
      <div className="mb-2 flex gap-2">
        {[2, 5, 10].map((d) => (
          <button key={d} onClick={() => { setDivs(d); setPos(Math.min(pos, d)); }} className={`flex-1 rounded-xl py-2 text-sm font-extrabold ${divs === d ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}>
            {d} делений
          </button>
        ))}
      </div>
      <ScaleSvg from={20} to={30} divisions={divs} pointer={reading} />
      <input type="range" min="0" max={divs} value={pos} onChange={(e) => setPos(Number(e.target.value))} className="w-full accent-brand" aria-label="Положение стрелки" />
      <p className="text-center text-sm font-bold text-slate-600">
        Цена деления: (30 − 20) : {divs} = <b className="text-brand">{String(step).replace(".", ",")}</b> · Показание: <b className="text-brand">{String(reading).replace(".", ",")}</b>
      </p>
    </div>
  );
}

// ---------- Движение и скорость ----------
export function Motion() {
  const [speed, setSpeed] = useState(36);
  const [time, setTime] = useState(10);
  const [run, setRun] = useState(0);
  const ms = speed / 3.6;
  const dist = Math.round(ms * time);
  return (
    <div>
      <div className="relative h-24 overflow-hidden rounded-2xl bg-linear-to-b from-sky-100 to-sky-50" style={{ containerType: "inline-size" }}>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-slate-600">
          <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-white/70" />
        </div>
        <span
          key={run}
          className="absolute bottom-3 left-2 text-4xl"
          style={{ animation: run ? `drive ${Math.max(0.6, 6 - speed / 30)}s ease-in-out forwards` : "none", "--drive-to": "calc(100cqw - 60px)" }}
        >
          <Emoji e="🚗" />
        </span>
        <span className="absolute right-3 top-2 text-2xl"><Emoji e="🏁" /></span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-600">
          Скорость: {speed} км/ч = {ms.toFixed(1).replace(".", ",")} м/с
          <input type="range" min="5" max="180" step="1" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-brand" />
        </label>
        <label className="text-sm font-bold text-slate-600">
          Время: {time} с
          <input type="range" min="1" max="60" value={time} onChange={(e) => setTime(Number(e.target.value))} className="w-full accent-brand" />
        </label>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="font-display font-bold">s = v · t = {ms.toFixed(1).replace(".", ",")} · {time} ≈ {dist} м</span>
        <button onClick={() => setRun(run + 1)} className="inline-flex items-center gap-1 rounded-xl bg-brand px-3 py-2 text-sm font-extrabold text-white">
          <Play size={16} /> Поехали
        </button>
      </div>
    </div>
  );
}

// ---------- Плотность: тонет или плавает ----------
const OBJECTS = [
  { id: "cork", label: "Пробка", emoji: "🍾", rho: 240 },
  { id: "wood", label: "Сосна", emoji: "🪵", rho: 500 },
  { id: "ice", label: "Лёд", emoji: "🧊", rho: 900 },
  { id: "al", label: "Алюминий", emoji: "🥫", rho: 2700 },
  { id: "iron", label: "Железо", emoji: "🔩", rho: 7800 },
  { id: "gold", label: "Золото", emoji: "🪙", rho: 19300 },
];

export function Density() {
  const [obj, setObj] = useState(OBJECTS[2]);
  const floats = obj.rho < 1000;
  const submerged = floats ? obj.rho / 1000 : 1;
  const top = floats ? `${38 - submerged * 22}%` : "78%";
  return (
    <div>
      <div className="relative h-48 overflow-hidden rounded-2xl bg-sky-50 ring-1 ring-sky-200">
        <div className="absolute inset-x-0 bottom-0 top-[38%] bg-linear-to-b from-sky-300/70 to-blue-500/70" />
        <span key={obj.id} className="absolute left-1/2 -translate-x-1/2 text-5xl transition-all duration-1000" style={{ top }}>
          <Em t={obj.emoji} />
        </span>
        <span className="absolute left-3 top-[40%] text-xs font-extrabold text-white">Вода · 1000 кг/м³</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {OBJECTS.map((o) => (
          <button key={o.id} onClick={() => setObj(o)} className={`rounded-xl p-2 text-center text-xs font-bold ${obj.id === o.id ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}>
            <span className="block text-xl"><Em t={o.emoji} /></span>
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-sm font-bold">
        {obj.label}: ρ = {obj.rho.toLocaleString("ru-RU")} кг/м³ — {floats ? <span className="text-emerald-600">меньше плотности воды, плавает</span> : <span className="text-rose-600">больше плотности воды, тонет</span>}
      </p>
    </div>
  );
}

// ---------- Сила тяжести на разных планетах ----------
const PLANETS = [
  { id: "earth", label: "Земля", emoji: "🌍", g: 9.8 },
  { id: "moon", label: "Луна", emoji: "🌕", g: 1.6 },
  { id: "mars", label: "Марс", emoji: "🔴", g: 3.7 },
  { id: "jupiter", label: "Юпитер", emoji: "🪐", g: 24.8 },
];

export function Gravity() {
  const [planet, setPlanet] = useState(PLANETS[0]);
  const [mass, setMass] = useState(40);
  const F = mass * planet.g;
  const bar = Math.min(100, (F / (80 * 24.8)) * 100);
  return (
    <div>
      <div className="mb-3 grid grid-cols-4 gap-2">
        {PLANETS.map((p) => (
          <button key={p.id} onClick={() => setPlanet(p)} className={`rounded-xl p-2 text-center text-xs font-bold ${planet.id === p.id ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}>
            <span className="block text-2xl"><Em t={p.emoji} /></span>
            {p.label}
          </button>
        ))}
      </div>
      <label className="text-sm font-bold text-slate-600">
        Масса школьника: {mass} кг
        <input type="range" min="10" max="80" value={mass} onChange={(e) => setMass(Number(e.target.value))} className="w-full accent-brand" />
      </label>
      <div className="mt-2 h-4 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-linear-to-r from-amber-400 to-rose-500 transition-all duration-500" style={{ width: `${bar}%` }} />
      </div>
      <p className="mt-2 text-center font-display font-bold">
        F = m · g = {mass} · {String(planet.g).replace(".", ",")} ≈ {Math.round(F)} Н
      </p>
      <p className="text-center text-xs text-slate-500">Масса везде одна и та же, а сила тяжести зависит от планеты.</p>
    </div>
  );
}

// ---------- Таймер-хук для анимаций (общий) ----------
export function useTicker(ms, on = true) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setT((x) => x + 1), ms);
    return () => clearInterval(id);
  }, [ms, on]);
  return t;
}
