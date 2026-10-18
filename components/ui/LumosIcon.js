import { useId } from "react";

/** Иконка валюты Lumos — светящийся кристалл энергии. */
export default function LumosIcon({ size = 20, className = "", glow = false }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`${glow ? "animate-glow" : ""} ${className}`} aria-label="Lumos" role="img">
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="0.55" stopColor="#818cf8" />
          <stop offset="1" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <path d="M12 1.5l6.5 7.2L12 22.5 5.5 8.7z" fill={`url(#${id}l)`} />
      <path d="M12 1.5l6.5 7.2H5.5z" fill="#fff" opacity="0.45" />
      <path d="M12 8.7v13.8L5.5 8.7z" fill="#4f46e5" opacity="0.25" />
      <circle cx="18.6" cy="4" r="1.3" fill="#fef9c3" />
      <circle cx="4.6" cy="15.5" r="0.9" fill="#e0f2fe" />
    </svg>
  );
}

export function LumosAmount({ value, size = 18, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 font-extrabold tabular-nums ${className}`}>
      <LumosIcon size={size} />
      {value}
    </span>
  );
}
