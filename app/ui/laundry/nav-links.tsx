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
              "flex h-auto grow flex-col items-center justify-center rounded-md font-medium transition-colors hover:bg-sky-100 hover:text-blue-600 md:flex-row md:w-full md:justify-start md:gap-2 md:p-2 md:px-3 md:text-sm",
              // Portrait mobile: padding dan gap lebih ringkas untuk mencapai ~75% tinggi
              "portrait:py-1.5 portrait:px-1 portrait:gap-0.5",
              // Landscape mobile: padding dan gap standar
              "landscape:p-3 landscape:gap-1 landscape:text-sm",
              isActive
                ? "bg-sky-100 text-blue-600"
                : "bg-transparent text-gray-700 landscape:bg-gray-50 md:bg-gray-50",
            )}
          >
            <LinkIcon className="w-6 portrait:w-5 portrait:h-5 landscape:w-6 md:w-6 flex-shrink-0" />
            <p className="block text-[10px] md:text-sm leading-tight md:leading-normal">
              {link.name}
            </p>
          </Link>
        );
      })}
    </>
  );
}
