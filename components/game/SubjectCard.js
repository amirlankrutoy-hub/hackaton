"use client";
import Link from "next/link";
import { useGame } from "@/components/providers/GameProvider";
import Icon from "@/components/ui/Icon";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import { getCourse } from "@/lib/content";
import { subjectProgress, knowledgeLevel } from "@/lib/stats";
import { plural } from "@/lib/time";
import { Em } from "@/components/ui/Emoji";

export function SubjectCover({ subject, className = "", size = 30, mini = false }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${subject.gradient[0]}, ${subject.gradient[1]})` }}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15" />
      {!mini && (
        <>
          <div className="absolute -bottom-8 left-8 h-20 w-20 rounded-full bg-white/10" />
          <span className="absolute bottom-1 right-3 text-4xl opacity-90 drop-shadow"><Em t={subject.emoji} /></span>
        </>
      )}
      <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-white backdrop-blur">
        <Icon name={subject.icon} size={size * 0.85} />
      </span>
    </div>
  );
}

export default function SubjectCard({ subject }) {
  const { state } = useGame();
  const course = getCourse(subject.id);
  const progress = subjectProgress(state, subject.id);
  const level = knowledgeLevel(state, subject.id);
  const count = course ? course.lessons.length : subject.planned?.length || 0;
  const cta = !course ? "Смотреть программу" : progress.percent === 100 ? "Повторить" : progress.started ? "Продолжить" : "Начать";

  return (
    <Link href={`/subjects/${subject.id}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
      <SubjectCover subject={subject} className="h-28 p-4" />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-tight">{subject.title}</h3>
          <Badge tone={level.tone}>{level.label}</Badge>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{subject.short}</p>
        <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>
            {count} {plural(count, ["урок", "урока", "уроков"])}
            {!course && " · в разработке"}
          </span>
          {course && <span>{progress.percent}%</span>}
        </div>
        {course && <ProgressBar value={progress.percent / 100} height="h-2" className="mt-1.5" label={`Прогресс: ${subject.title}`} />}
        <span className={`mt-4 inline-flex h-10 items-center justify-center rounded-xl text-sm font-extrabold transition ${course ? "bg-brand-soft text-brand group-hover:bg-brand group-hover:text-white" : "bg-slate-100 text-slate-500"}`}>{cta}</span>
      </div>
    </Link>
  );
}
