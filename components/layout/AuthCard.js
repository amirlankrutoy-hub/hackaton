"use client";
import Logo from "@/components/ui/Logo";
import Lumi from "@/components/teacher/Lumi";
import { DemoBanner } from "./AppShell";
import { Em } from "@/components/ui/Emoji";

export default function AuthCard({ title, subtitle, children, emotion = "happy" }) {
  return (
    <div className="min-h-screen">
      <DemoBanner />
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-5xl items-center gap-8 px-4 py-8 lg:grid-cols-2">
        <div className="hidden flex-col items-center gap-4 text-center lg:flex">
          <Lumi emotion={emotion} size={240} />
          <p className="font-display text-2xl font-extrabold">Привет! Я Луми, твой AI-учитель.</p>
          <p className="max-w-sm text-slate-500">Вместе мы пройдём школьную программу как настоящую игру.</p>
        </div>
        <div className="card mx-auto w-full max-w-md p-7 sm:p-9">
          <Logo />
          <h1 className="font-display mt-6 text-2xl font-extrabold"><Em t={title} /></h1>
          {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, hint, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-extrabold text-slate-700">{label}</span>
      <input {...props} className="h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 font-semibold outline-none transition focus:border-brand" />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
