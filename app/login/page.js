"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthCard, { Field } from "@/components/layout/AuthCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";

function nextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/diary";
}

export default function LoginPage() {
  const { login, user, ready, mode } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace(nextPath());
  }, [ready, user, router]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form);
      router.replace(nextPath());
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthCard title="С возвращением!" subtitle="Войди, чтобы продолжить обучение.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Field label="Пароль" type="password" autoComplete="current-password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600">{error}</p>}
        <Button type="submit" variant="gradient" size="lg" loading={busy} className="w-full">
          Войти
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-extrabold text-brand">
          Зарегистрироваться
        </Link>
      </p>
      {mode === "demo" && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Демо-режим: аккаунты хранятся только в этом браузере (пароль — в виде хэша PBKDF2).</p>}
    </AuthCard>
  );
}
