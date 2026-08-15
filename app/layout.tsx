import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import Header from "./ui/header";
import Link from "next/link";
import PWARegister from "@/app/ui/pwa-register";
import ViewportHeightFix from "@/app/ui/viewport-height-fix";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "yLaundry Premium",
  description: "Aplikasi Laundry Premium Terpercaya",
  appleWebApp: {
    capable: true,
    title: "yLaundry",
    statusBarStyle: "black",
  },
};

export const viewport: Viewport = {
  themeColor: "#60a5fa",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* --app-height di-set via JS agar tinggi viewport akurat di PWA mobile */}
      <body
        className={`${inter.className} antialiased flex flex-col h-[var(--app-height,100svh)] overflow-hidden`}
      >
        <PWARegister />
        <ViewportHeightFix />
        {/* Header flex-none agar mengambil tinggi sesuai konten tanpa menggunakan fixed/margin-top */}
        <Header />
        {/* flex-1 min-h-0 membuat main mengambil tepat sisa ruang viewport tanpa terdorong keluar layar */}
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="w-full h-full flex flex-col min-h-0">{children}</div>
        </main>
      </body>
    </html>
  );
}
