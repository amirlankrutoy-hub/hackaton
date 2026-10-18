import { LogoMark } from "@/components/ui/Logo";
import { formatDate } from "@/lib/time";
import { Em } from "@/components/ui/Emoji";

/** Сертификат о завершении курса (внутри платформы, без юридической силы). */
export default function Certificate({ name, subject, percent, date }) {
  return (
    <div className="relative mx-auto aspect-[1.414/1] w-full max-w-3xl overflow-hidden rounded-3xl bg-white p-[3%] shadow-2xl print:shadow-none">
      <div className="absolute inset-[2.5%] rounded-2xl border-4 border-double" style={{ borderColor: subject.gradient[0] }} />
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-15" style={{ background: subject.gradient[1] }} />
      <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full opacity-10" style={{ background: subject.gradient[0] }} />
      <div className="relative flex h-full flex-col items-center justify-between py-[4%] text-center">
        <div className="flex items-center gap-2">
          <LogoMark size={36} />
          <span className="font-display text-lg font-extrabold">EduQuest</span>
        </div>
        <div>
          <p className="font-display text-[clamp(1.1rem,3.5vw,2.2rem)] font-extrabold uppercase tracking-[0.2em] text-slate-800">Сертификат</p>
          <p className="text-[clamp(0.7rem,1.6vw,1rem)] font-bold text-slate-500">о завершении курса на платформе</p>
        </div>
        <div>
          <p className="text-[clamp(0.7rem,1.6vw,1rem)] text-slate-500">Настоящим подтверждается, что</p>
          <p className="font-display text-[clamp(1.3rem,4.5vw,2.8rem)] font-extrabold" style={{ color: subject.gradient[0] }}>
            {name}
          </p>
          <p className="text-[clamp(0.7rem,1.6vw,1rem)] text-slate-600">
            успешно прошёл(-ла) курс <b>«{subject.title}»</b> и сдал(-а) итоговую контрольную с результатом <b>{percent}%</b>
          </p>
        </div>
        <div className="flex w-full items-end justify-between px-[6%] text-[clamp(0.6rem,1.4vw,0.85rem)] text-slate-500">
          <div className="text-left">
            <p className="font-bold text-slate-700">{formatDate(date)}</p>
            <p>дата выдачи</p>
          </div>
          <div className="grid h-[clamp(3rem,10vw,5.5rem)] w-[clamp(3rem,10vw,5.5rem)] place-items-center rounded-full text-[clamp(1.4rem,5vw,2.8rem)] shadow-lg ring-4 ring-amber-300" style={{ background: "radial-gradient(circle at 30% 30%, #fef3c7, #f59e0b)" }}>
            <Em t={subject.emoji} />
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-700">Луми</p>
            <p>AI-учитель EduQuest</p>
          </div>
        </div>
      </div>
    </div>
  );
}
