"use client";
import { useState } from "react";
import { Check, ShoppingBag, Zap } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import Lumi from "@/components/teacher/Lumi";
import LumosIcon, { LumosAmount } from "@/components/ui/LumosIcon";
import { PageHeader } from "@/components/ui/Misc";
import { SHOP_ITEMS, SHOP_CATEGORIES } from "@/lib/shop";
import { ownsItem } from "@/lib/engine";
import { formatDate } from "@/lib/time";
import { Em, Emoji } from "@/components/ui/Emoji";

function Preview({ item, state }) {
  switch (item.category) {
    case "avatar":
      return <Avatar avatar={item.id} size={88} />;
    case "costume":
      return <Lumi emotion="happy" costume={item.id} size={96} />;
    case "frame":
      return <Avatar avatar={state.profile.equipped.avatar} frame={item.id} size={88} />;
    case "effect":
      return (
        <div className="flex gap-1 text-4xl">
          {item.particles.map((p, i) => (
            <span key={i} className="animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
              <Emoji e={p} />
            </span>
          ))}
        </div>
      );
    case "theme":
      return (
        <div className="flex gap-1.5">
          {item.swatch.map((c) => (
            <span key={c} className="h-14 w-10 rounded-xl shadow-inner" style={{ background: c }} />
          ))}
        </div>
      );
    case "banner":
      return (
        <div className="grid h-20 w-full place-items-center rounded-2xl text-4xl" style={{ background: item.gradient }}>
          <Em t={item.emoji} />
        </div>
      );
    case "boost":
      return (
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-linear-to-br from-cyan-300 to-violet-500 text-white shadow-lg">
          <Zap size={40} fill="currentColor" />
        </span>
      );
    default:
      return null;
  }
}

export default function ShopPage() {
  const { state, dispatch } = useGame();
  const toast = useToast();
  const [cat, setCat] = useState("avatar");
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const items = SHOP_ITEMS.filter((i) => i.category === cat);
  const eq = state.profile.equipped;

  const buy = async () => {
    setBusy(true);
    try {
      await dispatch("buyItem", { itemId: confirm.id });
      toast(`Покупка совершена: ${confirm.name}!`, "success");
      setConfirm(null);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };
  const equip = async (item, unequip = false) => {
    try {
      await dispatch("equipItem", { slot: item.equipSlot, itemId: unequip ? null : item.id });
      toast(unequip ? "Предмет снят" : `${item.name} — надето!`, "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div>
      <PageHeader title="Магазин Lumos" subtitle="Трать кристаллы, заработанные учёбой. Реальных платежей нет." emoji="🛍️">
        <div className="card flex items-center gap-3 px-5 py-3">
          <LumosIcon size={36} glow />
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Баланс</p>
            <p className="font-display text-2xl font-extrabold">{state.lumos}</p>
          </div>
        </div>
      </PageHeader>

      {state.boosts.lumos > 0 && (
        <p className="mb-4 rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-800"><Emoji e="⚡" /> Активен усилитель Lumos: ещё {state.boosts.lumos} впервые пройденных урока дадут +50% Lumos.</p>
      )}

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {SHOP_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold transition ${cat === c.id ? "bg-brand text-white shadow-lg" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-brand"}`}>
            <Icon name={c.icon} size={17} /> {c.title}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const owned = ownsItem(state, item.id);
          const equipped = item.equipSlot && eq[item.equipSlot] === item.id;
          const qty = state.inventory[item.id]?.qty || 0;
          const canAfford = state.lumos >= item.price;
          return (
            <div key={item.id} className={`card flex flex-col p-4 ${equipped ? "ring-2 ring-brand" : ""}`}>
              <div className="grid h-32 place-items-center rounded-2xl bg-linear-to-br from-slate-50 to-brand-soft">
                <Preview item={item} state={state} />
              </div>
              <div className="mt-3 flex-1">
                <h3 className="font-display font-bold">{item.name}</h3>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                {item.price === 0 ? <span className="text-sm font-extrabold text-emerald-600">Бесплатно</span> : <LumosAmount value={item.price} className="text-lg" />}
                {item.consumable ? (
                  <Button size="sm" onClick={() => setConfirm(item)} disabled={!canAfford}>
                    {canAfford ? `Купить${qty ? ` (есть ${qty})` : ""}` : `Нужно ещё ${item.price - state.lumos}`}
                  </Button>
                ) : !owned ? (
                  <Button size="sm" onClick={() => setConfirm(item)} disabled={!canAfford}>
                    {canAfford ? (
                      <>
                        <ShoppingBag size={15} /> Купить
                      </>
                    ) : (
                      `Нужно ещё ${item.price - state.lumos}`
                    )}
                  </Button>
                ) : equipped ? (
                  ["costume", "frame", "banner"].includes(item.category) ? (
                    <Button size="sm" variant="secondary" onClick={() => equip(item, true)}>
                      <Check size={15} /> Надето · снять
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-brand-soft px-3 py-2 text-sm font-extrabold text-brand">
                      <Check size={15} /> Используется
                    </span>
                  )
                ) : (
                  <Button size="sm" variant="soft" onClick={() => equip(item)}>
                    Надеть
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <section className="card mt-8 p-5">
        <h2 className="font-display mb-3 text-lg font-bold">История операций Lumos</h2>
        {state.lumosTx.length === 0 ? (
          <p className="text-sm text-slate-500">Операций пока нет. Пройди первый урок, чтобы получить Lumos!</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {[...state.lumosTx]
              .reverse()
              .slice(0, 15)
              .map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{t.reason}</p>
                    <p className="text-xs text-slate-400">{formatDate(t.at)}</p>
                  </div>
                  <span className={`shrink-0 font-display font-bold ${t.amount > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {t.amount > 0 ? "+" : ""}
                    {t.amount}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </section>

      <Modal open={Boolean(confirm)} onClose={() => !busy && setConfirm(null)} title="Подтверди покупку">
        {confirm && (
          <div className="text-center">
            <div className="mx-auto grid h-36 place-items-center rounded-2xl bg-linear-to-br from-slate-50 to-brand-soft">
              <Preview item={confirm} state={state} />
            </div>
            <p className="font-display mt-4 text-xl font-bold">{confirm.name}</p>
            <p className="text-slate-500">{confirm.description}</p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-bold">
              Цена: <LumosAmount value={confirm.price} size={15} /> · после покупки останется <LumosAmount value={state.lumos - confirm.price} size={15} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => setConfirm(null)} disabled={busy}>
                Отмена
              </Button>
              <Button variant="gradient" onClick={buy} loading={busy}>
                Купить
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
