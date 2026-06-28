import type { Metadata, Viewport } from "next";
import { Gabarito, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// Display/headings/numbers. Only weights actually used (semibold/bold/extrabold)
// + 400 base — drops the unused 500/900 font files.
const gabarito = Gabarito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-gabarito",
});

// Body/UI text. Weights in use (400/500/600/700) — drops the unused 800 file.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  // Absolute base for OG/twitter image + icon URLs and canonical resolution.
  metadataBase: new URL("https://dibs.events"),
  title: "Dibs — call dibs on the to-do list",
  description:
    "A frictionless shared to-do list for ad-hoc group plans. No app, no login.",
  applicationName: "Dibs",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Dibs by Kansoboard",
    title: "Dibs — call dibs on the to-do list",
    description:
      "A frictionless shared to-do list for ad-hoc group plans. No app, no login.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dibs — call dibs on the to-do list",
    description: "A frictionless shared to-do list. No app, no login.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${gabarito.variable} ${hanken.variable}`}>
      <body>{children}</body>
    </html>
  );
}
