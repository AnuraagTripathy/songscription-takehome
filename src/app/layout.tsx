import type { Metadata } from "next";
import { Archivo, Literata } from "next/font/google";
import "./globals.css";
import { SiteBackground } from "@/components/SiteBackground";

// Two faces with two jobs. Literata sets the works and the sentences a learner
// reads — it is a face designed for long reading on a screen, which is what a
// page of instructions is. Archivo carries every label, control and measured
// value, where the job is to be unambiguous at 12px rather than pleasant at 18.
const book = Literata({
  subsets: ["latin"],
  variable: "--font-book",
  display: "swap",
});

const label = Archivo({
  subsets: ["latin"],
  variable: "--font-label",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Songscription — your songs",
  description:
    "Every song you have had transcribed, with how long it takes, how hard it is, and how to start learning it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${book.variable} ${label.variable}`}>
      <body className="font-label antialiased">
        <SiteBackground />
        {children}
      </body>
    </html>
  );
}
