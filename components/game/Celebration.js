"use client";
import { useGame } from "@/components/providers/GameProvider";
import { ACHIEVEMENT_MAP, RARITY } from "@/lib/achievements";
import { getItem } from "@/lib/shop";
import Lumi from "@/components/teacher/Lumi";
import Button from "@/components/ui/Button";
import { LumosAmount } from "@/components/ui/LumosIcon";
import XpAmount from "@/components/ui/XpBadge";
import { levelTitle } from "@/lib/levels";
import { Em, Emoji } from "@/components/ui/Emoji";

const pseudo = (i, k) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Дождь частиц в стиле выбранного «эффекта наград» из магазина. */
export function Confetti({ count = 28 }) {
  const { state } = useGame();
  const effect = getItem(state?.profile.equipped.xpEffect) || getItem("effect-stars");
  return (
    <div className="pointer-events-none fixed inset-0 z-[85] overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: `${pseudo(i, 1) * 100}%`,
            fontSize: `${16 + pseudo(i, 2) * 22}px`,
            animation: `fall ${2.4 + pseudo(i, 3) * 2.2}s linear ${pseudo(i, 4) * 1.2}s forwards`,
          }}
        >
          <Emoji e={effect.particles[i % effect.particles.length]} size="1em" />
        </span>
      ))}
    </div>
  );
}

export default function CelebrationLayer() {
  const { celebrations, popCelebration, state } = useGame();
  const current = celebrations[0];
  if (!current || !state) return null;

  let body;
  if (current.kind === "level") {
    body = (
      <>
        <Lumi emotion="celebrate" costume={state.profile.equipped.costume} size={150} className="mx-auto" />
        <p className="font-display text-sm font-bold uppercase tracking-widest text-brand">Новый уровень</p>
        <p className="font-display text-6xl font-extrabold text-brand-gradient">{current.to}</p>
        <p className="text-lg font-extrabold">{levelTitle(current.to)}</p>
        <p className="text-slate-500">Ты растёшь с каждым уроком!</p>
      </>
    );
  } else {
    const a = ACHIEVEMENT_MAP[current.id];
    if (!a) return null;
    const r = RARITY[a.rarity];
    body = (
      <>
        <p className="font-display text-sm font-bold uppercase tracking-widest" style={{ color: r.color }}>
          Достижение открыто!
        </p>
        <div className={`animate-pop relative mx-auto grid h-32 w-32 place-items-center rounded-[2rem] bg-linear-to-br ${r.bg} text-6xl shadow-xl ring-4 ${r.ring}`}>
          <span className="shine absolute inset-0 rounded-[2rem]" />
          <span className="relative"><Em t={a.medal || a.icon} /></span>
        </div>
        <p className="font-display text-2xl font-extrabold">{a.title}</p>
        <p className="text-slate-500">{a.description}</p>
        <span className="mx-auto rounded-full px-3 py-1 text-xs font-extrabold text-white" style={{ background: r.color }}>
          {r.label}
        </span>
        {(a.reward.xp > 0 || a.reward.lumos > 0) && (
          <div className="flex justify-center gap-3">
            {a.reward.xp > 0 && <XpAmount value={`+${a.reward.xp}`} className="text-amber-600" />}
            {a.reward.lumos > 0 && <LumosAmount value={`+${a.reward.lumos}`} className="text-violet-600" />}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <Confetti key={current.key} />
      <div key={current.key} className="card animate-pop relative z-[86] flex w-full max-w-sm flex-col gap-3 p-7 text-center">
        {body}
        <Button onClick={popCelebration} variant="gradient" size="lg" className="mt-2 w-full" autoFocus>
          Круто!
        </Button>
      </div>
    </div>
  );
}
