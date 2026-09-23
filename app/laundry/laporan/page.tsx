import Link from "next/link";
import {
    Banknote,
    CircleDollarSign,
    Wallet,
    ReceiptText,
    SquareX,
    BanknoteArrowDown,
    Plus,
    Minus,
    type LucideIcon,
} from "lucide-react";
import { formatRupiah } from "@/app/lib/utils";
import {
    fetchLaporanPesananHariIni,
    fetchLaporanKas,
} from "@/app/lib/data/pesanan";
import LaporanKasMenuLink from "@/app/ui/kas/laporan-kas-menu-link";
import LaporanPesananMenuLink from "@/app/ui/laporan-pesanan/menu-link";
import AnalisaPelangganMenuLink from "@/app/ui/analisa-pelanggan/menu-link";
import AnalisaLayananMenuLink from "@/app/ui/analisa-layanan/menu-link";

// Laporan Kas & Laporan Pesanan sudah punya halaman: menu item-nya membuka
// popup Pilih Periode (`popup` menentukan komponen menu-link mana yang
// dirender). Analisa Pelanggan & Analisa Layanan juga sudah punya halaman
// dengan popup periode.
const menuItems = [
    {
        title: "Laporan Kas",
        description: "Laporan mutasi kas",
        popup: "kas" as const,
    },
    {
        title: "Laporan Pesanan",
        description: "Laporan data pesanan",
        popup: "pesanan" as const,
    },
    {
        title: "Analisa Pelanggan",
        description: "Analisa data pelanggan",
        popup: "pelanggan" as const,
    },
    {
        title: "Analisa Layanan",
        description: "Analisa data layanan",
        popup: "layanan" as const,
    },
];

/* Baris ringkasan untuk tampilan mobile portrait (divide-y, text-xs) */
function SummaryRow({
    icon: Icon,
    label,
    value,
    valueClassName = "font-medium text-gray-900",
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    valueClassName?: string;
}) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
                <Icon className="h-4 w-4 text-gray-400 shrink-0" /> {label}
            </span>
            <span className={valueClassName}>{value}</span>
        </div>
    );
}

/* Item ringkasan untuk tampilan landscape / desktop (grid label + value) */
function SummaryItem({
    label,
    value,
    valueClassName = "font-medium text-gray-900",
}: {
    label: string;
    value: string;
    valueClassName?: string;
}) {
    return (
        <div>
            <span className="text-xs text-gray-500 block">{label}</span>
            <span className={valueClassName}>{value}</span>
        </div>
    );
}

