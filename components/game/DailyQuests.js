"use client";
import { useState } from "react";
import { Check, Gift } from "lucide-react";
import { useGame } from "@/components/providers/GameProvider";
import { useToast } from "@/components/ui/Toast";
import { dailyQuestStatus } from "@/lib/quests";
import ProgressBar from "@/components/ui/ProgressBar";
import { LumosAmount } from "@/components/ui/LumosIcon";
import XpAmount from "@/components/ui/XpBadge";
import { Em } from "@/components/ui/Emoji";

export default function DailyQuests() {
  const { state, today, dispatch } = useGame();
  const toast = useToast();
  const [busy, setBusy] = useState(null);
  const quests = dailyQuestStatus(state, today);

  const claim = async (q) => {
    setBusy(q.id);
    try {
      await dispatch("claimQuest", { questId: q.id });
      toast(`Задание выполнено: +${q.reward.xp} XP и +${q.reward.lumos} Lumos`, "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      {quests.map((q) => (
        <div key={q.id} className={`flex items-center gap-3 rounded-2xl p-3 ${q.claimed ? "bg-emerald-50" : "bg-slate-50"}`}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-xl shadow-sm"><Em t={q.icon} /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold">{q.title}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <ProgressBar value={q.value / q.target} height="h-2" barClass={q.done ? "bg-emerald-500" : "bg-brand-gradient"} label={q.title} />
              <span className="shrink-0 text-xs font-extrabold text-slate-500 tabular-nums">
                {q.value}/{q.target}
              </span>
            </div>
          </div>
          {q.claimed ? (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-white" aria-label="Награда получена">
              <Check size={18} strokeWidth={3} />
            </span>
          ) : q.done ? (
            <button onClick={() => claim(q)} disabled={busy === q.id} className="btn-3d inline-flex items-center gap-1 rounded-xl bg-amber-400 px-3 py-2 text-xs font-extrabold text-amber-950 disabled:opacity-60">
              <Gift size={15} /> Забрать
            </button>
          ) : (
            <div className="hidden flex-col items-end text-[11px] sm:flex">
              <XpAmount value={`+${q.reward.xp}`} size={12} className="text-amber-600" />
              <LumosAmount value={`+${q.reward.lumos}`} size={13} className="text-violet-600" />
            </div>
          )}
        </div>
      ))}
      <p className="text-center text-xs font-bold text-slate-400">Задания обновляются в полночь по ташкентскому времени</p>
    </div>
  );
}
