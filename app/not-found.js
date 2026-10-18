import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <LogoMark size={64} className="mx-auto animate-float" />
        <h1 className="font-display mt-4 text-4xl font-extrabold">404</h1>
        <p className="mt-2 text-slate-500">Такой страницы нет — похоже, Луми свернул не туда.</p>
        <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-2xl bg-brand px-5 font-extrabold text-white">
          На главную
        </Link>
      </div>
    </div>
  );
}
