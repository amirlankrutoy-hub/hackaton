"use client";
import { AuthProvider } from "./AuthProvider";
import { GameProvider } from "./GameProvider";
import { ToastProvider } from "@/components/ui/Toast";
import CelebrationLayer from "@/components/game/Celebration";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <GameProvider>
        <ToastProvider>
          {children}
          <CelebrationLayer />
        </ToastProvider>
      </GameProvider>
    </AuthProvider>
  );
}
