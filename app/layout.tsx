import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import IlaundryLogo from "./ui/ilaundry-logo";
import Link from "next/link";
import PWARegister from "@/app/ui/pwa-register";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "iLaundry Premium",
  description: "Aplikasi Laundry Premium Terpercaya",
  appleWebApp: {
    capable: true,
    title: "iLaundry",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* h-[100dvh] mengunci tinggi tepat seukuran layar mobile, overflow-hidden mencegah scroll global */}
      <body
        className={`${inter.className} antialiased flex flex-col h-[100dvh] overflow-hidden`}
      >
        <PWARegister />
        {/* Header flex-none agar mengambil tinggi sesuai konten tanpa menggunakan fixed/margin-top */}
        <header className="flex-none pt-3 px-4 pb-2 z-50 flex justify-center">
          <Link
            className="flex h-16 items-center justify-start rounded-xl bg-blue-600 p-4 md:h-20 w-full md:w-95/100 shadow-md"
            href="/"
          >
            <div className="w-full text-white">
              <IlaundryLogo />
            </div>
          </Link>
        </header>
        {/* flex-1 min-h-0 membuat main mengambil tepat sisa ruang viewport tanpa terdorong keluar layar */}
        <main className="flex-1 min-h-0 flex flex-col justify-center overflow-hidden">
          <div className="w-full h-full flex flex-col min-h-0">{children}</div>
        </main>
      </body>
    </html>
  );
}
