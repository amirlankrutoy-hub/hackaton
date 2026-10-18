"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Play, Lock, Check, Clock, RotateCcw, Trophy, CalendarDays, NotebookPen, RefreshCw } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { Emoji } from "@/components/ui/Emoji";
import DailyQuests from "@/components/game/DailyQuests";
import StreakCard from "@/components/game/StreakCard";
import { SectionTitle } from "@/components/ui/Misc";
import { getSubject, getLesson } from "@/lib/content";
import { weekSchedule, weekGrades, slotTitle, slotHref, WEEKDAYS, WEEKDAYS_SHORT } from "@/lib/schedule";
import { addDays, formatShort, formatDate } from "@/lib/time";

const GRADE_STYLE = { 5: "bg-emerald-500 text-white", 4: "bg-sky-500 text-white", 3: "bg-amber-400 text-amber-950" };

function GradeBadge({ grade, size = "h-10 w-10 text-lg" }) {
  return <span className={`grid shrink-0 place-items-center rounded-xl font-display font-extrabold ${size} ${GRADE_STYLE[grade]}`}>{grade}</span>;
}

function SlotRow({ slot, beforeStart, onLocked }) {
  const subject = getSubject(slot.subjectId);
  const lesson = slot.lessonId && getLesson(slot.lessonId);
  const href = slotHref(slot);
  const clickable = slot.status === "todo" || slot.status === "done" || slot.status === "missed";
  const statusEl = {
    done: slot.grade ? <GradeBadge grade={slot.grade} /> : (
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-white">
        <Check size={20} strokeWidth={3} />
      </span>
    ),
    todo: (
      <span className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand px-3 text-sm font-extrabold text-white shadow-sm" title="Войти в урок">
        <Play size={15} fill="currentColor" /> <span className="hidden sm:inline">Войти в урок</span>
      </span>
    ),
    locked: (
      <span className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-xs font-extrabold text-slate-500">
        <Lock size={14} /> <span className="hidden sm:inline">После урока</span> №{slot.n - 1}
      </span>
    ),
    missed: (
      <span className="inline-flex h-10 items-center rounded-xl bg-slate-100 px-3 text-xs font-extrabold text-slate-500">
        <span className="sm:hidden">Пройти</span>
        <span className="hidden sm:inline">{beforeStart ? "Можно пройти сейчас" : "Не пройден — можно сейчас"}</span>
      </span>
    ),
    planned: <span className="inline-flex h-10 items-center rounded-xl bg-slate-50 px-2.5 text-xs font-extrabold text-slate-400">План</span>,
  }[slot.status];

  const body = (
    <>
      <div className="flex w-10 shrink-0 flex-col items-center text-center sm:w-20">
        <span className="font-display text-lg font-extrabold text-slate-300">{slot.n}</span>
        <span className="text-[11px] font-bold leading-tight text-slate-400">
          {slot.time[0]}
          <span className="hidden sm:inline">–{slot.time[1]}</span>
        </span>
      </div>
      <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl text-white shadow-sm sm:grid" style={{ background: `linear-gradient(135deg, ${subject.gradient[0]}, ${subject.gradient[1]})` }}>
        <Icon name={subject.icon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: subject.gradient[0] }}>
          {subject.title}
          {slot.kind === "review" && " · повторение"}
          {slot.kind === "exam" && " · контрольная"}
        </p>
        <p className="font-extrabold leading-snug">
          {lesson && <Emoji e={lesson.emoji} className="mr-1" />}
          {slot.kind === "exam" ? "Итоговая контрольная работа" : lesson.title}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
          {lesson && (
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> {lesson.minutes} мин<span className="hidden sm:inline"> + мини-игра</span>
            </span>
          )}
          {slot.attempts > 0 && slot.status !== "done" && <span className="font-bold text-amber-600">Попыток сегодня: {slot.attempts}</span>}
          {slot.kind === "exam" && slot.percent !== null && slot.percent !== undefined && <span className="font-bold">Лучший результат сегодня: {slot.percent}%</span>}
        </p>
      </div>
      <div className="shrink-0">{statusEl}</div>
    </>
  );

  const cls = `flex items-center gap-2.5 rounded-2xl p-3 transition sm:gap-4 ${slot.status === "done" ? "bg-emerald-50/70" : "bg-white"} ${clickable ? "hover:bg-brand-soft" : ""}`;
  if (clickable) {
    return (
      <Link href={href} className={cls} aria-label={`${slot.n} урок: ${slotTitle(slot)}`}>
        {body}
      </Link>
    );
  }
  return (
    <button onClick={() => onLocked(slot)} className={`${cls} w-full text-left`}>
      {body}
    </button>
  );
}

