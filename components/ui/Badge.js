const TONES = {
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-blue-100 text-blue-700",
  violet: "bg-violet-100 text-violet-700",
  teal: "bg-teal-100 text-teal-700",
  gold: "bg-amber-100 text-amber-700",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-rose-100 text-rose-700",
  orange: "bg-orange-100 text-orange-700",
  brand: "bg-brand-soft text-brand",
};

export default function Badge({ tone = "slate", className = "", children }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${TONES[tone] || TONES.slate} ${className}`}>{children}</span>;
}
