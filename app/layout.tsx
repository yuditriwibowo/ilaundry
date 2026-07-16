import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import IlaundryLogo from "./ui/ilaundry-logo";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* h-[100dvh] mengunci tinggi tepat seukuran layar mobile, overflow-hidden mencegah scroll global */}
      <body className={`${inter.className} antialiased flex flex-col h-[100dvh] overflow-hidden`}>
        <div className="fixed top-0 left-0 w-full z-50">
          <Link className="flex h-16 items-center justify-start rounded-b-md bg-blue-600 p-4 md:h-20" href="/">
            <div className="w-full text-white">
              <IlaundryLogo />
            </div>
          </Link>
        </div>
        {/* flex-1 membuat main mengambil semua sisa ruang, overflow-auto mengizinkan scroll hanya di sini */}
        <main className="flex-1 mt-16 md:mt-20 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}