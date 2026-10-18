"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useGame } from "@/components/providers/GameProvider";
import AppShell from "@/components/layout/AppShell";
import { FullPageLoader } from "@/components/ui/Misc";
import Button from "@/components/ui/Button";
import { Emoji } from "@/components/ui/Emoji";

// Защита пользовательских маршрутов: без входа — на страницу логина.
export default function ProtectedLayout({ children }) {
  const { user, ready } = useAuth();
  const { state, loadError, reload } = useGame();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, router, pathname]);

  if (!ready || !user) return <FullPageLoader label="Проверяем вход…" />;
  if (loadError) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div className="card max-w-md p-8">
          <p className="text-4xl"><Emoji e="⚠️" /></p>
          <p className="font-display mt-2 text-lg font-bold">Не удалось загрузить прогресс</p>
          <p className="mt-1 text-slate-500">{loadError}</p>
          <Button onClick={reload} className="mt-4">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }
  if (!state) return <FullPageLoader label="Загружаем твой прогресс…" />;
  return <AppShell>{children}</AppShell>;
}
