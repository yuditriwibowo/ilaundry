import Link from "next/link";
import { Plus, Search, UserPlus, UserSearch } from "lucide-react";

export default function QuickActions() {
  const actions = [
    { label: "Tambah Pesanan", icon: Plus, href: "/laundry/pesanan/create" },
    { label: "Cari Pesanan", icon: Search, href: "/laundry/pesanan" },
    { label: "Tambah Pelanggan", icon: UserPlus, href: "/laundry/pelanggan/create" },
    { label: "Cari Pelanggan", icon: UserSearch, href: "/laundry/pelanggan" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="aspect-square flex flex-col items-center justify-center p-2 md:p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors gap-1 md:gap-3 text-center shadow-sm"
        >
          <div className="p-2 md:p-3 bg-gray-100 rounded-full text-gray-600">
            <action.icon className="w-4 h-4 md:w-6 md:h-6" />
          </div>
          <span className="text-[10px] md:text-sm font-medium text-gray-700 leading-tight">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
