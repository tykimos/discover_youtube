import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "유튜브 소재 발굴기 | YouTube Content Discovery",
  description: "바이럴 가능성이 높은 유튜브 콘텐츠 소재를 AI로 발굴하세요",
  keywords: ["유튜브", "콘텐츠", "바이럴", "AI", "분석", "크리에이터"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-background font-sans">
        {children}
      </body>
    </html>
  );
}
