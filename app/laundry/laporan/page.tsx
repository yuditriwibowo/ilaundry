import Link from "next/link";
import {
    Banknote,
    CircleDollarSign,
    Wallet,
    ReceiptText,
    SquareX,
    BanknoteArrowDown,
    Users,
    Shirt,
    type LucideIcon,
} from "lucide-react";
import { formatRupiah } from "@/app/lib/utils";
import { fetchLaporanPesananHariIni } from "@/app/lib/data/pesanan";

// TODO: Ambil data riil dari database (ringkasan kas & pesanan hari ini)
const saldoKas = {
    tunai: 0,
    nonTunai: 0,
};

// TODO: Buat route halaman laporan terkait, lalu perbarui href di bawah
const menuItems = [
    {
        title: "Laporan Kas",
        description: "Laporan mutasi kas",
        icon: CircleDollarSign,
        href: "#",
    },
    {
        title: "Laporan Pesanan",
        description: "Laporan data pesanan",
        icon: ReceiptText,
        href: "#",
    },
    {
        title: "Analisa Pelanggan",
        description: "Analisa data pelanggan",
        icon: Users,
        href: "#",
    },
    {
        title: "Analisa Layanan",
        description: "Analisa data layanan",
        icon: Shirt,
        href: "#",
    },
];

function SectionTitle({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 whitespace-nowrap">
                {title}
            </h2>
            <div className="h-px flex-1 bg-gray-300" />
        </div>
    );
}

function SummaryRow({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <Icon size={20} className="text-gray-500 shrink-0" />
            <span className="text-gray-600">{label}</span>
            <span className="ml-auto text-right font-bold text-gray-900">
                {value}
            </span>
        </div>
    );
}

export default async function Page() {
    const pesananHariIni = await fetchLaporanPesananHariIni();

    return (
        <div className="flex h-full w-full flex-col -mt-2">
            <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md pb-6 px-4 pt-6 -mx-4 rounded-b-xl md:static md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none">
                <div className="flex w-full items-center justify-between gap-4">
                    <h1 className="text-2xl text-white md:text-gray-900">
                        Laporan
                    </h1>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 portrait:scrollbar-hide portrait-no-scrollbar portrait:pb-4">
                <div className="flex flex-col gap-6 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Saldo Kas */}
                        <section className="flex flex-col gap-4">
                            <SectionTitle title="Saldo Kas" />
                            <div className="flex flex-col gap-4">
                                <SummaryRow
                                    icon={Banknote}
                                    label="Saldo Tunai"
                                    value={formatRupiah(saldoKas.tunai)}
                                />
                                <SummaryRow
                                    icon={CircleDollarSign}
                                    label="Saldo Non-Tunai"
                                    value={formatRupiah(saldoKas.nonTunai)}
                                />
                            </div>
                        </section>

                        {/* Pesanan Hari Ini */}
                        <section className="flex flex-col gap-4">
                            <SectionTitle title="Pesanan Hari Ini" />
                            <div className="flex flex-col gap-4">
                                <SummaryRow
                                    icon={Wallet}
                                    label="Nilai Pesanan"
                                    value={formatRupiah(pesananHariIni.nilaiPesanan)}
                                />
                                <SummaryRow
                                    icon={ReceiptText}
                                    label="Jumlah Pesanan"
                                    value={`${pesananHariIni.jumlahPesanan} Pesanan`}
                                />
                                <SummaryRow
                                    icon={SquareX}
                                    label="Pesanan Batal"
                                    value={`${pesananHariIni.pesananBatal} Pesanan`}
                                />
                                <SummaryRow
                                    icon={BanknoteArrowDown}
                                    label="Total Belum Bayar"
                                    value={formatRupiah(pesananHariIni.totalBelumBayar)}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Lihat Laporan */}
                    <section className="flex flex-col gap-4">
                        <SectionTitle title="Lihat Laporan" />
                        <div className="flex flex-col">
                            {menuItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className="group flex items-center gap-4 rounded-2xl p-2 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all duration-200 ease-in-out"
                                >
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500 text-white shrink-0 shadow-md group-hover:scale-110 transition-transform duration-200">
                                        <item.icon size={22} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                                            {item.title}
                                        </span>
                                        <span className="text-sm italic text-gray-500 leading-tight">
                                            {item.description}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

