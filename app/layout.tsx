import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Front Gym Pro - платформа подготовки фронтендера",
  description:
    "Глубокие конспекты, тренажёры, интервью-вопросы и задачи по HTML, CSS, JavaScript и React.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
