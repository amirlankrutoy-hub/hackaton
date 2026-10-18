"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  NotebookPen, House, GraduationCap, BookMarked, Gamepad2, Trophy, Award, ShoppingBag, Compass, User, Settings, Bell, Menu, X, LogOut, Flame,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import Avatar from "@/components/ui/Avatar";
import { LumosAmount } from "@/components/ui/LumosIcon";
import XpAmount from "@/components/ui/XpBadge";
import { useAuth } from "@/components/providers/AuthProvider";
import { useGame } from "@/components/providers/GameProvider";
import { t } from "@/lib/i18n";
import { Emoji } from "@/components/ui/Emoji";

export const NAV = [
  { href: "/diary", label: t("nav.diary"), short: "Дневник", icon: NotebookPen },
  { href: "/dashboard", label: t("nav.dashboard"), short: "Главная", icon: House },
  { href: "/lessons", label: t("nav.lessons"), short: "Уроки", icon: GraduationCap },
  { href: "/lessons?view=mine", label: t("nav.mySubjects"), icon: BookMarked, match: "mine" },
  { href: "/games", label: t("nav.games"), short: "Игры", icon: Gamepad2 },
  { href: "/leaderboard", label: t("nav.leaderboard"), short: "Рейтинг", icon: Trophy },
  { href: "/achievements", label: t("nav.achievements"), icon: Award },
  { href: "/shop", label: t("nav.shop"), icon: ShoppingBag },
  { href: "/career", label: t("nav.career"), icon: Compass },
  { href: "/profile", label: t("nav.profile"), short: "Профиль", icon: User },
  { href: "/settings", label: t("nav.settings"), icon: Settings },
];

function isActive(pathname, item, view) {
  const base = item.href.split("?")[0];
  if (item.match === "mine") return pathname === "/lessons" && view === "mine";
  if (base === "/lessons") return (pathname === "/lessons" && view !== "mine") || pathname.startsWith("/subjects") || pathname.startsWith("/lesson") || pathname.startsWith("/exam");
  return pathname === base || pathname.startsWith(base + "/");
}

function NavListWithParams(props) {
  const view = useSearchParams().get("view");
  return <NavListInner view={view} {...props} />;
}

function NavList(props) {
  return (
    <Suspense fallback={<NavListInner view={null} {...props} />}>
      <NavListWithParams {...props} />
    </Suspense>
  );
}

function NavListInner({ onNavigate, view }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item, view);
        const I = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onNavigate?.()}
            className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 font-extrabold transition ${active ? "bg-brand-soft text-brand ring-1 ring-brand/20" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <I size={21} strokeWidth={2.4} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Notifications() {
  const { state, dispatch } = useGame();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unread = state.notifications.filter((n) => !n.read).length;
  useEffect(() => {
    if (!open) return;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const toggle = () => {
    setOpen(!open);
    if (!open && unread) dispatch("readNotifications").catch(() => {});
  };
  const icon = { achievement: "🏅", level: "⬆️", reward: "🎁", streak: "🔥" };
  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="relative grid h-10 w-10 place-items-center rounded-2xl text-slate-600 hover:bg-slate-100" aria-label={`Уведомления${unread ? `: ${unread} новых` : ""}`}>
        <Bell size={21} />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-extrabold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="card animate-rise absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] p-2">
          <p className="px-3 py-2 font-display font-bold">Уведомления</p>
          {state.notifications.length === 0 && <p className="px-3 pb-3 text-sm text-slate-500">Пока пусто. Пройди урок — и здесь появятся новости!</p>}
          <div className="max-h-80 overflow-y-auto">
            {state.notifications.map((n) => (
              <div key={n.id} className={`flex gap-3 rounded-xl px-3 py-2 ${n.read ? "" : "bg-brand-soft"}`}>
                <span className="text-xl"><Emoji e={icon[n.kind] || "✨"} /></span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold">{n.title}</p>
                  {n.text && <p className="text-xs text-slate-500">{n.text}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppShell({ children }) {
  const { state, level, stats } = useGame();
  const { logout } = useAuth();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();

  const doLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <div className="min-h-screen">
      {/* Боковое меню (десктоп) */}
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 border-r border-slate-200/70 bg-white/80 px-4 py-6 backdrop-blur lg:flex">
        <div className="px-2">
          <Logo href="/diary" />
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <NavList />
        </div>
        <button onClick={doLogout} className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 font-extrabold text-slate-500 hover:bg-rose-50 hover:text-rose-600">
          <LogOut size={20} /> Выйти
        </button>
      </aside>

      {/* Мобильное меню */}
      {menu && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMenu(false)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="animate-rise absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-5 bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <Logo href="/diary" />
              <button onClick={() => setMenu(false)} className="rounded-xl p-2 hover:bg-slate-100" aria-label="Закрыть меню">
                <X />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavList onNavigate={() => setMenu(false)} />
            </div>
            <button onClick={doLogout} className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 font-extrabold text-slate-500 hover:bg-rose-50 hover:text-rose-600">
              <LogOut size={20} /> Выйти
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Верхняя панель */}
        <header className="no-print sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-3">
            <button onClick={() => setMenu(true)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Открыть меню">
              <Menu />
            </button>
            <div className="lg:hidden">
              <Logo href="/diary" compact />
            </div>
            <div className="flex-1" />
            <div className="hidden items-center gap-1.5 rounded-2xl bg-orange-50 px-3 py-1.5 font-extrabold text-orange-600 sm:flex" title="Серия дней обучения">
              <Flame size={18} fill="currentColor" /> {stats.streak.current}
            </div>
            <div className="rounded-2xl bg-amber-50 px-2.5 py-1.5 text-amber-700 sm:px-3" title="Опыт (XP)">
              <XpAmount value={state.xp} size={15} className="text-sm" />
            </div>
            <Link href="/shop" className="rounded-2xl bg-violet-50 px-2.5 py-1.5 text-violet-700 sm:px-3" title="Баланс Lumos">
              <LumosAmount value={state.lumos} size={17} className="text-sm" />
            </Link>
            <div className="hidden items-center rounded-2xl bg-brand-soft px-3 py-1.5 text-sm font-extrabold text-brand md:flex" title={level.title}>
              Ур. {level.level}
            </div>
            <Notifications />
            <Link href="/profile" className="rounded-full" aria-label="Профиль">
              <Avatar avatar={state.profile.equipped.avatar} frame={state.profile.equipped.frame} size={40} />
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 lg:pb-12">{children}</main>
      </div>

      {/* Нижняя навигация (мобильная) */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {[NAV[0], NAV[1], NAV[2], NAV[5], NAV[9]].map((item) => {
          const I = item.icon;
          const active = isActive(pathname, item, null);
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-extrabold ${active ? "text-brand" : "text-slate-500"}`}>
              <I size={22} strokeWidth={2.4} />
              {item.short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
