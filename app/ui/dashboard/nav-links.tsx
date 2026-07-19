"use client";

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: "Beranda", href: "/dashboard", icon: HomeIcon },
  {
    name: "Pesanan",
    href: "/dashboard/pesanan",
    icon: DocumentDuplicateIcon,
  },
  {
    name: "Pelanggan",
    href: "/dashboard/pelanggan",
    icon: UserGroupIcon,
  },
  { name: "Laporan", href: "/dashboard/laporan", icon: ArrowTrendingUpIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-auto grow flex-col items-center justify-center gap-1 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-row md:h-auto md:w-full md:justify-start md:gap-2 md:p-2 md:px-3",
              {
                "bg-sky-100 text-blue-600": pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="block text-[10px] md:text-sm">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
