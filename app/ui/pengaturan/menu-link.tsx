import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/* Item menu "Menu Pengaturan" (style sama dengan halaman Laporan) */
export default function MenuLink({
    icon: Icon,
    title,
    description,
    href,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 rounded-lg px-1 -mx-1 py-2.5 transition-colors duration-200 hover:bg-gray-50"
        >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 transition-colors duration-200 group-hover:bg-primary-500 group-hover:text-white">
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                    {title}
                </span>
                <span className="truncate text-xs text-gray-500 leading-tight">
                    {description}
                </span>
            </div>
        </Link>
    );
}
