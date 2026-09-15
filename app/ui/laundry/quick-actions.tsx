import Link from "next/link";
import {
  Plus,
  Search,
  UserPlus,
  UserSearch,
  Info,
  MessageCircle,
  Globe,
} from "lucide-react";

// Ganti dengan nomor WhatsApp dan URL yang sesuai
const WHATSAPP_URL = "https://wa.me/6281234567890";
const YOUTUBE_URL = "https://www.youtube.com/@ylaundry";
const YLAUNDRY_WEB_URL = "https://ylaundry.com";

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

export default function QuickActions() {
  const actions: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    external?: boolean;
  }[] = [
    { label: "Tambah Pesanan", icon: Plus, href: "/laundry/pesanan/create" },
    { label: "Cari Pesanan", icon: Search, href: "/laundry/pesanan" },
    {
      label: "Tambah Pelanggan",
      icon: UserPlus,
      href: "/laundry/pelanggan/create",
    },
    { label: "Cari Pelanggan", icon: UserSearch, href: "/laundry/pelanggan" },
    { label: "Info yLaundry", icon: Info, href: "/laundry/info" },
    { label: "Butuh Bantuan?", icon: MessageCircle, href: WHATSAPP_URL, external: true },
    { label: "Tutorial yLaundry", icon: YoutubeIcon, href: YOUTUBE_URL, external: true },
    { label: "yLaundry Web", icon: Globe, href: YLAUNDRY_WEB_URL, external: true },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          {...(action.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
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
