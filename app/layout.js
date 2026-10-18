import { Nunito, Unbounded } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin", "cyrillic"] });
const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin", "cyrillic"], weight: ["500", "700", "800"] });

export const metadata = {
  title: { default: "EduQuest — учись играя", template: "%s · EduQuest" },
  description: "Образовательная игровая платформа для школьников Узбекистана: уроки с AI-учителем, мини-игры, Lumos, достижения и рейтинг.",
};

export const viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${nunito.variable} ${unbounded.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
