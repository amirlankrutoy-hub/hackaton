"use client";
import { useId } from "react";
import { SvgEmoji } from "@/components/ui/Emoji";
// Луми — AI-учитель EduQuest: дружелюбный дух знаний с кристаллом Lumos.
// emotion: idle | talk | happy | think | encourage | wow | celebrate
// costume: id предмета из магазина (costume-*), надевается поверх персонажа.

function Eyes({ emotion }) {
  if (emotion === "happy" || emotion === "celebrate") {
    return (
      <g stroke="#1e1b4b" strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M66 112 q10 -12 20 0" />
        <path d="M114 112 q10 -12 20 0" />
      </g>
    );
  }
  const big = emotion === "wow";
  const look = emotion === "think" ? { x: 4, y: -5 } : { x: 0, y: 0 };
  return (
    <g>
      <g className="animate-blink">
        <ellipse cx="76" cy="110" rx={big ? 15 : 13} ry={big ? 17 : 15} fill="#fff" />
        <ellipse cx="124" cy="110" rx={big ? 15 : 13} ry={big ? 17 : 15} fill="#fff" />
        <circle cx={78 + look.x} cy={112 + look.y} r={big ? 8 : 7} fill="#1e1b4b" />
        <circle cx={126 + look.x} cy={112 + look.y} r={big ? 8 : 7} fill="#1e1b4b" />
        <circle cx={81 + look.x} cy={108 + look.y} r="2.6" fill="#fff" />
        <circle cx={129 + look.x} cy={108 + look.y} r="2.6" fill="#fff" />
      </g>
      {emotion === "encourage" && (
        <g stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round">
          <path d="M63 92 l18 4" />
          <path d="M137 92 l-18 4" />
        </g>
      )}
      {emotion === "think" && (
        <g stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round">
          <path d="M64 94 l18 -3" />
          <path d="M118 90 l18 2" />
        </g>
      )}
    </g>
  );
}

function Mouth({ emotion, speaking }) {
  if (speaking || emotion === "talk") {
    return <ellipse cx="100" cy="140" rx="11" ry="9" fill="#7f1d1d" className="animate-talk" />;
  }
  switch (emotion) {
    case "happy":
      return <path d="M82 134 q18 20 36 0 z" fill="#7f1d1d" />;
    case "celebrate":
      return (
        <g>
          <path d="M78 132 q22 28 44 0 z" fill="#7f1d1d" />
          <path d="M88 146 q12 6 24 0" fill="#fb7185" />
        </g>
      );
    case "wow":
      return <ellipse cx="100" cy="142" rx="8" ry="10" fill="#7f1d1d" />;
    case "think":
      return <path d="M90 142 q8 -4 20 0" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" fill="none" />;
    case "encourage":
      return <path d="M86 138 q14 10 28 0" stroke="#1e1b4b" strokeWidth="4.5" strokeLinecap="round" fill="none" />;
    default:
      return <path d="M86 136 q14 12 28 0" stroke="#1e1b4b" strokeWidth="4.5" strokeLinecap="round" fill="none" />;
  }
}

function Costume({ id }) {
  switch (id) {
    case "costume-glasses":
      return (
        <g fill="rgb(255 255 255 / 0.15)" stroke="#0f172a" strokeWidth="4">
          <circle cx="76" cy="111" r="19" />
          <circle cx="124" cy="111" r="19" />
          <path d="M95 109 q5 -4 10 0" fill="none" />
        </g>
      );
    case "costume-cap":
      return (
        <g>
          <path d="M60 62 l40 -18 l40 18 l-40 16 z" fill="#1e293b" />
          <path d="M74 68 v14 q26 12 52 0 v-14 l-26 10 z" fill="#334155" />
          <path d="M140 62 v22" stroke="#fbbf24" strokeWidth="3" />
          <circle cx="140" cy="86" r="4" fill="#fbbf24" />
        </g>
      );
    case "costume-headphones":
      return (
        <g>
          <path d="M40 112 q0 -72 60 -72 q60 0 60 72" stroke="#0f172a" strokeWidth="8" fill="none" strokeLinecap="round" />
          <rect x="28" y="100" width="20" height="36" rx="9" fill="#f43f5e" />
          <rect x="152" y="100" width="20" height="36" rx="9" fill="#f43f5e" />
        </g>
      );
    case "costume-scarf":
      return (
        <g>
          <path d="M48 158 q52 26 104 0 l4 14 q-56 28 -112 0 z" fill="#14b8a6" />
          <path d="M132 168 l10 34 l-16 2 l-4 -30 z" fill="#0d9488" />
          <path d="M60 164 l2 8 M80 170 l1 8 M100 172 v8 M120 170 l-1 8" stroke="#99f6e4" strokeWidth="3" />
        </g>
      );
    case "costume-wizard":
      return (
        <g>
          <path d="M100 6 L140 70 Q100 82 60 70 Z" fill="#4338ca" />
          <path d="M52 70 q48 20 96 0 q-4 10 -48 14 q-44 -4 -48 -14z" fill="#312e81" />
          <SvgEmoji e="⭐" x={88} y={40} size={14} />
          <SvgEmoji e="✨" x={106} y={25} size={10} />
        </g>
      );
    case "costume-crown":
      return (
        <g>
          <path d="M66 70 l6 -30 l16 18 l12 -26 l12 26 l16 -18 l6 30 z" fill="#facc15" stroke="#ca8a04" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="100" cy="56" r="5" fill="#f43f5e" />
          <circle cx="80" cy="62" r="3.5" fill="#22d3ee" />
          <circle cx="120" cy="62" r="3.5" fill="#22d3ee" />
        </g>
      );
    default:
      return null;
  }
}

