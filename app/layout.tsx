import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "샵 매출/고정비 대시보드",
  description: "구글 계정별 쇼피파이 샵 매출, 고정비, 순이익 관리",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const accounts = await prisma.googleAccount.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      shops: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          revenueEntries: { select: { date: true, amount: true } },
        },
      },
    },
  });

  const revenueByDate: Record<string, number> = {};
  for (const account of accounts) {
    for (const shop of account.shops) {
      for (const entry of shop.revenueEntries) {
        revenueByDate[entry.date] = (revenueByDate[entry.date] ?? 0) + entry.amount;
      }
    }
  }
  const navAccounts = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    shops: a.shops.map((s) => ({ id: s.id, name: s.name })),
  }));

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <TopNav accounts={navAccounts} revenueByDate={revenueByDate} />
        {children}
      </body>
    </html>
  );
}
