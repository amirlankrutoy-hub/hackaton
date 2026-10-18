import Link from "next/link";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-brand text-white hover:brightness-110 btn-3d",
  gradient: "bg-brand-gradient text-white hover:brightness-110 btn-3d",
  success: "bg-emerald-500 text-white hover:bg-emerald-600 btn-3d",
  danger: "bg-rose-500 text-white hover:bg-rose-600 btn-3d",
  warning: "bg-amber-400 text-amber-950 hover:bg-amber-300 btn-3d",
  secondary: "bg-white text-ink border-2 border-slate-200 hover:border-brand hover:text-brand",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  soft: "bg-brand-soft text-brand hover:bg-brand-tint",
};
const SIZES = {
  sm: "h-9 px-3.5 text-sm rounded-xl gap-1.5",
  md: "h-11 px-5 text-[15px] rounded-2xl gap-2",
  lg: "h-14 px-7 text-lg rounded-2xl gap-2.5",
  xl: "h-16 px-8 text-xl rounded-3xl gap-3",
};

export default function Button({ href, variant = "primary", size = "md", loading = false, className = "", children, disabled, ...props }) {
  const cls = `inline-flex items-center justify-center text-center font-extrabold select-none transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  if (href && !disabled) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </button>
  );
}
