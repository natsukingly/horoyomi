import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "horoyomi - ほろ酔み",
  description: "技術記事を酔っ払いでも読めるレベルにリライトするサービス",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <header className="border-b border-border bg-surface px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-3xl items-center justify-between">
              <h1 className="text-xl font-bold text-primary sm:text-2xl">
                horoyomi
              </h1>
              <span className="text-sm text-muted">ほろ酔み</span>
            </div>
          </header>
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            {children}
          </main>
          <footer className="border-t border-border bg-surface px-4 py-6 text-center text-sm text-muted sm:px-6 lg:px-8">
            <p>&copy; 2026 horoyomi</p>
          </footer>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
