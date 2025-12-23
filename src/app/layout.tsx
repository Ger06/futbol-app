import type { Metadata } from "next";
import { Geist, Geist_Mono, Permanent_Marker, Oswald } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/shared/components/providers/QueryProvider";
import { GoogleAnalytics } from "@/shared/components/analytics/GoogleAnalytics";
import { MainLayout } from "@/shared/components/layout/MainLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-marker",
  weight: "400",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Fútbol en Vivo";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: "Resultados en vivo, fixtures, posiciones y estadísticas de fútbol. Champions League, Premier League, La Liga, Serie A, Liga Argentina, Brasileirão y MLS.",
  keywords: ["fútbol", "resultados", "fixtures", "posiciones", "estadísticas", "goles", "videos"],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: siteName,
    title: siteName,
    description: "Resultados en vivo, fixtures, posiciones y estadísticas de fútbol",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: "Resultados en vivo, fixtures, posiciones y estadísticas de fútbol",
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
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${permanentMarker.variable} ${oswald.variable} antialiased`}
      >
        <GoogleAnalytics />
        <QueryProvider>
          <MainLayout>{children}</MainLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
