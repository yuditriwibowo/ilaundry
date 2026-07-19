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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* h-[100dvh] mengunci tinggi tepat seukuran layar mobile, overflow-hidden mencegah scroll global */}
      <body className={`${inter.className} antialiased flex flex-col h-[100dvh] overflow-hidden`}>
        <PWARegister />
        <div className="fixed top-3 left-0 w-full z-50 flex justify-center px-4">
          <Link className="flex h-16 items-center justify-start rounded-xl bg-blue-600 p-4 md:h-20 w-full md:w-4/5 shadow-md" href="/">
            <div className="w-full text-white">
              <IlaundryLogo />
            </div>
          </Link>
        </div>
        {/* flex-1 membuat main mengambil semua sisa ruang, overflow-auto mengizinkan scroll hanya di sini */}
        <main className="flex-1 mt-24 md:mt-28 overflow-auto flex justify-center">
          <div className="w-full md:w-4/5">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}