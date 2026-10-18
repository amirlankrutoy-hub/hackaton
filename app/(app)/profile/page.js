"use client";
import Link from "next/link";
import { useState } from "react";
import { Pencil, Settings, Lock, Globe2, Award, FileText } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { useToast } from "@/components/ui/Toast";
import { useMyRank } from "@/components/game/useLeaderboard";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import XpAmount from "@/components/ui/XpBadge";
import { LumosAmount } from "@/components/ui/LumosIcon";
import { SectionTitle } from "@/components/ui/Misc";
import ActivityChart from "@/components/game/ActivityChart";
import { SHOP_ITEMS, getItem } from "@/lib/shop";
import { ownsItem } from "@/lib/engine";
import { ACHIEVEMENT_MAP, RARITY } from "@/lib/achievements";
import { getLesson, getSubject, SUBJECTS_WITH_CONTENT } from "@/lib/content";
import { subjectProgress } from "@/lib/stats";
import { formatDate } from "@/lib/time";
import { Em } from "@/components/ui/Emoji";

export default function ProfilePage() {
  const { state, level, stats, today, dispatch } = useGame();
  const toast = useToast();
  const rank = useMyRank();
  const [picker, setPicker] = useState(false);
  const p = state.profile;
  const banner = getItem(p.equipped.banner);
  const avatars = SHOP_ITEMS.filter((i) => i.category === "avatar");
  const studying = SUBJECTS_WITH_CONTENT.filter((id) => subjectProgress(state, id).started);
  const unlocked = Object.entries(state.achievements)
    .sort((a, b) => b[1].localeCompare(a[1]))
    .map(([id]) => ACHIEVEMENT_MAP[id])
    .filter(Boolean);
  const history = [
    ...state.gameResults.map((r) => ({ ...r, kind: "game", title: getLesson(r.lessonId)?.title, score: `${r.correct}/${r.total}` })),
    ...state.examResults.map((r) => ({ ...r, kind: "exam", title: `Контрольная: ${getSubject(r.subjectId)?.title}`, score: `${r.percent}%` })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 10);
  const certificates = Object.entries(state.exams).filter(([, e]) => e.passed);

  const pickAvatar = async (id) => {
    if (!ownsItem(state, id)) {
      toast("Этот аватар можно купить в магазине", "info");
      return;
    }
    try {
      await dispatch("equipItem", { slot: "avatar", itemId: id });
      setPicker(false);
      toast("Аватар обновлён", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="relative h-32 sm:h-40" style={{ background: banner?.gradient || "linear-gradient(135deg, var(--brand), var(--brand-2))" }}>
          {banner && <span className="absolute bottom-2 right-4 text-6xl opacity-80"><Em t={banner.emoji} /></span>}
        </div>
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="relative -mt-14 shrink-0">
            <Avatar avatar={p.equipped.avatar} frame={p.equipped.frame} size={112} />
            <button onClick={() => setPicker(true)} className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full bg-white text-brand shadow-lg ring-1 ring-slate-200" aria-label="Сменить аватар">
              <Pencil size={16} />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-extrabold">{p.name}</h1>
            <p className="text-slate-500">
              @{p.username} · {p.grade} класс · с {formatDate(p.createdAt)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="brand">
                Уровень {level.level} · {level.title}
              </Badge>
              <Badge tone={p.privacy.isPublic ? "green" : "slate"}>
                {p.privacy.isPublic ? <Globe2 size={12} /> : <Lock size={12} />} {p.privacy.isPublic ? "Публичный профиль" : "Закрытый профиль"}
              </Badge>
              {p.privacy.hideRealName && <Badge tone="slate">Имя скрыто в рейтинге</Badge>}
            </div>
          </div>
          <Button href="/settings" variant="secondary" size="sm">
            <Settings size={16} /> Настройки
          </Button>
        </div>
        <div className="px-6 pb-6">
          <div className="mb-1 flex justify-between text-xs font-extrabold text-slate-500">
            <span>До уровня {level.level + 1}</span>
            <span>
              {level.current}/{level.needed} XP
            </span>
          </div>
          <ProgressBar value={level.progress} label="Прогресс уровня" />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ["Опыт", <XpAmount key="x" value={state.xp} />],
          ["Lumos", <LumosAmount key="l" value={state.lumos} />],
          ["Уровень", <span key="v" className="font-display text-xl font-extrabold">{level.level}</span>],
          ["Место в рейтинге", <span key="r" className="font-display text-xl font-extrabold">{rank ? `#${rank}` : "…"}</span>],
          ["Уроков пройдено", <span key="c" className="font-display text-xl font-extrabold">{stats.lessonsCompleted}</span>],
        ].map(([label, v]) => (
          <div key={label} className="card p-4">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</p>
            <div className="mt-1 text-lg">{v}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <SectionTitle title="Активность" subtitle={`Серия: ${stats.streak.current} · лучшая: ${stats.streak.best}`} />
            <ActivityChart activity={state.activity} today={today} />
          </section>

          <section className="card p-5">
            <SectionTitle title="Последние результаты" />
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">Здесь появятся результаты мини-игр и контрольных.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {history.map((h) => (
                  <li key={h.id} className="flex items-center gap-3 py-2.5">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${h.passed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}><Em t={h.kind === "exam" ? "📝" : h.passed ? "✓" : "✗"} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold">{h.title}</p>
                      <p className="text-xs text-slate-400">{formatDate(h.at)}</p>
                    </div>
                    <span className="font-display font-bold">{h.score}</span>
                    {(h.xp > 0 || h.lumos > 0) && <span className="hidden text-xs font-bold text-amber-600 sm:block">+{h.xp} XP</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <SectionTitle title="Изучаю" />
            {studying.length === 0 && <p className="text-sm text-slate-500">Пока нет начатых предметов.</p>}
            <div className="space-y-3">
              {studying.map((id) => {
                const s = getSubject(id);
                const pr = subjectProgress(state, id);
                return (
                  <Link key={id} href={`/subjects/${id}`} className="block">
                    <div className="mb-1 flex justify-between text-sm font-bold">
                      <span>
                        <Em t={s.emoji} /> {s.title}
                      </span>
                      <span className="text-slate-500">{pr.percent}%</span>
                    </div>
                    <ProgressBar value={pr.percent / 100} height="h-2" label={s.title} />
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="card p-5">
            <SectionTitle title="Достижения" action={<Link href="/achievements" className="text-sm font-extrabold text-brand">Все →</Link>} />
            {unlocked.length === 0 ? (
              <p className="text-sm text-slate-500">Пройди первый урок, чтобы открыть «Первый шаг»!</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {unlocked.slice(0, 12).map((a) => (
                  <span key={a.id} title={a.title} className={`grid aspect-square place-items-center rounded-2xl bg-linear-to-br text-2xl ${RARITY[a.rarity].bg}`}>
                    <Em t={a.medal || a.icon} />
                  </span>
                ))}
              </div>
            )}
          </section>

          {certificates.length > 0 && (
            <section className="card p-5">
              <SectionTitle title="Сертификаты" action={<Award size={18} className="text-amber-500" />} />
              <div className="space-y-2">
                {certificates.map(([sid, e]) => (
                  <Link key={sid} href={`/certificate/${sid}`} className="flex items-center gap-3 rounded-2xl bg-amber-50 p-3 font-bold hover:bg-amber-100">
                    <FileText size={18} className="text-amber-600" />
                    <span className="flex-1">{getSubject(sid).title}</span>
                    <span className="text-sm text-amber-700">{e.bestPercent}%</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <Modal open={picker} onClose={() => setPicker(false)} title="Выбери аватар">
        <div className="grid grid-cols-4 gap-3">
          {avatars.map((a) => {
            const owned = ownsItem(state, a.id);
            return (
              <button key={a.id} onClick={() => pickAvatar(a.id)} className={`relative flex flex-col items-center gap-1 rounded-2xl p-2 ${p.equipped.avatar === a.id ? "bg-brand-soft ring-2 ring-brand" : "hover:bg-slate-50"} ${owned ? "" : "opacity-50"}`}>
                <Avatar avatar={a.id} size={56} />
                <span className="text-[11px] font-bold">{a.name}</span>
                {!owned && <Lock size={14} className="absolute right-1 top-1 text-slate-400" />}
              </button>
            );
          })}
        </div>
        <Button href="/shop" variant="soft" className="mt-4 w-full">
          Больше аватаров в магазине
        </Button>
      </Modal>
    </div>
  );
}
