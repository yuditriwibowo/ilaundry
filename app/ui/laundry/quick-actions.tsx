import Link from "next/link";
import { Plus, Search, UserPlus, UserSearch } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      label: "Tambah Pesanan",
      icon: Plus,
      href: "/laundry/pesanan/create",
    },
    {
      label: "Cari Pesanan",
      icon: Search,
      href: "/laundry/pesanan",
    },
    {
      label: "Tambah Pelanggan",
      icon: UserPlus,
      href: "/laundry/pelanggan/create",
    },
    {
      label: "Cari Pelanggan",
      icon: UserSearch,
      href: "/laundry/pelanggan",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors gap-3 text-center shadow-sm"
        >
          <div className="p-3 bg-gray-100 rounded-full text-gray-600">
            <action.icon className="w-6 h-6" />
          </div>
          <span className="text-xs md:text-sm font-medium text-gray-700">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
