import SelectToko from "@/app/ui/laundry/select-toko";
import DisplayModeSetting from "@/app/ui/pengaturan/display-mode-setting";
import SignOutButton from "@/app/ui/pengaturan/sign-out-button";
import { fetchAccessibleToko } from "@/app/lib/data";
import { getSessionContext } from "@/app/lib/auth";
import Link from "next/link";
import { 
    User, 
    Store, 
    Timer, 
    Shirt, 
    Droplets, 
    Tag, 
    Truck, 
    UserCog, 
    Users, 
    FileText,
    SunMoon,
    type LucideIcon,
} from "lucide-react";

const menuItems = [
    {
        title: "Pengaturan Akun",
        description: "Ubah password akun anda",
        icon: User,
        href: "/laundry/pengaturan/akun",
    },
    {
        title: "Pengaturan Toko",
        description: "Tambah, ubah, hapus toko/outlet laundry",
        icon: Store,
        href: "/laundry/pengaturan/toko",
    },
    {
        title: "Pengaturan Durasi Layanan",
        description: "Tambah, ubah, hapus durasi layanan",
        icon: Timer,
        href: "/laundry/pengaturan/durasi",
    },
    {
        title: "Pengaturan Layanan",
        description: "Tambah, ubah, hapus layanan",
        icon: Shirt,
        href: "/laundry/pengaturan/layanan",
    },
    {
        title: "Pengaturan Parfum",
        description: "Tambah, ubah, hapus Parfum",
        icon: Droplets,
        href: "/laundry/pengaturan/parfum",
    },
    {
        title: "Pengaturan Diskon",
        description: "Tambah, ubah, hapus diskon",
        icon: Tag,
        href: "/laundry/pengaturan/diskon",
    },
    {
        title: "Pengaturan Antar-Jemput",
        description: "Tambah, ubah, hapus antar-jemput",
        icon: Truck,
        href: "/laundry/pengaturan/antar-jemput",
    },
    {
        title: "Pengaturan User Toko",
        description: "Atur, tambah, ubah, hapus user toko",
        icon: UserCog,
        href: "/laundry/pengaturan/usertoko",
    },
    {
        title: "Pengaturan Pelanggan",
        description: "Tambah, ubah, hapus pelanggan",
        icon: Users,
        href: "/laundry/pelanggan",
    },
    {
        title: "Pengaturan Nota",
        description: "Atur tampilan nota",
        icon: FileText,
        href: "/laundry/pengaturan/nota",
    },
];

/* Item menu "Menu Pengaturan" (style sama dengan halaman Laporan) */
function MenuLink({
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

export default async function Page() {
    const ctx = await getSessionContext();
    const stores = await fetchAccessibleToko();
    const selectedToko = ctx.selectedTokoId;

    return (
        <div className="w-full pb-4 md:pb-10">
            {/* Header halaman: sticky gradient di mobile portrait, statis di landscape/desktop */}
            <div className="sticky top-0 z-10 md:static">
                <div className="header-gradient shadow-md pb-3 px-4 pt-6 -mx-4 rounded-b-xl md:bg-none md:shadow-none md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none short-screen:pb-2 short-screen:pt-3">
                    <div className="flex w-full items-center justify-between gap-4">
                        <h1 className="text-2xl text-white md:text-gray-900 short-screen:text-xl">
                            Pengaturan
                        </h1>
                        <div className="flex items-center gap-2 md:gap-3">
                            <SelectToko stores={stores} selectedToko={selectedToko} />
                            <SignOutButton />
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 1. MOBILE PORTRAIT VIEW (Tampilan mobile portrait)                        */}
            {/* ========================================================================= */}
            <div className="block md:hidden landscape:hidden">
                {/* 1.1 Fieldset Mode Display */}
                <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <legend className="px-2 text-sm font-semibold text-gray-700">
                        Mode Display
                    </legend>
                    <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
                        <SunMoon className="h-4 w-4 text-gray-400 shrink-0" />
                        <span>Pilih tampilan aplikasi: terang, gelap, atau sesuai system</span>
                    </div>
                    <DisplayModeSetting />
                </fieldset>

                {/* 1.2 Fieldset Menu Pengaturan */}
                <fieldset className="mt-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <legend className="px-2 text-sm font-semibold text-gray-700">
                        Menu Pengaturan
                    </legend>
                    <div className="divide-y divide-gray-100">
                        {menuItems.map((item, index) => (
                            <MenuLink
                                key={index}
                                icon={item.icon}
                                title={item.title}
                                description={item.description}
                                href={item.href}
                            />
                        ))}
                    </div>
                </fieldset>
            </div>

            {/* ========================================================================= */}
            {/* 2. LANDSCAPE / DESKTOP VIEW (Tampilan landscape & desktop)                */}
            {/* ========================================================================= */}
            <div className="hidden md:grid landscape:grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-4 md:gap-6 short-screen:gap-3">
                <div className="landscape:col-span-12 md:col-span-12 space-y-4 md:space-y-6 short-screen:space-y-3">
                    {/* 2.1 Fieldset Mode Display */}
                    <fieldset className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 short-screen:p-3 shadow-sm">
                        <legend className="px-2 text-sm font-semibold text-gray-700">
                            Mode Display
                        </legend>
                        <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
                            <SunMoon className="h-4 w-4 text-gray-400 shrink-0" />
                            <span>Pilih tampilan aplikasi: terang, gelap, atau sesuai system</span>
                        </div>
                        <DisplayModeSetting />
                    </fieldset>

                    {/* 2.2 Fieldset Menu Pengaturan */}
                    <fieldset className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 short-screen:p-3 shadow-sm">
                        <legend className="px-2 text-sm font-semibold text-gray-700">
                            Menu Pengaturan
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                            {menuItems.map((item, index) => (
                                <MenuLink
                                    key={index}
                                    icon={item.icon}
                                    title={item.title}
                                    description={item.description}
                                    href={item.href}
                                />
                            ))}
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    );
}

