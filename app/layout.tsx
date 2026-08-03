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

const siteUrl = "https://dajc.cz";
const description =
  "DAJC — jednotné digitální místo, kde se z nákladu stává řízená přepravní zakázka pro těžkou a nadrozměrnou přepravu.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DAJC — platforma pro těžkou a nadrozměrnou přepravu",
    template: "%s | DAJC",
  },
  description,
  icons: {
    icon: [
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon-180x180.png", sizes: "180x180" }],
    other: [
      {
        rel: "icon",
        url: "/brand/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/brand/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: "DAJC — platforma pro těžkou a nadrozměrnou přepravu",
    description,
    url: siteUrl,
    siteName: "DAJC",
    images: [
      {
        url: "/brand/DAJC-icon-color-transparent-1024.png",
        width: 1024,
        height: 1024,
      },
    ],
    locale: "cs_CZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
