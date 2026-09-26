import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BMIA Dashboard",
  description: "Dashboard for BMIA Discord Server",
  manifest: "/manifest.json",
  other: {
    "darkreader-lock": "",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BMIA Dashboard",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

import { PwaRegistrar } from "@/components/PwaRegistrar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <head>
        <meta name="darkreader-lock" content="darkreader-lock" />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${rajdhani.variable} antialiased bg-[#06080d] text-slate-100 min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        <PwaRegistrar />
        {children}
      </body>
    </html>
  );
}
