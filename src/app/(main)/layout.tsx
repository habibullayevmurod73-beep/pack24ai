import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pack24 — Qadoqlash Yechimlari",
    template: "%s | Pack24",
  },
  description:
    "Pack24 — O'zbekistonda eng sifatli qadoqlash mahsulotlari: karton qutular, gofrokarton, qadoqlash materiallari. Arzon narxlar, tez yetkazib berish.",
  keywords: [
    "qadoqlash",
    "karton quti",
    "gofrokarton",
    "packaging",
    "O'zbekiston",
    "Toshkent",
    "pack24",
  ],
  authors: [{ name: "Pack24" }],
  creator: "Pack24",
  openGraph: {
    title: "Pack24 — Qadoqlash Yechimlari",
    description:
      "O'zbekistonda eng sifatli qadoqlash mahsulotlari. Arzon narxlar, tez yetkazib berish.",
    url: "https://pack24.uz",
    siteName: "Pack24",
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pack24 — Qadoqlash Yechimlari",
    description:
      "O'zbekistonda eng sifatli qadoqlash mahsulotlari. Arzon narxlar, tez yetkazib berish.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { LanguageProvider } from "@/lib/contexts/LanguageContext";
import { CurrencyProvider } from "@/lib/contexts/CurrencyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalAIWrapper from "@/components/GlobalAIWrapper";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <GoogleAnalytics />
        <LanguageProvider>
          <CurrencyProvider>
            <Navbar />
            <GlobalAIWrapper />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </CurrencyProvider>
        </LanguageProvider>
        <Toaster richColors position="bottom-right" closeButton duration={3000} />
      </body>
    </html>
  );
}