import { getItem } from "@/lib/shop";
import { Em } from "@/components/ui/Emoji";

/** Аватар ученика с рамкой из магазина. */
export default function Avatar({ avatar = "avatar-fox", frame = null, size = 44, className = "" }) {
  const a = getItem(avatar) || getItem("avatar-fox");
  const f = frame ? getItem(frame) : null;
  const pad = f ? Math.max(2, Math.round(size * 0.07)) : 0;
  return (
    <span className={`relative inline-grid shrink-0 place-items-center rounded-full ${className}`} style={{ width: size, height: size, padding: pad, background: f?.ring }}>
      <span className="grid h-full w-full place-items-center rounded-full ring-2 ring-white" style={{ background: `linear-gradient(135deg, ${a.bg[0]}, ${a.bg[1]})`, fontSize: (size - pad * 2) * 0.55 }}>
        <span aria-hidden="true"><Em t={a.emoji} /></span>
      </span>
    </span>
  );
}
