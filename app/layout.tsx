import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arrow Physics — 図で止まる物理を、矢印でわかる",
  description:
    "高校物理の力学に特化した、矢印理解と誤解訂正のための学習アプリ。問題図をアップすると、力・速度・加速度の矢印を図の上に重ねて、正誤を1つずつ確かめられます。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1020",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
