import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AP 苦手だけ道場｜応用情報の復習ツール",
  description: "思い出せない用語を優先して復習する、応用情報技術者試験のための学習ツール。",
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
