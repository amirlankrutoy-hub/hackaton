"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Em } from "@/components/ui/Emoji";

const ToastContext = createContext(() => {});
const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info };
const TONES = { success: "bg-emerald-600", error: "bg-rose-600", info: "bg-slate-800" };

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useCallback((message, tone = "info") => {
    const id = crypto.randomUUID();
    setItems((list) => [...list, { id, message, tone }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 3800);
  }, []);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 lg:bottom-6" aria-live="polite">
        {items.map((t) => {
          const I = ICONS[t.tone] || Info;
          return (
            <div key={t.id} className={`animate-rise pointer-events-auto flex max-w-md items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-xl ${TONES[t.tone] || TONES.info}`}>
              <I size={18} className="shrink-0" />
              <Em t={t.message} />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
