import { LogoMark } from "./Logo";
import { Em } from "@/components/ui/Emoji";

export function FullPageLoader({ label = "Загружаем…" }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <LogoMark size={56} className="animate-float" />
        <span className="font-bold">{label}</span>
      </div>
    </div>
  );
}

export function SectionTitle({ title, subtitle, action, className = "" }) {
  return (
    <div className={`mb-4 flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        <h2 className="font-display text-lg font-bold sm:text-xl">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, emoji, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {emoji && <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-sm"><Em t={emoji} /></span>}
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl"><Em t={title} /></h1>
          {subtitle && <p className="text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ emoji = "✨", title, text, children }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-8 text-center">
      <span className="text-4xl"><Em t={emoji} /></span>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {text && <p className="max-w-md text-slate-500">{text}</p>}
      {children}
    </div>
  );
}
