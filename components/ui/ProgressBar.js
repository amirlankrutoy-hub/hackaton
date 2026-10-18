export default function ProgressBar({ value = 0, className = "", barClass = "bg-brand-gradient", trackClass = "bg-slate-200/80", height = "h-3", label }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className={`w-full ${className}`}>
      <div className={`${height} w-full overflow-hidden rounded-full ${trackClass}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`relative h-full rounded-full ${barClass} transition-[width] duration-700 ease-out`} style={{ width: `${pct}%` }}>
          <div className="absolute inset-x-1 top-0.5 h-1/3 rounded-full bg-white/35" />
        </div>
      </div>
    </div>
  );
}
