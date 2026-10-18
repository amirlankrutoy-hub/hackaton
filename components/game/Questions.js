"use client";
import { useMemo, useState } from "react";
import { Check, X, Undo2 } from "lucide-react";
import { shuffle } from "@/lib/grading";
import { FractionPie, PercentGrid, AreaGrid, ScaleSvg } from "@/components/visuals/mathphys";
import { MoleculeSvg } from "@/components/visuals/chemistry";
import Button from "@/components/ui/Button";
import { Em } from "@/components/ui/Emoji";

const TYPE_LABEL = {
  mcq: "Выбери ответ",
  definition: "Определение",
  formula: "Формула",
  image: "Задание с картинкой",
  fill: "Заполни пропуск",
  match: "Соедини пары",
  order: "Расставь по порядку",
};
const LETTERS = ["A", "B", "C", "D", "E"];

export function QuestionImage({ image }) {
  switch (image.kind) {
    case "emoji":
      return <div className="rounded-3xl bg-linear-to-br from-sky-50 to-violet-50 px-4 py-6 text-center text-4xl leading-snug sm:text-5xl"><Em t={image.value} /></div>;
    case "fraction":
      return <div className="flex justify-center"><FractionPie num={image.num} den={image.den} interactive={false} size={150} /></div>;
    case "percent":
      return <div className="flex justify-center"><PercentGrid value={image.value} interactive={false} /></div>;
    case "rect":
      return <div className="mx-auto max-w-xs"><AreaGrid w={image.w} h={image.h} interactive={false} /></div>;
    case "molecule":
      return <div className="flex justify-center rounded-3xl bg-slate-50 py-2"><MoleculeSvg formula={image.formula} size={140} /></div>;
    case "scale":
      return <div className="mx-auto max-w-sm"><ScaleSvg from={image.from} to={image.to} divisions={image.divisions} /></div>;
    case "binary":
      return (
        <div className="flex justify-center gap-2">
          {image.bits.split("").map((b, i) => (
            <span key={i} className={`grid h-14 w-12 place-items-center rounded-xl font-display text-2xl font-extrabold ${b === "1" ? "bg-brand text-white" : "bg-slate-100 text-slate-500"}`}>
              {b}
            </span>
          ))}
        </div>
      );
    case "element":
      return (
        <div className="mx-auto grid h-32 w-32 place-items-center rounded-2xl bg-white p-2 text-center shadow-lg ring-2 ring-brand/30">
          <div>
            <p className="text-left font-display text-lg font-bold text-rose-500">{image.number}</p>
            <p className="font-display -mt-1 text-4xl font-extrabold text-brand">{image.symbol}</p>
            <p className="text-xs font-bold">{image.name}</p>
            <p className="text-[11px] text-slate-500">{image.mass}</p>
          </div>
        </div>
      );
    default:
      return null;
  }
}

/** Варианты ответа (mcq, definition, formula, image, fill). */
function Options({ question, value, onChange, result, mono }) {
  const order = useMemo(() => shuffle(question.options.map((_, i) => i)), [question]);
  return (
    <div className={`grid gap-2.5 ${question.options.length === 2 ? "grid-cols-2" : "sm:grid-cols-2"}`}>
      {order.map((i, pos) => {
        let cls = "border-slate-200 bg-white hover:border-brand hover:bg-brand-soft";
        if (value === i && !result) cls = "border-brand bg-brand-soft ring-4 ring-brand/15";
        if (result) {
          if (i === question.answer) cls = "border-emerald-400 bg-emerald-50";
          else if (i === value) cls = "border-rose-400 bg-rose-50 animate-shake";
          else cls = "border-slate-200 bg-white opacity-50";
        }
        return (
          <button key={i} disabled={Boolean(result)} onClick={() => onChange(i)} className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 p-3 text-left font-bold transition ${cls}`}>
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${value === i ? "bg-brand text-white" : "bg-slate-100 text-slate-500"}`}>{LETTERS[pos]}</span>
            <span className={mono ? "font-display text-lg" : ""}>{question.options[i]}</span>
            {result && i === question.answer && <Check className="ml-auto shrink-0 text-emerald-500" />}
            {result && i === value && i !== question.answer && <X className="ml-auto shrink-0 text-rose-500" />}
          </button>
        );
      })}
    </div>
  );
}

function FillSentence({ question, value }) {
  const [before, after] = question.prompt.split("___");
  return (
    <p className="font-display text-xl font-bold leading-relaxed">
      {before}
      <span className={`mx-1 inline-block min-w-24 rounded-xl border-b-4 px-3 text-center ${value === null || value === undefined ? "border-slate-300 text-slate-300" : "border-brand bg-brand-soft text-brand"}`}>{value === null || value === undefined ? "…" : question.options[value]}</span>
      {after}
    </p>
  );
}

const PAIR_COLORS = ["bg-sky-100 border-sky-400", "bg-violet-100 border-violet-400", "bg-amber-100 border-amber-400", "bg-emerald-100 border-emerald-400", "bg-rose-100 border-rose-400"];

