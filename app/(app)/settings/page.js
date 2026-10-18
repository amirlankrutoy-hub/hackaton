"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, LogOut, Trash2, Check } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { PageHeader, SectionTitle } from "@/components/ui/Misc";
import { GRADES } from "@/lib/content";
import { LANGUAGES, ownsItem } from "@/lib/engine";
import { SHOP_ITEMS } from "@/lib/shop";
import { Emoji } from "@/components/ui/Emoji";

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl bg-slate-50 p-4">
      <span>
        <span className="block font-extrabold">{label}</span>
        {hint && <span className="text-sm text-slate-500">{hint}</span>}
      </span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-brand" : "bg-slate-300"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`} />
      </button>
    </label>
  );
}

export default function SettingsPage() {
  const { state, dispatch, resetDemo } = useGame();
  const { mode, logout, user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const p = state.profile;
  const [form, setForm] = useState({ name: p.name, username: p.username, grade: p.grade, language: p.language });
  const [saving, setSaving] = useState(false);
  const [reset, setReset] = useState(false);
  const themes = SHOP_ITEMS.filter((i) => i.category === "theme");

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch("updateProfile", { ...form, grade: Number(form.grade) });
      toast("Настройки сохранены", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };
  const setPrivacy = async (key, value) => {
    try {
      await dispatch("updateProfile", { privacy: { [key]: value } });
      toast("Настройки приватности обновлены", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };
  const setTheme = async (id) => {
    if (!ownsItem(state, id)) return toast("Эту тему можно купить в магазине", "info");
    try {
      await dispatch("equipItem", { slot: "theme", itemId: id });
    } catch (err) {
      toast(err.message, "error");
    }
  };
  const doLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Настройки" emoji="⚙️" />

      <form onSubmit={save} className="card space-y-4 p-6">
        <SectionTitle title="Профиль" />
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-extrabold">Имя</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={40} className="h-11 w-full rounded-xl border-2 border-slate-200 px-3 font-semibold outline-none focus:border-brand" />
          </label>
          <label>
            <span className="mb-1 block text-sm font-extrabold">Никнейм</span>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} maxLength={20} className="h-11 w-full rounded-xl border-2 border-slate-200 px-3 font-semibold outline-none focus:border-brand" />
          </label>
          <label>
            <span className="mb-1 block text-sm font-extrabold">Класс</span>
            <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold outline-none focus:border-brand">
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g} класс
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-extrabold">Язык интерфейса</span>
            <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold outline-none focus:border-brand">
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id} disabled={!l.available}>
                  {l.title}
                  {l.available ? "" : " — скоро"}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-slate-500">Класс определяет, какие предметы показываются в каталоге и какую сложность объяснений выбирает AI-учитель.</p>
        <Button type="submit" loading={saving}>
          <Save size={18} /> Сохранить
        </Button>
      </form>

      <section className="card space-y-3 p-6">
        <SectionTitle title="Приватность" subtitle="Управляй тем, что видят другие ученики" />
        <Toggle checked={p.privacy.isPublic} onChange={(v) => setPrivacy("isPublic", v)} label="Публичный профиль" hint="Другие ученики могут видеть твой уровень и достижения." />
        <Toggle checked={p.privacy.showInLeaderboard} onChange={(v) => setPrivacy("showInLeaderboard", v)} label="Показывать меня в рейтинге" hint="Если выключить, ты не появишься в общей таблице (своё место будешь видеть только ты)." />
        <Toggle checked={p.privacy.hideRealName} onChange={(v) => setPrivacy("hideRealName", v)} label="Скрыть настоящее имя" hint="В рейтинге будет виден только никнейм." />
        <p className="text-xs text-slate-500">Email и класс никогда не показываются другим пользователям.</p>
      </section>

      <section className="card p-6">
        <SectionTitle title="Тема оформления" subtitle="Новые темы — в магазине Lumos" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {themes.map((t) => {
            const owned = ownsItem(state, t.id);
            const active = p.equipped.theme === t.id;
            return (
              <button key={t.id} onClick={() => setTheme(t.id)} className={`rounded-2xl p-2 text-center text-xs font-bold ${active ? "ring-2 ring-brand" : "ring-1 ring-slate-200"} ${owned ? "" : "opacity-50"}`}>
                <span className="mb-1 flex h-10 overflow-hidden rounded-xl">
                  {t.swatch.map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </span>
                {t.name} {active && <Check size={12} className="inline" />}
                {!owned && <> <Emoji e="🔒" /></>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card flex flex-wrap gap-3 p-6">
        <Button onClick={doLogout} variant="secondary">
          <LogOut size={18} /> Выйти из аккаунта
        </Button>
        {mode === "demo" && (
          <Button onClick={() => setReset(true)} variant="ghost" className="text-rose-600 hover:bg-rose-50">
            <Trash2 size={18} /> Сбросить демо-прогресс
          </Button>
        )}
        <p className="w-full text-xs text-slate-400">Вы вошли как {user?.email}</p>
      </section>

      <Modal open={reset} onClose={() => setReset(false)} title="Сбросить прогресс?">
        <p className="text-slate-600">Будут удалены XP, Lumos, пройденные уроки, достижения и покупки этого демо-аккаунта на этом устройстве. Действие нельзя отменить.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => setReset(false)}>
            Отмена
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetDemo();
              setReset(false);
              toast("Прогресс сброшен", "info");
            }}
          >
            Сбросить
          </Button>
        </div>
      </Modal>
    </div>
  );
}