export default function Lumi({ emotion = "idle", speaking = false, costume = null, size = 200, className = "" }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const celebrate = emotion === "celebrate";
  const tallHat = costume === "costume-wizard";
  return (
    <div className={`relative select-none ${className}`} style={{ width: size, height: size * 1.1 }} aria-label="AI-учитель Луми" role="img">
      <svg viewBox="0 0 200 220" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id={`${uid}body`} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#93c5fd" />
            <stop offset="0.55" stopColor="var(--brand, #2563eb)" />
            <stop offset="1" stopColor="var(--brand-2, #7c3aed)" />
          </radialGradient>
          <linearGradient id={`${uid}crystal`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a5f3fc" />
            <stop offset="0.6" stopColor="#818cf8" />
            <stop offset="1" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        <ellipse cx="100" cy="210" rx="58" ry="8" fill="rgb(15 23 42 / 0.12)" />

        <g className="animate-float">
          {/* Кристалл Lumos над головой */}
          {!tallHat && (
            <g className="animate-glow">
              <path d="M100 4 l13 18 l-13 26 l-13 -26 z" fill={`url(#${uid}crystal)`} />
              <path d="M100 4 l13 18 h-26 z" fill="#fff" opacity="0.55" />
              <path d="M100 48 v6" stroke="#a5b4fc" strokeWidth="3" />
            </g>
          )}

          {/* Руки */}
          <g fill="var(--brand-2, #7c3aed)">
            <ellipse cx="34" cy={celebrate ? 96 : 150} rx="14" ry="20" transform={celebrate ? "rotate(-30 34 96)" : "rotate(20 34 150)"} className={celebrate ? "animate-wiggle" : ""} />
            <ellipse cx="166" cy={celebrate || emotion === "talk" || speaking ? 100 : 150} rx="14" ry="20" transform={celebrate || emotion === "talk" || speaking ? "rotate(30 166 100)" : "rotate(-20 166 150)"} className={celebrate || speaking ? "animate-wiggle" : ""} />
          </g>

          {/* Тело */}
          <path d="M100 54 C150 54 172 92 170 132 C168 178 140 200 100 200 C60 200 32 178 30 132 C28 92 50 54 100 54 Z" fill={`url(#${uid}body)`} />
          <ellipse cx="100" cy="168" rx="40" ry="24" fill="#fff" opacity="0.18" />
          <ellipse cx="72" cy="78" rx="18" ry="9" fill="#fff" opacity="0.28" transform="rotate(-25 72 78)" />

          <Eyes emotion={emotion} />
          <circle cx="58" cy="132" r="9" fill="#fb7185" opacity="0.45" />
          <circle cx="142" cy="132" r="9" fill="#fb7185" opacity="0.45" />
          <Mouth emotion={emotion} speaking={speaking} />

          <Costume id={costume} />
          {tallHat && <path d="M100 0 l8 10 l-8 12 l-8 -12 z" fill={`url(#${uid}crystal)`} className="animate-glow" />}
        </g>

        {celebrate && (
          <g fontSize="18">
            <SvgEmoji e="✨" x={6} y={24} size={18} className="animate-pop" />
            <SvgEmoji e="🎉" x={170} y={14} size={18} className="animate-pop" />
            <SvgEmoji e="⭐" x={176} y={164} size={18} className="animate-pop" />
          </g>
        )}
        {emotion === "think" && (
          <g fill="#94a3b8">
            <circle cx="160" cy="58" r="4" className="animate-pulse" />
            <circle cx="172" cy="44" r="6" className="animate-pulse" />
            <circle cx="188" cy="26" r="8" className="animate-pulse" />
          </g>
        )}
      </svg>
    </div>
  );
}
