"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Gamepad2, Trophy, Compass, Sparkles, BrainCircuit, Flame, ArrowRight, ShieldCheck } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import Lumi from "@/components/teacher/Lumi";
import LumosIcon from "@/components/ui/LumosIcon";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { SUBJECTS } from "@/lib/content/subjects";
import { Emoji } from "@/components/ui/Emoji";

const FEATURES = [
  { icon: BrainCircuit, color: "from-blue-500 to-violet-500", title: "AI-учитель Луми", text: "Объясняет темы простым языком, показывает примеры и анимации, повторяет другими словами, если что-то непонятно." },
  { icon: Gamepad2, color: "from-cyan-500 to-blue-500", title: "Мини-игры после урока", text: "7 вопросов разных форматов: пары, порядок шагов, формулы, пропуски, задания с картинками." },
  { icon: Sparkles, color: "from-violet-500 to-fuchsia-500", title: "Кристаллы Lumos", text: "Зарабатывай валюту за учёбу и трать в магазине на аватары, костюмы для Луми и темы." },
  { icon: Trophy, color: "from-amber-400 to-orange-500", title: "Рейтинг и достижения", text: "Честный рейтинг по XP: купить место нельзя, только заслужить знаниями." },
  { icon: Flame, color: "from-orange-500 to-rose-500", title: "Серии без стресса", text: "Ежедневные задания и награды за серии 3, 7, 14 и 30 дней — без наказаний за пропуски." },
  { icon: Compass, color: "from-emerald-500 to-teal-500", title: "Кем стать?", text: "Тест интересов подскажет направления — IT, медицина, инженерия, право и другие." },
];

