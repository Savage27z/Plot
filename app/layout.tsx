import type { Metadata } from "next";
import { Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Plot — see your decision",
  description:
    "A cinematic war room for product decisions. Lay your decision out as cards on a table, arrange your thinking, and let an AI strategist read what your arrangement reveals.",
  openGraph: {
    title: "Plot — see your decision",
    description:
      "Lay your decision out on the table. An AI strategist reads your spatial arrangement and challenges your assumptions.",
    siteName: "Plot",
    type: "website",
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${instrument.variable} ${plexMono.variable}`}>
      <head>
        {/* NOVUS/PENDO SNIPPET HERE — do not remove */}
      </head>
      <body className="bg-char text-bone antialiased">
        {children}
      </body>
    </html>
  );
}
