import type { Metadata } from "next";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Versprochen? — Halten Parteien ihre Versprechen?",
  description:
    "KI-gestützter Abgleich von Wahlprogrammen mit dem tatsächlichen Abstimmungsverhalten im Bundestag und den Landtagen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-white text-gray-900 font-sans antialiased">
        <TopBar />
        <Navigation />
        <main className="max-w-5xl mx-auto px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
