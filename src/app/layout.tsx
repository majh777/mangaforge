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
  title: "InkForge — Where Stories Become Art",
  description:
    "Create stunning manga, comics, manhwa, and webtoons with AI. From prompt to published — forge your stories into art.",
  keywords: [
    "manga creator",
    "AI manga",
    "comic generator",
    "webtoon creator",
    "manhwa",
    "AI art",
    "InkForge",
  ],
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