export default function Home() {
  const { user, ready, mode, register } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const guest = async () => {
    setBusy(true);
    try {
      const id = crypto.randomUUID().slice(0, 6);
      await register({ name: "Гость", username: `guest_${id}`, email: `guest-${id}@demo.local`, password: crypto.randomUUID(), grade: 7 });
      router.push("/diary");
    } catch (e) {
      toast(e.message, "error");
      setBusy(false);
    }
  };

  return (
    <div className="overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          {ready && user ? (
            <Button href="/diary" size="sm">
              Мой кабинет
            </Button>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Войти
              </Button>
              <Button href="/register" size="sm">
                Начать
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-6 lg:grid-cols-2 lg:pt-12">
        <div className="pointer-events-none absolute -right-40 -top-20 h-96 w-96 rounded-full bg-brand-3/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-brand-2/15 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-extrabold text-brand shadow-sm">
            <Emoji e="🇺🇿" /> Школьная программа Узбекистана · 1–11 классы
          </span>
          <h1 className="font-display mt-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Учись <span className="text-brand-gradient">играя</span>.<br />
            Открой, кем ты станешь.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            EduQuest превращает школьные предметы в приключение: AI-учитель объясняет темы, мини-игры закрепляют знания, а награды, уровни и рейтинг мотивируют возвращаться каждый день.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {ready && user ? (
              <Button href="/diary" variant="gradient" size="lg">
                Продолжить обучение <ArrowRight size={20} />
              </Button>
            ) : (
              <>
                <Button href="/register" variant="gradient" size="lg">
                  Начать бесплатно <ArrowRight size={20} />
                </Button>
                {mode === "demo" && (
                  <Button onClick={guest} loading={busy} variant="secondary" size="lg">
                    Попробовать как гость
                  </Button>
                )}
              </>
            )}
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck size={16} /> Без рекламы и реальных платежей. Lumos зарабатываются только учёбой.
          </p>
        </div>

        <div className="relative mx-auto h-[420px] w-full max-w-md">
          <div className="absolute inset-8 rounded-[3rem] bg-brand-gradient opacity-90 shadow-2xl" />
          <div className="absolute inset-8 rounded-[3rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.35),transparent_55%)]" />
          <div className="absolute inset-0 grid place-items-center">
            <Lumi emotion="happy" size={230} />
          </div>
          <div className="card animate-float absolute left-0 top-10 flex items-center gap-2 px-4 py-3" style={{ animationDelay: "0.3s" }}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-400 text-white"><Emoji e="⚡" /></span>
            <div>
              <p className="text-xs font-bold text-slate-500">Урок пройден</p>
              <p className="font-extrabold">+30 XP</p>
            </div>
          </div>
          <div className="card animate-float absolute right-0 top-28 flex items-center gap-2 px-4 py-3" style={{ animationDelay: "0.9s" }}>
            <LumosIcon size={32} glow />
            <div>
              <p className="text-xs font-bold text-slate-500">Награда</p>
              <p className="font-extrabold">+20 Lumos</p>
            </div>
          </div>
          <div className="card animate-float absolute bottom-6 left-6 flex items-center gap-2 px-4 py-3" style={{ animationDelay: "1.5s" }}>
            <span className="text-3xl"><Emoji e="🏆" /></span>
            <div>
              <p className="text-xs font-bold text-slate-500">Достижение</p>
              <p className="font-extrabold">«Химический гений»</p>
            </div>
          </div>
        </div>
      </section>

      {/* Проблема */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-7">
            <p className="text-3xl"><Emoji e="😴" /></p>
            <h3 className="font-display mt-2 text-xl font-bold">Учиться скучно?</h3>
            <p className="mt-2 text-slate-600">Однообразные уроки и сложные объяснения отбивают интерес. В EduQuest каждая тема — это интерактивный класс с анимациями и игрой в конце.</p>
          </div>
          <div className="card p-7">
            <p className="text-3xl"><Emoji e="🤔" /></p>
            <h3 className="font-display mt-2 text-xl font-bold">Не знаешь, что тебе нравится?</h3>
            <p className="mt-2 text-slate-600">Пробуй разные предметы, смотри, где получается лучше, и проходи тест «Кем стать?» — платформа подскажет направления для размышлений.</p>
          </div>
        </div>
      </section>

      {/* Возможности */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="font-display text-center text-3xl font-extrabold">Всё, чтобы учёба стала игрой</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 transition hover:-translate-y-1">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br ${f.color} text-white shadow-lg`}>
                <f.icon size={24} />
              </span>
              <h3 className="font-display mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Предметы */}
      <section className="pb-16">
        <h2 className="font-display px-4 text-center text-3xl font-extrabold">Предметы школьной программы</h2>
        <div className="mx-auto mt-8 flex max-w-6xl flex-wrap justify-center gap-2.5 px-4">
          {SUBJECTS.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 font-bold shadow-sm ring-1 ring-slate-200/70">
              <span className="grid h-7 w-7 place-items-center rounded-lg text-white" style={{ background: `linear-gradient(135deg, ${s.gradient[0]}, ${s.gradient[1]})` }}>
                <Icon name={s.icon} size={15} />
              </span>
              {s.title}
            </span>
          ))}
        </div>
      </section>

      {/* Как это работает */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="card overflow-hidden bg-brand-gradient p-8 text-white sm:p-10">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Как это работает</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["1", "Выбери предмет", "Каталог подстраивается под твой класс."],
              ["2", "Послушай Луми", "Интерактивное объяснение с примерами и анимациями."],
              ["3", "Пройди мини-игру", "7 вопросов: можно ошибиться не больше 3 раз."],
              ["4", "Получи награды", "XP, Lumos, достижения и место в рейтинге."],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-2xl bg-white/15 p-5 backdrop-blur">
                <span className="font-display text-3xl font-extrabold">{n}</span>
                <p className="mt-1 text-lg font-extrabold">{t}</p>
                <p className="text-white/80">{d}</p>
              </div>
            ))}
          </div>
          <Button href={user ? "/diary" : "/register"} variant="secondary" size="lg" className="mt-8">
            {user ? "В личный кабинет" : "Создать аккаунт"}
          </Button>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-sm text-slate-500">
          <Logo />
          <p>Lumos — внутриигровая валюта без реальной денежной стоимости. © {new Date().getFullYear()} EduQuest</p>
          <div className="flex gap-4 font-bold">
            <Link href="/login">Вход</Link>
            <Link href="/register">Регистрация</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
