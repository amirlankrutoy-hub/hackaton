"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { lastNDays, formatShort } from "@/lib/time";

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl bg-white px-3 py-2 text-sm shadow-lg ring-1 ring-slate-200">
      <p className="font-extrabold text-slate-700">{d.label}</p>
      <p className="text-slate-600">{d.xp} XP</p>
      <p className="text-slate-500">
        Мини-игр: {d.games} · верных ответов: {d.correct}
      </p>
    </div>
  );
}

/** Опыт по дням за последние 14 дней (одна серия — легенда не нужна, заголовок её называет). */
export default function ActivityChart({ activity, today }) {
  const [table, setTable] = useState(false);
  const data = lastNDays(14, today).map((d) => ({
    day: d,
    label: formatShort(d),
    xp: activity[d]?.xp || 0,
    games: activity[d]?.games || 0,
    correct: activity[d]?.correct || 0,
  }));
  const total = data.reduce((s, d) => s + d.xp, 0);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          За 14 дней: <b className="text-slate-700">{total} XP</b>
        </p>
        <button onClick={() => setTable(!table)} className="text-xs font-extrabold text-brand hover:underline">
          {table ? "Показать график" : "Показать таблицей"}
        </button>
      </div>
      {table ? (
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="py-1">День</th>
                <th className="py-1 text-right">XP</th>
                <th className="py-1 text-right">Игр</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.day} className="border-t border-slate-100">
                  <td className="py-1.5 font-bold">{d.label}</td>
                  <td className="py-1.5 text-right tabular-nums">{d.xp}</td>
                  <td className="py-1.5 text-right tabular-nums">{d.games}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-56 w-full" role="img" aria-label={`График опыта по дням, всего ${total} XP за 14 дней`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} interval="preserveStartEnd" minTickGap={12} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(37 99 235 / 0.06)" }} />
              <Bar dataKey="xp" fill="var(--brand)" radius={[4, 4, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
