import Link from "next/link";
import { useId } from "react";

/** Логотип EduQuest: кристалл-компас над раскрытой книгой — «путь к знаниям». */
export function LogoMark({ size = 40, className = "" }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--brand, #2563eb)" />
          <stop offset="1" stopColor="var(--brand-2, #7c3aed)" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a5f3fc" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="14" fill={`url(#${id}a)`} />
      <path d="M10 31c4.5-2 9-2 14 1 5-3 9.5-3 14-1v6c-4.5-2-9-2-14 1-5-3-9.5-3-14-1z" fill="#fff" opacity="0.95" />
      <path d="M24 32V38" stroke={`url(#${id}a)`} strokeWidth="1.6" />
      <path d="M24 7l6 11-6 11-6-11z" fill={`url(#${id}b)`} />
      <path d="M24 7l6 11h-12z" fill="#fff" opacity="0.55" />
      <circle cx="35.5" cy="11.5" r="2" fill="#fde047" />
    </svg>
  );
}

export default function Logo({ href = "/", compact = false }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2.5" aria-label="EduQuest — на главную">
      <LogoMark />
      {!compact && (
        <span className="font-display text-xl font-extrabold tracking-tight">
          <span className="text-brand">Edu</span>
          <span className="text-brand-2">Quest</span>
        </span>
      )}
    </Link>
  );
}
