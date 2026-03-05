import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Horoyomi - ほろ酔み",
  description: "Horoyomi - ほろ酔み",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <header className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-bold">Horoyomi</h1>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Horoyomi
        </footer>
      </body>
    </html>
  );
}
