"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import YlaundryLogo from "./ylaundry-logo";

export default function Header() {
  const pathname = usePathname();
  const showOnMobile = ["/", "/laundry"].includes(pathname);
  const showGapOnMobile = showOnMobile;

  return (
    <header className={`flex-none ${showGapOnMobile ? "pt-3 short-screen:pt-1" : "pt-0 md:pt-3 short-screen:pt-0"} px-4 pb-4 short-screen:pb-2 z-50 flex justify-center ${!showOnMobile ? "hidden md:flex short-screen:hidden" : ""} bg-gradient-to-b from-primary-400 to-primary-800 rounded-b-xl mb-4 short-screen:mb-2`}>
      <Link
        className="flex h-16 items-center justify-start p-4 md:h-20 short-screen:h-12 w-full md:w-95/100"
        href="/"
      >
        <div className="w-full text-white flex justify-start">
          <YlaundryLogo />
        </div>
      </Link>
    </header>
  );
}
