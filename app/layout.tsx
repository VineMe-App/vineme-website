import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Nunito } from "next/font/google";
import localFont from "next/font/local";
import EntryModal from "@/components/shared/EntryModal";
import Navbar from "@/components/shared/Navbar";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito-body",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const nunitoHeading = Nunito({
  variable: "--font-nunito-heading",
  subsets: ["latin"],
  weight: "900",
});

// Cal Sans v2 variable (SIL OFL 1.1), from the official `cal-sans` npm package.
const calSans = localFont({
  src: "./fonts/cal-sans/CalSansVF.woff2",
  variable: "--font-cal-sans",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VineMe",
  description: "Helping UK churches connect people into small groups.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
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
      className={`${nunito.variable} ${nunitoHeading.variable} ${calSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-brand-dark">
        <Navbar />
        <main className="flex-1">{children}</main>
        <EntryModal />
        <Analytics />
      </body>
    </html>
  );
}
