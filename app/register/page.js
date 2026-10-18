"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthCard, { Field } from "@/components/layout/AuthCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { GRADES } from "@/lib/content/subjects";

export default function RegisterPage() {
  const { register, user, ready, mode } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", grade: 7 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/diary");
  }, [ready, user, router]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Укажи имя (минимум 2 символа)");
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) return setError("Никнейм: 3–20 латинских букв, цифр или «_»");
    if (form.password.length < 6) return setError("Пароль — минимум 6 символов");
    setBusy(true);
    try {
      const res = await register({ ...form, name: form.name.trim(), grade: Number(form.grade) });
      if (res.needsConfirmation) {
        setConfirm(true);
        setBusy(false);
      } else router.replace("/diary");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (confirm) {
    return (
      <AuthCard title="Проверь почту 📬" subtitle={`Мы отправили письмо на ${form.email}. Подтверди адрес и войди в аккаунт.`}>
        <Button href="/login" variant="gradient" size="lg" className="w-full">
          Перейти ко входу
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Создай аккаунт" subtitle="Это бесплатно. Начни путь к знаниям!" emotion="wow">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Имя" autoComplete="given-name" required value={form.name} onChange={set("name")} placeholder="Например, Азиза" />
        <Field label="Никнейм" required value={form.username} onChange={set("username")} placeholder="aziza_2012" hint="Виден в рейтинге, если скрыть настоящее имя" />
        <Field label="Email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} />
        <Field label="Пароль" type="password" autoComplete="new-password" required minLength={6} value={form.password} onChange={set("password")} hint="Минимум 6 символов" />
        <label className="block">
          <span className="mb-1.5 block text-sm font-extrabold text-slate-700">Класс</span>
          <select value={form.grade} onChange={set("grade")} className="h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 font-semibold outline-none focus:border-brand">
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g} класс
              </option>
            ))}
          </select>
        </label>
        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600">{error}</p>}
        <Button type="submit" variant="gradient" size="lg" loading={busy} className="w-full">
          Зарегистрироваться
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-extrabold text-brand">
          Войти
        </Link>
      </p>
      {mode === "demo" && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Демо-режим: данные сохраняются только в этом браузере. Пароль не хранится в открытом виде.</p>}
    </AuthCard>
  );
}
