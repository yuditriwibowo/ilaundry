"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import YlaundryLogo from "./ylaundry-logo";

export default function Header() {
  const pathname = usePathname();
  const showGapOnMobile = pathname === "/" || pathname === "/laundry";
  const hideOnMobile = [
    "/laundry/laporan",
    "/laundry/pelanggan",
    "/laundry/pesanan",
  ].includes(pathname);

  return (
    <header className={`flex-none ${showGapOnMobile ? "pt-3" : "pt-0 md:pt-3"} px-4 pb-2 z-50 flex justify-center ${hideOnMobile ? "hidden md:flex" : ""}`}>
      <Link
        className="flex h-16 items-center justify-start rounded-xl bg-blue-600 p-4 md:h-20 w-full md:w-95/100 shadow-md"
        href="/"
      >
        <div className="w-full text-white">
          <YlaundryLogo />
        </div>
      </Link>
    </header>
  );
}
