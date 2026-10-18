// Эмодзи как картинки: 3D-иллюстрации Microsoft Fluent Emoji (MIT) из public/emoji.
// Картинка масштабируется по размеру шрифта родителя (1 em), поэтому классы
// вроде text-4xl продолжают управлять размером. Новые эмодзи в коде:
// npm run emoji:fetch — скрипт скачает недостающие картинки.
import EMOJI_MAP from "@/lib/emojiMap.json";

const RE = /((?:\p{Regional_Indicator}{2}|[0-9#*]️?⃣|\p{Extended_Pictographic})(?:️|[\u{1F3FB}-\u{1F3FF}]|‍\p{Extended_Pictographic}️?)*)/u;

function fileFor(e) {
  return EMOJI_MAP[e] || EMOJI_MAP[e.replace(/️/g, "")] || EMOJI_MAP[`${e}️`] || null;
}

export function Emoji({ e, size = "1.15em", className = "", label }) {
  const file = e && fileFor(e);
  if (!file) return <span className={className}>{e}</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/emoji/${file}`}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
      loading="lazy"
      decoding="async"
      className={`inline-block select-none align-[-0.18em] ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Эмодзи-картинка внутри <svg> (x, y — левый верхний угол). */
export function SvgEmoji({ e, x, y, size = 16, className }) {
  const file = fileFor(e);
  if (!file) return null;
  return <image href={`/emoji/${file}`} x={x} y={y} width={size} height={size} className={className} aria-hidden="true" />;
}

/** Заменяет эмодзи в строке (или в дочерних строках) на картинки. */
export function Em({ children, t, size }) {
  const value = t ?? children;
  if (typeof value !== "string") {
    if (Array.isArray(value)) return value.map((v, i) => (typeof v === "string" ? <Em key={i} t={v} size={size} /> : v));
    return value ?? null;
  }
  if (!RE.test(value)) return value;
  return value.split(RE).map((part, i) => (i % 2 === 1 ? <Emoji key={i} e={part} size={size} /> : part || null));
}
