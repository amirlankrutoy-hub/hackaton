// Скачивает картинки для всех эмодзи, встречающихся в коде, в public/emoji/
// и создаёт lib/emojiMap.json. Запуск: npm run emoji:fetch
// Источник: Microsoft Fluent Emoji 3D (MIT), запасной — Twemoji (CC-BY 4.0).
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "public", "emoji");
const FLUENT = "https://cdn.jsdelivr.net/npm/@lobehub/fluent-emoji-3d@1.1.0/assets/";
const TWEMOJI = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/";
const RE = /(?:\p{Regional_Indicator}{2}|[0-9#*]️?⃣|\p{Extended_Pictographic})(?:️|[\u{1F3FB}-\u{1F3FF}]|‍\p{Extended_Pictographic}️?)*/gu;
const SKIP = new Set(["©", "®", "™"]);

function walk(dir, found) {
  for (const f of readdirSync(dir)) {
    if (["node_modules", ".next", ".git", "public"].includes(f)) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, found);
    else if (/\.(js|mjs)$/.test(f) && !p.endsWith("fetch-emoji.mjs")) for (const m of readFileSync(p, "utf8").matchAll(RE)) if (!SKIP.has(m[0])) found.add(m[0]);
  }
  return found;
}

const code = (e) => [...e].map((c) => c.codePointAt(0).toString(16).padStart(4, "0")).join("-");
const variants = (e) => {
  const full = code(e);
  const bare = code(e.replace(/️/g, ""));
  return [...new Set([full, bare, `${bare}-fe0f`])];
};

async function download(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url);
      if (r.status === 404) return null;
      if (r.ok) return Buffer.from(await r.arrayBuffer());
    } catch {}
    await new Promise((r) => setTimeout(r, 400 * (i + 1)));
  }
  return null;
}

const listing = await download("https://data.jsdelivr.com/v1/packages/npm/@lobehub/fluent-emoji-3d@1.1.0?structure=flat");
if (!listing) throw new Error("Не удалось получить список файлов Fluent Emoji");
const { files } = JSON.parse(listing.toString("utf8"));
const available = new Set(files.map((f) => f.name.replace("/assets/", "").replace(".webp", "")));

mkdirSync(OUT, { recursive: true });
const mapPath = join(ROOT, "lib", "emojiMap.json");
const map = existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, "utf8")) : {};
const emojis = [...walk(join(ROOT, "app"), walk(join(ROOT, "components"), walk(join(ROOT, "lib"), new Set())))];
const missing = [];

async function pool(items, size, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: size }, async () => {
    while (queue.length) await fn(queue.shift());
  }));
}

await pool(emojis, 6, async (e) => {
    const hasFluent = variants(e).some((v) => available.has(v));
    if (map[e] && existsSync(join(OUT, map[e])) && (map[e].endsWith(".webp") || !hasFluent)) return;
    const hit = variants(e).find((v) => available.has(v));
    if (hit) {
      const buf = await download(`${FLUENT}${hit}.webp`);
      if (buf) {
        writeFileSync(join(OUT, `${hit}.webp`), buf);
        map[e] = `${hit}.webp`;
        return;
      }
    }
    const tw = code(e.includes("‍") ? e : e.replace(/️/g, ""));
    const svg = await download(`${TWEMOJI}${tw}.svg`);
    if (svg) {
      writeFileSync(join(OUT, `${tw}.svg`), svg);
      map[e] = `${tw}.svg`;
    } else missing.push(e);
});

writeFileSync(mapPath, JSON.stringify(Object.fromEntries(Object.entries(map).sort()), null, 0) + "\n");
console.log(`Эмодзи в коде: ${emojis.length}, с картинками: ${Object.keys(map).length}${missing.length ? `, без картинки: ${missing.join(" ")}` : ""}`);
