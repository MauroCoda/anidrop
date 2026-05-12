import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { getSiteUrl } from "@/src/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

const defaultDescription =
  "Discover trending anime, seasonal picks, and what to watch next. Search the catalog — fast, dark UI powered by AniList.";

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl } : {}),
  title: {
    default: "AniDrop — anime discovery",
    template: "%s | AniDrop",
  },
  description: defaultDescription,
  applicationName: "AniDrop",
  keywords: [
    "anime",
    "trending anime",
    "seasonal anime",
    "AniList",
    "anime discovery",
  ],
  authors: [{ name: "AniDrop" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AniDrop",
    title: "AniDrop — anime discovery",
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "AniDrop — anime discovery",
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="relative flex min-h-full flex-col"
        suppressHydrationWarning={true}
      >
        <div
          className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35] sm:opacity-40"
          aria-hidden
        >
          <div className="absolute -left-[20%] top-[18%] h-[min(28rem,55vw)] w-[min(28rem,70vw)] rounded-full bg-violet-600/25 blur-[100px]" />
          <div className="absolute -right-[15%] top-[8%] h-[min(22rem,50vw)] w-[min(22rem,55vw)] rounded-full bg-fuchsia-700/20 blur-[90px]" />
          <div className="absolute bottom-[5%] left-[30%] h-[min(20rem,45vw)] w-[min(36rem,90vw)] rounded-full bg-indigo-900/25 blur-[110px]" />
        </div>
        <div className="relative z-0 flex min-h-full flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
