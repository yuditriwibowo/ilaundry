import SelectToko from "@/app/ui/laundry/select-toko";
import DisplayModeSetting from "@/app/ui/pengaturan/display-mode-setting";
import SignOutButton from "@/app/ui/pengaturan/sign-out-button";
import MenuLink from "@/app/ui/pengaturan/menu-link";
import { fetchAccessibleToko } from "@/app/lib/data";
import { getSessionContext } from "@/app/lib/auth";
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
    AppWindow,
    type LucideIcon,
} from "lucide-react";

const menuItems: {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    // Hanya tampil untuk user dengan peran Administrator.
    adminOnly?: boolean;
}[] = [
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
        title: "App Admin",
        description: "Kelola pengaturan aplikasi (Administrator)",
        icon: AppWindow,
        href: "/laundry/pengaturan/app-admin",
        adminOnly: true,
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

export default async function Page() {
    const ctx = await getSessionContext();
    const stores = await fetchAccessibleToko();
    const selectedToko = ctx.selectedTokoId;

    // Item adminOnly (App Admin) hanya tampil untuk user dengan peran
    // Administrator. Menu pengaturan lain tetap tampil untuk semua role.
    const visibleMenuItems = menuItems.filter(
        (item) => !item.adminOnly || ctx.peran === "Administrator",
    );

    return (
        <div className="w-full pb-4 md:pb-10">
            {/* Header halaman: sticky gradient di mobile portrait, statis di landscape/desktop */}
            <div className="sticky top-0 z-10 md:static">
                <div className="header-gradient shadow-md pb-3 px-4 pt-6 -mx-4 rounded-b-xl md:bg-none md:shadow-none md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none short-screen:pb-2 short-screen:pt-3">
                    <h1 className="text-2xl text-white md:text-gray-900 short-screen:text-xl">
                        Pengaturan
                    </h1>
                    <div className="flex items-center gap-2 md:gap-3 mt-3 landscape:hidden">
                        <SelectToko stores={stores} selectedToko={selectedToko} />
                        <SignOutButton />
                    </div>
                    <div className="hidden landscape:flex items-center gap-2 md:gap-3 mt-3 md:mt-0">
                        <SelectToko stores={stores} selectedToko={selectedToko} />
                        <SignOutButton />
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
                        {visibleMenuItems.map((item, index) => (
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
                            {visibleMenuItems.map((item, index) => (
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

