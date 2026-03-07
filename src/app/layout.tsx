import type { Metadata } from "next";
import {
  Dela_Gothic_One,
  Outfit,
  DM_Sans,
  Bangers,
  M_PLUS_Rounded_1c,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@/components/error-boundary";
import { ParticleField } from "@/components/particle-field";

const delaGothicOne = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-manga",
  display: "swap",
});

const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-manga-jp",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://mangaforge-chi.vercel.app'),
  title: {
    default: 'InkForge — AI Comic Studio',
    template: '%s | InkForge',
  },
  description:
    'Create manga, western comics, and webtoons with AI. Plan stories, generate chapters, and publish your work in minutes.',
  keywords: [
    'inkforge',
    'comic creator',
    'AI comic studio',
    'manga creator',
    'webtoon builder',
    'AI storytelling',
  ],
  openGraph: {
    title: 'InkForge — AI Comic Studio',
    description:
      'Create manga, western comics, and webtoons with AI. Plan stories, generate chapters, and publish your work in minutes.',
    url: 'https://mangaforge-chi.vercel.app',
    siteName: 'InkForge',
    type: 'website',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'InkForge — AI Comic Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InkForge — AI Comic Studio',
    description:
      'Create manga, western comics, and webtoons with AI. Plan stories, generate chapters, and publish your work in minutes.',
    images: ['/og-image.svg'],
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
      className={`${delaGothicOne.variable} ${outfit.variable} ${dmSans.variable} ${bangers.variable} ${mPlusRounded.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <ParticleField />
        <div className="grain-overlay" />
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