export default async function Page() {
    const pesananHariIni = await fetchLaporanPesananHariIni();

    const saldoKas = await fetchLaporanKas();
    const belumBayarClassName =
        pesananHariIni.totalBelumBayar > 0
            ? "font-medium text-red-600"
            : "font-medium text-gray-900";

    return (
        <div className="w-full pb-4 md:pb-10">
            {/* Header halaman: sticky gradient di mobile portrait, statis di landscape/desktop */}
            <div className="sticky top-0 z-10 md:static">
                <div className="header-gradient shadow-md pb-3 px-4 pt-6 -mx-4 rounded-b-xl md:bg-none md:shadow-none md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none short-screen:pb-2 short-screen:pt-3">
                    <h1 className="text-2xl text-white md:text-gray-900 short-screen:text-xl">
                        Laporan
                    </h1>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 1. MOBILE PORTRAIT VIEW (Tampilan mobile portrait)                        */}
            {/* ========================================================================= */}
            <div className="block md:hidden landscape:hidden">
                {/* 1.1 Fieldset Saldo Kas */}
                <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <legend className="px-2 text-sm font-semibold text-gray-700">
                        Saldo Kas
                    </legend>
                    <div className="divide-y divide-gray-100 text-xs text-gray-700">
                        <SummaryRow
                            icon={Banknote}
                            label="Saldo Tunai"
                            value={formatRupiah(saldoKas.tunai)}
                            valueClassName="font-semibold text-gray-900"
                        />
                        <SummaryRow
                            icon={CircleDollarSign}
                            label="Saldo Non-Tunai"
                            value={formatRupiah(saldoKas.nonTunai)}
                            valueClassName="font-semibold text-gray-900"
                        />
                    </div>
                    {/* Tombol aksi kas */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <Link
                            href="/laundry/laporan/kas/tambah"
                            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                        >
                            <Plus className="h-4 w-4 shrink-0" /> Penambahan Kas
                        </Link>
                        <Link
                            href="/laundry/laporan/kas/kurang"
                            className="flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                        >
                            <Minus className="h-4 w-4 shrink-0" /> Pengurangan Kas
                        </Link>
                    </div>
                </fieldset>

                {/* 1.2 Fieldset Pesanan Hari Ini */}
                <fieldset className="mt-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <legend className="px-2 text-sm font-semibold text-gray-700">
                        Pesanan Hari Ini
                    </legend>
                    <div className="divide-y divide-gray-100 text-xs text-gray-700">
                        <SummaryRow
                            icon={Wallet}
                            label="Nilai Pesanan"
                            value={formatRupiah(pesananHariIni.nilaiPesanan)}
                            valueClassName="font-semibold text-gray-900"
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
                            valueClassName={
                                pesananHariIni.pesananBatal > 0
                                    ? "font-medium text-red-600"
                                    : "font-medium text-gray-900"
                            }
                        />
                        <SummaryRow
                            icon={BanknoteArrowDown}
                            label="Total Belum Bayar"
                            value={formatRupiah(pesananHariIni.totalBelumBayar)}
                            valueClassName={belumBayarClassName}
                        />
                    </div>
                </fieldset>

                {/* 1.3 Fieldset Lihat Laporan */}
                <fieldset className="mt-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <legend className="px-2 text-sm font-semibold text-gray-700">
                        Lihat Laporan
                    </legend>
                    <div className="divide-y divide-gray-100">
                        {menuItems.map((item, index) =>
                            item.popup === "kas" ? (
                                <LaporanKasMenuLink
                                    key={index}
                                    title={item.title}
                                    description={item.description}
                                />
                            ) : item.popup === "pelanggan" ? (
                                <AnalisaPelangganMenuLink
                                    key={index}
                                    title={item.title}
                                    description={item.description}
                                />
                            ) : item.popup === "layanan" ? (
                                <AnalisaLayananMenuLink
                                    key={index}
                                    title={item.title}
                                    description={item.description}
                                />
                            ) : (
                                <LaporanPesananMenuLink
                                    key={index}
                                    title={item.title}
                                    description={item.description}
                                />
                            ),
                        )}
                    </div>
                </fieldset>
            </div>

            {/* ========================================================================= */}
            {/* 2. LANDSCAPE / DESKTOP VIEW (Tampilan landscape & desktop)                */}
            {/* ========================================================================= */}
            <div className="hidden md:grid landscape:grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-4 md:gap-6 short-screen:gap-3">
                <div className="landscape:col-span-12 md:col-span-12 space-y-4 md:space-y-6 short-screen:space-y-3">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 short-screen:gap-3">
                        {/* 2.1 Fieldset Saldo Kas */}
                        <fieldset className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 short-screen:p-3 shadow-sm">
                            <legend className="px-2 text-sm font-semibold text-gray-700">
                                Saldo Kas
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                                <SummaryItem
                                    label="Saldo Tunai"
                                    value={formatRupiah(saldoKas.tunai)}
                                    valueClassName="font-semibold text-gray-900"
                                />
                                <SummaryItem
                                    label="Saldo Non-Tunai"
                                    value={formatRupiah(saldoKas.nonTunai)}
                                    valueClassName="font-semibold text-gray-900"
                                />
                            </div>
                            {/* Tombol aksi kas */}
                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                                <Link
                                    href="/laundry/laporan/kas/tambah"
                                    className="flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                                >
                                    <Plus className="h-4 w-4 shrink-0" /> Penambahan Kas
                                </Link>
                                <Link
                                    href="/laundry/laporan/kas/kurang"
                                    className="flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                >
                                    <Minus className="h-4 w-4 shrink-0" /> Pengurangan Kas
                                </Link>
                            </div>
                        </fieldset>

                        {/* 2.2 Fieldset Pesanan Hari Ini */}
                        <fieldset className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 short-screen:p-3 shadow-sm">
                            <legend className="px-2 text-sm font-semibold text-gray-700">
                                Pesanan Hari Ini
                            </legend>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-700">
                                <SummaryItem
                                    label="Nilai Pesanan"
                                    value={formatRupiah(pesananHariIni.nilaiPesanan)}
                                    valueClassName="font-semibold text-gray-900"
                                />
                                <SummaryItem
                                    label="Jumlah Pesanan"
                                    value={`${pesananHariIni.jumlahPesanan} Pesanan`}
                                />
                                <SummaryItem
                                    label="Pesanan Batal"
                                    value={`${pesananHariIni.pesananBatal} Pesanan`}
                                    valueClassName={
                                        pesananHariIni.pesananBatal > 0
                                            ? "font-medium text-red-600"
                                            : "font-medium text-gray-900"
                                    }
                                />
                                <SummaryItem
                                    label="Total Belum Bayar"
                                    value={formatRupiah(pesananHariIni.totalBelumBayar)}
                                    valueClassName={belumBayarClassName}
                                />
                            </div>
                        </fieldset>
                    </div>

                    {/* 2.3 Fieldset Lihat Laporan */}
                    <fieldset className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 short-screen:p-3 shadow-sm">
                        <legend className="px-2 text-sm font-semibold text-gray-700">
                            Lihat Laporan
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
                            {menuItems.map((item, index) =>
                                item.popup === "kas" ? (
                                    <LaporanKasMenuLink
                                        key={index}
                                        title={item.title}
                                        description={item.description}
                                    />
                                ) : item.popup === "pelanggan" ? (
                                    <AnalisaPelangganMenuLink
                                        key={index}
                                        title={item.title}
                                        description={item.description}
                                    />
                                ) : item.popup === "layanan" ? (
                                    <AnalisaLayananMenuLink
                                        key={index}
                                        title={item.title}
                                        description={item.description}
                                    />
                                ) : (
                                    <LaporanPesananMenuLink
                                        key={index}
                                        title={item.title}
                                        description={item.description}
                                    />
                                ),
                            )}
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    );
}

