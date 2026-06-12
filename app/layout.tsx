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
        <script dangerouslySetInnerHTML={{ __html: `
(function(apiKey){
    (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];
    v=['initialize','identify','updateOptions','pageLoad','track','trackAgent'];for(w=0,x=v.length;w<x;++w)(function(m){
    o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
    y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
    z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
})('fd54939b-8dee-49c9-bf25-ee3a294dc048');

pendo.initialize({ visitor: { id: '' } });
` }} />
      </head>
      <body className="bg-char text-bone antialiased">
        {children}
      </body>
    </html>
  );
}