export default function DiaryPage() {
  const { state, today } = useGame();
  const toast = useToast();
  const [selected, setSelected] = useState(today);
  const week = weekSchedule(state, selected, today);
  const day = week.find((d) => d.day === selected);
  const grades = weekGrades(week);
  const todaySched = week.find((d) => d.day === today);
  const nextSlot = todaySched?.slots.find((s) => s.status === "todo");
  const doneToday = todaySched ? todaySched.slots.filter((s) => s.status === "done").length : 0;

  const onLocked = (slot) => {
    if (slot.status === "planned") toast(`Этот урок по расписанию на ${formatShort(selected)}. Можно начать и раньше — в разделе «Уроки».`, "info");
    else toast(`Сначала пройди урок «${getLesson(slot.lockedBy).title}» — затем откроется этот.`, "info");
  };

  return (
    <div className="space-y-6">
      {/* Шапка дневника */}
      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-brand-gradient p-5 text-white sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
              <NotebookPen size={24} />
            </span>
            <div>
              <h1 className="font-display text-2xl font-extrabold">Дневник</h1>
              <p className="text-sm text-white/85">
                {state.profile.name} · {state.profile.grade} класс · {formatDate(`${today}T12:00:00+05:00`)}
              </p>
            </div>
          </div>
          {todaySched && !todaySched.dayOff && (
            <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
              <div className="text-right">
                <p className="text-xs font-extrabold uppercase tracking-wide text-white/70">Сегодня</p>
                <p className="font-display text-xl font-extrabold">
                  {doneToday} из {todaySched.slots.length} уроков
                </p>
              </div>
              {nextSlot && (
                <Button href={slotHref(nextSlot)} variant="warning" size="lg">
                  <Play size={18} fill="currentColor" /> Начать урок №{nextSlot.n}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Неделя */}
        <div className="flex items-center gap-1 border-b border-slate-100 p-2 sm:gap-2 sm:p-3">
          <button onClick={() => setSelected(addDays(selected, -7))} className="grid h-10 w-7 sm:w-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Предыдущая неделя">
            <ChevronLeft />
          </button>
          <div className="grid flex-1 grid-cols-7 gap-0.5 sm:gap-1">
            {week.map((d) => {
              const done = d.slots.filter((s) => s.status === "done").length;
              const active = d.day === selected;
              return (
                <button key={d.day} onClick={() => setSelected(d.day)} className={`flex flex-col items-center rounded-2xl py-2 transition ${active ? "bg-brand text-white shadow-lg" : d.day === today ? "bg-brand-soft text-brand" : "hover:bg-slate-50"}`}>
                  <span className="text-[11px] font-extrabold uppercase">{WEEKDAYS_SHORT[d.weekday]}</span>
                  <span className="font-display text-base font-extrabold sm:text-lg">{Number(d.day.slice(8))}</span>
                  <span className="mt-0.5 hidden h-1.5 gap-0.5 sm:flex">
                    {d.dayOff ? null : d.slots.map((s) => <span key={s.n} className={`h-1.5 w-1.5 rounded-full ${s.status === "done" ? (active ? "bg-white" : "bg-emerald-500") : active ? "bg-white/40" : "bg-slate-200"}`} />)}
                  </span>
                  <span className={`mt-0.5 text-[10px] font-extrabold sm:hidden ${done ? "" : "invisible"}`}>{done}✓</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => setSelected(addDays(selected, 7))} className="grid h-10 w-7 sm:w-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Следующая неделя">
            <ChevronRight />
          </button>
        </div>
        {selected !== today && (
          <div className="flex justify-center border-b border-slate-100 py-2">
            <button onClick={() => setSelected(today)} className="inline-flex items-center gap-1 text-sm font-extrabold text-brand hover:underline">
              <CalendarDays size={15} /> Вернуться к сегодняшнему дню
            </button>
          </div>
        )}

        {/* Уроки дня */}
        <div className="p-3 sm:p-4">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 px-1">
            <h2 className="font-display text-lg font-bold">
              {WEEKDAYS[day.weekday]}, {formatShort(selected)}
              {selected === today && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-extrabold text-brand">сегодня</span>}
            </h2>
            {selected > today && !day.dayOff && <span className="text-xs font-bold text-slate-400">План может измениться — расписание учитывает твой прогресс</span>}
          </div>
          {day.beforeStart && !day.dayOff && (
            <p className="mb-2 rounded-2xl bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-800">
              В этот день ты ещё не учился в EduQuest, но в любой урок из расписания можно зайти и сейчас.
            </p>
          )}
          {day.dayOff ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-8 text-center">
              <Emoji e="🌳" size="3rem" />
              <p className="font-display text-lg font-bold">Воскресенье — выходной!</p>
              <p className="max-w-sm text-sm text-slate-500">Отдохни. Если хочется — повтори пройденное в мини-играх, серия обучения от этого тоже засчитается.</p>
              <Button href="/games" variant="soft" className="mt-2">
                <RotateCcw size={16} /> Повторить в мини-играх
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl ring-1 ring-slate-100">
              {day.slots.map((s) => (
                <SlotRow key={s.n} slot={s} beforeStart={day.beforeStart} onLocked={onLocked} />
              ))}
            </div>
          )}
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-bold text-slate-400">
            <RefreshCw size={12} /> Расписание обновляется каждый день в 00:00 по ташкентскому времени
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <SectionTitle title="Оценки за неделю" subtitle="5 — 6–7 верных ответов, 4 — 5 верных, 3 — 4 верных. Непройденные попытки оценкой не считаются." />
          {Object.keys(grades).length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">На этой неделе оценок пока нет. Пройди урок из расписания — и здесь появится первая оценка!</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {Object.entries(grades).map(([sid, list]) => {
                const s = getSubject(sid);
                const avg = list.reduce((a, b) => a + b, 0) / list.length;
                return (
                  <div key={sid} className="flex items-center gap-3 py-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${s.gradient[0]}, ${s.gradient[1]})` }}>
                      <Icon name={s.icon} size={16} />
                    </span>
                    <span className="flex-1 truncate font-bold">{s.title}</span>
                    <div className="flex gap-1">
                      {list.map((g, i) => (
                        <GradeBadge key={i} grade={g} size="h-8 w-8 text-sm" />
                      ))}
                    </div>
                    <span className="w-12 text-right font-display font-bold text-slate-500">{avg.toFixed(1).replace(".", ",")}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button href="/lessons" variant="secondary" size="sm">
              Все предметы
            </Button>
            <Button href="/games" variant="ghost" size="sm">
              <Trophy size={15} /> Мини-игры и контрольные
            </Button>
          </div>
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <SectionTitle title="Домашнее задание" subtitle="На сегодня" />
            <DailyQuests />
          </section>
          <section className="card p-5">
            <SectionTitle title="Серия обучения" />
            <StreakCard compact />
          </section>
        </div>
      </div>
    </div>
  );
}
