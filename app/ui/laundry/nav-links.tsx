"use client";

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  ArrowTrendingUpIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: "Beranda", href: "/laundry", icon: HomeIcon },
  {
    name: "Pesanan",
    href: "/laundry/pesanan",
    icon: DocumentDuplicateIcon,
  },
  {
    name: "Pelanggan",
    href: "/laundry/pelanggan",
    icon: UserGroupIcon,
  },
  { name: "Laporan", href: "/laundry/laporan", icon: ArrowTrendingUpIcon },
  { name: "Pengaturan", href: "/laundry/pengaturan", icon: Cog6ToothIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-auto grow flex-col items-center justify-center rounded-xl font-medium transition-all md:flex-row md:w-full md:justify-start md:gap-2.5 md:p-2.5 md:px-3.5 md:text-sm",
              // Portrait mobile: padding dan gap lebih ringkas untuk mencapai ~75% tinggi
              "portrait:py-1.5 portrait:px-1 portrait:gap-0.5",
              // Landscape mobile: padding dan gap standar
              "landscape:p-2.5 landscape:gap-1.5 landscape:text-xs",
              isActive
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/80 font-bold dark:bg-blue-600 dark:text-white dark:border-blue-500 dark:shadow-md"
                : "text-slate-700 dark:text-slate-200 bg-transparent portrait:hover:bg-slate-100 dark:portrait:hover:bg-slate-800 landscape:bg-slate-50/80 md:bg-slate-50/80 dark:landscape:bg-slate-800/60 dark:md:bg-slate-800/60 border border-transparent landscape:border-slate-200/60 md:border-slate-200/60 dark:landscape:border-slate-700/60 dark:md:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-300 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm",
            )}
          >
            <LinkIcon className="w-6 portrait:w-5 portrait:h-5 landscape:w-5 landscape:h-5 md:w-5 md:h-5 flex-shrink-0" />
            <p className="block text-[10px] md:text-sm leading-tight md:leading-normal">
              {link.name}
            </p>
          </Link>
        );
      })}
    </>
  );
}