function MatchPairs({ question, value, onChange, result }) {
  const lefts = useMemo(() => shuffle(question.pairs.map((_, i) => i)), [question]);
  const rights = useMemo(() => shuffle(question.pairs.map((_, i) => i)), [question]);
  const [active, setActive] = useState(null);
  const pairs = value || {};
  const colorOf = (left) => PAIR_COLORS[Object.keys(pairs).map(Number).sort((a, b) => a - b).indexOf(left) % PAIR_COLORS.length];
  const rightOwner = (r) => Object.entries(pairs).find(([, v]) => v === r)?.[0];

  const clickLeft = (l) => {
    if (result) return;
    if (pairs[l] !== undefined) {
      const next = { ...pairs };
      delete next[l];
      onChange(next);
      setActive(null);
      return;
    }
    setActive(l);
  };
  const clickRight = (r) => {
    if (result || active === null) return;
    const next = { ...pairs };
    const owner = rightOwner(r);
    if (owner !== undefined) delete next[owner];
    next[active] = r;
    onChange(next);
    setActive(null);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {lefts.map((l) => {
            const paired = pairs[l] !== undefined;
            const ok = result && pairs[l] === l;
            return (
              <button key={l} onClick={() => clickLeft(l)} className={`flex min-h-14 w-full items-center rounded-2xl border-2 p-3 text-left text-sm font-bold transition sm:text-base ${result ? (ok ? "border-emerald-400 bg-emerald-50" : "border-rose-400 bg-rose-50") : paired ? colorOf(l) : active === l ? "border-brand bg-brand-soft ring-4 ring-brand/15" : "border-slate-200 bg-white hover:border-brand"}`}>
                {question.pairs[l][0]}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {rights.map((r) => {
            const owner = rightOwner(r);
            return (
              <button key={r} onClick={() => clickRight(r)} className={`flex min-h-14 w-full items-center rounded-2xl border-2 p-3 text-left text-sm font-bold transition sm:text-base ${owner !== undefined && !result ? colorOf(Number(owner)) : "border-slate-200 bg-white"} ${active !== null && !result ? "hover:border-brand" : ""}`}>
                {question.pairs[r][1]}
              </button>
            );
          })}
        </div>
      </div>
      {!result && <p className="mt-3 text-center text-xs font-bold text-slate-400">Нажми на элемент слева, затем на подходящий справа. Повторное нажатие слева снимает пару.</p>}
    </div>
  );
}

function OrderSteps({ question, value, onChange, result }) {
  const bank = useMemo(() => shuffle(question.items.map((_, i) => i)), [question]);
  const seq = value || [];
  return (
    <div>
      <div className="min-h-16 space-y-2 rounded-2xl border-2 border-dashed border-slate-200 p-2">
        {seq.length === 0 && <p className="p-3 text-center text-sm font-bold text-slate-400">Нажимай на шаги ниже в правильном порядке</p>}
        {seq.map((i, pos) => {
          const ok = result && i === pos;
          return (
            <button key={i} disabled={Boolean(result)} onClick={() => onChange(seq.filter((x) => x !== i))} className={`animate-pop flex w-full items-center gap-3 rounded-xl border-2 p-2.5 text-left font-bold ${result ? (ok ? "border-emerald-400 bg-emerald-50" : "border-rose-400 bg-rose-50") : "border-brand/30 bg-brand-soft"}`}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand text-sm font-extrabold text-white">{pos + 1}</span>
              {question.items[i]}
            </button>
          );
        })}
      </div>
      {!result && (
        <div className="mt-3 flex flex-wrap gap-2">
          {bank
            .filter((i) => !seq.includes(i))
            .map((i) => (
              <button key={i} onClick={() => onChange([...seq, i])} className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 font-bold transition hover:-translate-y-0.5 hover:border-brand">
                {question.items[i]}
              </button>
            ))}
          {seq.length > 0 && (
            <button onClick={() => onChange([])} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">
              <Undo2 size={16} /> Сбросить
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Преобразует внутреннее значение в формат ответа для проверки (lib/grading). */
export function toAnswer(question, value) {
  if (question.type === "match") return question.pairs.map((_, l) => (value?.[l] === undefined ? -1 : value[l]));
  return value;
}

export function isComplete(question, value) {
  if (question.type === "match") return value && Object.keys(value).length === question.pairs.length;
  if (question.type === "order") return Array.isArray(value) && value.length === question.items.length;
  return value !== null && value !== undefined;
}

/** Один вопрос мини-игры или контрольной. result: null | { correct } */
export default function QuestionView({ question, value, onChange, result, onSubmit, submitLabel = "Проверить" }) {
  const complete = isComplete(question, value);
  return (
    <div>
      <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-brand-2">{TYPE_LABEL[question.type]}</p>
      {question.type === "fill" ? (
        <div className="mb-5">
          <FillSentence question={question} value={value} />
        </div>
      ) : (
        <h2 className="font-display mb-5 text-xl font-bold leading-snug sm:text-2xl">{question.prompt}</h2>
      )}
      {question.type === "definition" && (
        <div className="mb-5 rounded-3xl bg-linear-to-br from-violet-500 to-brand p-5 text-center text-white shadow-lg">
          <p className="text-xs font-extrabold uppercase tracking-widest text-white/70">Термин</p>
          <p className="font-display text-3xl font-extrabold">{question.term}</p>
        </div>
      )}
      {question.type === "image" && (
        <div className="mb-5">
          <QuestionImage image={question.image} />
        </div>
      )}
      {question.type === "match" ? (
        <MatchPairs question={question} value={value} onChange={onChange} result={result} />
      ) : question.type === "order" ? (
        <OrderSteps question={question} value={value} onChange={onChange} result={result} />
      ) : (
        <Options question={question} value={value} onChange={onChange} result={result} mono={question.type === "formula"} />
      )}
      {onSubmit && !result && (
        <Button onClick={onSubmit} disabled={!complete} variant="gradient" size="lg" className="mt-6 w-full">
          {submitLabel}
        </Button>
      )}
    </div>
  );
}
