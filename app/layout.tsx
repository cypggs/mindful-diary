import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mindful Diary - 灵感日记",
  description: "记录你的灵感与心情，优雅简洁的日记应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
