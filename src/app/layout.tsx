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
        className="min-h-full flex flex-col"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
