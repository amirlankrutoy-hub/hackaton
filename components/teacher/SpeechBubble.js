"use client";
import { useEffect, useState } from "react";
import { Em } from "@/components/ui/Emoji";

/**
 * Реплика учителя с эффектом «печати». onTyping сообщает, говорит ли Луми.
 * Родитель передаёт key={text}, чтобы новая реплика печаталась с начала.
 */
export default function SpeechBubble({ text, onTyping, children, tone = "white" }) {
  const chars = Array.from(text);
  const [shown, setShown] = useState(0);
  const done = shown >= chars.length;

  useEffect(() => {
    if (done) return;
    const id = setTimeout(() => setShown((n) => Math.min(chars.length, n + 2)), 18);
    return () => clearTimeout(id);
  }, [shown, done, chars.length]);

  useEffect(() => {
    onTyping?.(!done);
  }, [done, onTyping]);

  useEffect(() => () => onTyping?.(false), [onTyping]);

  return (
    <div onClick={() => setShown(chars.length)} className={`relative rounded-3xl p-5 shadow-lg ${tone === "brand" ? "bg-brand-soft ring-1 ring-brand/20" : "bg-white ring-1 ring-slate-200"}`}>
      <p className="whitespace-pre-line text-[17px] font-semibold leading-relaxed text-slate-700">
        <Em t={chars.slice(0, shown).join("")} />
        {!done && <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-brand align-middle" />}
      </p>
      {done && children && <div className="animate-rise mt-3">{children}</div>}
      {!done && <p className="mt-2 text-xs font-bold text-slate-400">Нажми, чтобы показать сразу</p>}
    </div>
  );
}
