import type { Metadata, Viewport } from "next";
import { Gabarito, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// Display/headings/numbers (handoff: Gabarito 400-900).
const gabarito = Gabarito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-gabarito",
});

// Body/UI text (handoff: Hanken Grotesk 400-800).
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  title: "Dibs — call dibs on the to-do list",
  description: "A frictionless shared to-do list for ad-hoc group plans. No app, no login.",
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
