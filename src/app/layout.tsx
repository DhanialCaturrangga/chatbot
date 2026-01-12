import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323, Great_Vibes, Inter } from "next/font/google"; // Import Font Baru
import "./globals.css";

// Font Utama (Clean)
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Font Retro (Pixel)
const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

// Font Script (Handwriting)
const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
});

export const metadata: Metadata = {
  title: 'Daniel Caturrangga - Web Developer Portfolio',
  description: 'Portfolio Daniel Caturrangga, Web Developer Next.js & React',
  keywords: ['web developer', 'next.js', 'react', 'portfolio'],
  openGraph: {
    type: 'website',
    url: 'https://your-site.vercel.app',
    title: 'Daniel Caturrangga - Web Developer',
    description: 'Portfolio personal web developer',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daniel Caturrangga - Web Developer',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${vt323.variable} ${greatVibes.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
