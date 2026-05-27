import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { PwaRegister } from "@/components/pwa-register";
import {
  PWA_APP_NAME,
  PWA_APP_SHORT_NAME,
  PWA_THEME_COLOR,
} from "@/lib/pwa-brand";
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
  title: PWA_APP_NAME,
  description: "3秒チェックインアプリ",
  applicationName: PWA_APP_SHORT_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: PWA_APP_SHORT_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: PWA_THEME_COLOR,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <PwaRegister />
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
