import SelectToko from "@/app/ui/laundry/select-toko";
import { fetchToko } from "@/app/lib/data";
import Link from "next/link";
import { cookies } from "next/headers";
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
    FileText 
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
        description: "Tambah, ubah, hapus outlet laundry",
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
        title: "Pengaturan Kasir",
        description: "Atur, tambah, ubah, hapus kasir",
        icon: UserCog,
        href: "/laundry/pengaturan/kasir",
    },
    {
        title: "Pengaturan Pelanggan",
        description: "Tambah, ubah, hapus pelanggan",
        icon: Users,
        href: "/laundry/pengaturan/pelanggan",
    },
    {
        title: "Pengaturan Nota",
        description: "Atur tampilan nota",
        icon: FileText,
        href: "/laundry/pengaturan/nota",
    },
];

export default async function Page() {
    const stores = await fetchToko();
    const cookieStore = await cookies();
    const selectedToko = cookieStore.get("selected_toko")?.value || "";

    return (
        <div className="flex h-full w-full flex-col -mt-2">
            <div className="sticky top-0 z-10 bg-gradient-to-b from-primary-400 to-primary-800 pb-6 px-4 pt-6 -mx-4 rounded-b-xl md:static md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none">
                <div className="flex w-full items-center justify-between gap-4">
                         <h1 className={`text-2xl text-white md:text-black`}>Pengaturan</h1>
                         <SelectToko stores={stores} selectedToko={selectedToko} />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
                <div className="flex flex-col gap-3 p-4">
                    {menuItems.map((item, index) => (
                        <Link 
                            key={index} 
                            href={item.href} 
                            className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-primary-50 transition-all duration-200 ease-in-out"
                        >
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500 text-white shrink-0 shadow-md group-hover:scale-110 transition-transform duration-200">
                                <item.icon size={22} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-700 group-hover:text-primary-600 transition-colors duration-200">{item.title}</span>
                                <span className="text-xs text-gray-500 leading-tight">{item.description}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

