"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { Em } from "@/components/ui/Emoji";

export default function Modal({ open, onClose, title, children, className = "", hideClose = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`card animate-rise relative max-h-[92vh] w-full overflow-y-auto rounded-b-none p-6 sm:max-w-lg sm:rounded-3xl ${className}`} onClick={(e) => e.stopPropagation()}>
        {!hideClose && (
          <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Закрыть">
            <X size={20} />
          </button>
        )}
        {title && <h2 className="font-display mb-4 pr-8 text-xl font-bold"><Em t={title} /></h2>}
        {children}
      </div>
    </div>
  );
}
