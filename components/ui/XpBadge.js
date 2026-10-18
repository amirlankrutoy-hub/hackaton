import { Zap } from "lucide-react";

export default function XpAmount({ value, size = 16, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 font-extrabold tabular-nums ${className}`}>
      <span className="grid place-items-center rounded-full bg-amber-400 text-white" style={{ width: size + 4, height: size + 4 }}>
        <Zap size={size - 3} fill="currentColor" strokeWidth={0} />
      </span>
      {value}
      <span className="text-[0.75em] opacity-70">XP</span>
    </span>
  );
}
