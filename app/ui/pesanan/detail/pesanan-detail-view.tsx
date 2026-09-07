"use client";

import { TabelPesanan, ItemPesanan } from "@/app/lib/definitions";
import { formatDateTimeToLocal, formatEstimasiJam, formatRupiah } from "@/app/lib/utils";
import {
  StatusPesananBadge,
  StatusPembayaranBadge,
} from "@/app/ui/pesanan/status";
import {
  PesananDetailActionButtons,
  CreateItemPesananButton,
} from "@/app/ui/pesanan/buttons";
import { getInitials } from "@/app/ui/pesanan/infinite-list";
import ItemPesananInfiniteList from "./item-pesanan-infinite-list";
import ItemPesananTable from "./item-pesanan-table";
import {
  UserIcon,
  PhoneIcon,
  TruckIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

export default function PesananDetailView({
  pesanan,
  initialItems,
  totalPages,
}: {
  pesanan: TabelPesanan;
  initialItems: ItemPesanan[];
  totalPages: number;
}) {
  const estimasi = formatEstimasiJam(pesanan.tgl_estimasi_selesai);

  return (
    <div className="w-full pb-10">
      {/* ========================================================================= */}
      {/* 1. MOBILE PORTRAIT VIEW (Tampilan mobile portrait)                        */}
      {/* ========================================================================= */}
      <div className="block md:hidden landscape:hidden">
        {/* 1.1 Header Sticky: Card ringkasan seperti item di infinite-list.tsx */}
        <div className="sticky top-0 z-20 -mx-4 header-gradient px-4 pt-1 pb-3 backdrop-blur-sm border-b border-gray-200">
          <div className="w-full rounded-lg bg-white p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-2 text-sm">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                  {getInitials(pesanan.nama_pelanggan)}
                </div>
                <div className="flex min-w-0 flex-col">
                  <p className="truncate text-base font-medium text-gray-900">
                    {pesanan.nama_pelanggan ?? "-"}
                  </p>
                  {pesanan.nomor_pesanan ? (
                    <p className="flex items-center gap-1 truncate text-gray-500 text-xs">
                      {pesanan.nomor_pesanan}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <StatusPesananBadge status={pesanan.status_pesanan} />
                <StatusPembayaranBadge status={pesanan.status_pembayaran} />
              </div>
            </div>
          </div>
        </div>

        {/* 1.2 Di bawah header sticky: Icon buttons WhatsApp, Print, Edit, Delete */}
        <div className="mt-4 flex items-center justify-center rounded-lg bg-white p-3 shadow-sm border border-gray-100">
          <div className="flex gap-2 btn-animate"><PesananDetailActionButtons pesanan={pesanan} /></div>
        </div>

        {/* 1.3 Fieldset Informasi Pesanan Tambahan */}
        <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <legend className="px-2 text-sm font-semibold text-gray-700">
            Informasi Pesanan
          </legend>
          <div className="divide-y divide-gray-100 text-xs text-gray-700">
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-1.5 text-gray-500">
                <CalendarIcon className="h-4 w-4 text-gray-400" /> Tanggal Masuk
              </span>
              <span className="font-medium text-gray-900">
                {formatDateTimeToLocal(pesanan.tgl_pesanan)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-1.5 text-gray-500">
                <ClockIcon className="h-4 w-4 text-gray-400" /> Tanggal Estimasi Selesai
              </span>
              <span
                className={
                  estimasi?.terlambat
                    ? "font-medium text-red-600"
                    : "font-medium text-gray-900"
                }
              >
                {pesanan.tgl_estimasi_selesai
                  ? formatDateTimeToLocal(pesanan.tgl_estimasi_selesai)
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-1.5 text-gray-500">
                <UserIcon className="h-4 w-4 text-gray-400" /> Kasir / Staf
              </span>
              <span className="font-medium text-gray-900">{pesanan.nama_user ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-1.5 text-gray-500">
                <PhoneIcon className="h-4 w-4 text-gray-400" /> No. WhatsApp / HP
              </span>
              <span className="font-medium text-gray-900">{pesanan.no_hp ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-1.5 text-gray-500">
                <TruckIcon className="h-4 w-4 text-gray-400" /> Antar Jemput
              </span>
              <span className="font-medium text-gray-900">
                {pesanan.antar_jemput_yt === "ya"
                  ? pesanan.nama_antar_jemput_snapshot || "Ya"
                  : "Tidak"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-1.5 text-gray-500">
                <ClockIcon className="h-4 w-4 text-gray-400" /> Tanggal Selesai
              </span>
              <span className="font-medium text-gray-900">
                {pesanan.tgl_selesai ? formatDateTimeToLocal(pesanan.tgl_selesai) : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-1.5 text-gray-500">
                <CalendarIcon className="h-4 w-4 text-gray-400" /> Tanggal Diambil
              </span>
              <span className="font-medium text-gray-900">
                {pesanan.tgl_diambil ? formatDateTimeToLocal(pesanan.tgl_diambil) : "-"}
              </span>
            </div>
          </div>

          {/* Rincian Biaya */}
          <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs">
            <div className="font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <BanknotesIcon className="h-4 w-4 text-primary-600" />
              <span>Rincian Pembayaran</span>
            </div>
            <div className="space-y-1.5 text-gray-600">
              <div className="flex justify-between">
                <span>Total Layanan:</span>
                <span>{formatRupiah(pesanan.total_layanan)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Antar Jemput:</span>
                <span>{formatRupiah(pesanan.biaya_antar_jemput)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Diskon:</span>
                <span>
                  {pesanan.nilai_diskon > 0 ? `- ${formatRupiah(pesanan.nilai_diskon)}` : "-"}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-1 flex justify-between font-semibold text-gray-900">
                <span>Total Tagihan:</span>
                <span>{formatRupiah(pesanan.total_bayar)}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Bayar:</span>
                <span className="capitalize">{pesanan.metode_pembayaran ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>Jumlah Bayar:</span>
                <span className="font-medium text-green-700">
                  {formatRupiah(pesanan.jumlah_bayar)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kurang Bayar:</span>
                <span
                  className={pesanan.kurang_bayar > 0 ? "font-semibold text-red-600" : "text-gray-700"}
                >
                  {formatRupiah(pesanan.kurang_bayar)}
                </span>
              </div>
            </div>
          </div>

          {/* Catatan */}
          {pesanan.catatan ? (
            <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900">
              <DocumentTextIcon className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-medium">Catatan:</span> {pesanan.catatan}
              </div>
            </div>
          ) : null}
        </fieldset>

        {/* 1.4 Fieldset Item Pesanan */}
        <fieldset className="mt-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <legend className="px-2 text-sm font-semibold text-gray-700">
            Item Pesanan
          </legend>
          {/* 1.5 Tombol Tambah Item Pesanan di paling atas */}
          <div className="mb-3 flex justify-end">
            <CreateItemPesananButton pesananId={pesanan.id} />
          </div>
          {/* 1.6 Infinite-list Item Pesanan */}
          <ItemPesananInfiniteList
            pesananId={pesanan.id}
            initialItems={initialItems}
            totalPages={totalPages}
          />
        </fieldset>
      </div>

      {/* ========================================================================= */}
      {/* 2. LANDSCAPE / DESKTOP VIEW (Tampilan landscape & desktop)                */}
      {/* ========================================================================= */}
      <div className="hidden md:grid landscape:grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-4 md:gap-6 short-screen:gap-3">
        {/* 2.2 Kolom Utama (full width, Ringkasan Pesanan digabung ke sini) */}
        <div className="landscape:col-span-12 md:col-span-12 space-y-4 md:space-y-6 short-screen:space-y-3">
          {/* 2.3 Fieldset Informasi Pesanan (gabungan Ringkasan + Informasi Tambahan) */}
          <fieldset className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 short-screen:p-3 shadow-sm">
            <legend className="px-2 text-sm font-semibold text-gray-700">
              Informasi Pesanan
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
              {/* No. Pesanan */}
              <div>
                <span className="text-xs text-gray-500 block">No. Pesanan</span>
                <span className="font-semibold text-primary-700">
                  {pesanan.nomor_pesanan ?? "-"}
                </span>
              </div>

              {/* Pelanggan */}
              <div>
                <span className="text-xs text-gray-500 block">Pelanggan</span>
                <span className="font-medium text-gray-900">
                  {pesanan.nama_pelanggan ?? "-"}
                </span>
              </div>

              {/* Tanggal Masuk */}
              <div>
                <span className="text-xs text-gray-500 block">Tanggal Masuk</span>
                <span className="font-medium text-gray-900">
                  {formatDateTimeToLocal(pesanan.tgl_pesanan)}
                </span>
              </div>

              {/* Estimasi Selesai */}
              <div>
                <span className="text-xs text-gray-500 block">Estimasi Selesai</span>
                <span
                  className={
                    estimasi?.terlambat
                      ? "font-medium text-red-600"
                      : "font-medium text-gray-900"
                  }
                >
                  {pesanan.tgl_estimasi_selesai
                    ? formatDateTimeToLocal(pesanan.tgl_estimasi_selesai)
                    : "-"}
                </span>
              </div>

              {/* Status Pesanan */}
              <div>
                <span className="text-xs text-gray-500 block">Status Pesanan</span>
                <StatusPesananBadge status={pesanan.status_pesanan} />
              </div>

              {/* Status Bayar */}
              <div>
                <span className="text-xs text-gray-500 block">Status Bayar</span>
                <StatusPembayaranBadge status={pesanan.status_pembayaran} />
              </div>

              {/* Kasir / Dibuat Oleh */}
              <div>
                <span className="text-xs text-gray-500 block">Kasir / Dibuat Oleh</span>
                <span className="font-medium text-gray-900">{pesanan.nama_user ?? "-"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">No. WhatsApp Pelanggan</span>
                <span className="font-medium text-gray-900">{pesanan.no_hp ?? "-"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Layanan Antar Jemput</span>
                <span className="font-medium text-gray-900">
                  {pesanan.antar_jemput_yt === "ya"
                    ? pesanan.nama_antar_jemput_snapshot || "Ya"
                    : "Tidak"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Tanggal Selesai</span>
                <span className="font-medium text-gray-900">
                  {pesanan.tgl_selesai ? formatDateTimeToLocal(pesanan.tgl_selesai) : "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Tanggal Diambil</span>
                <span className="font-medium text-gray-900">
                  {pesanan.tgl_diambil ? formatDateTimeToLocal(pesanan.tgl_diambil) : "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Toko / Outlet</span>
                <span className="font-medium text-gray-900">{pesanan.nama_toko ?? "-"}</span>
              </div>
            </div>

            {/* Rincian Finansial */}
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Rincian Finansial & Pembayaran
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Total Layanan:</span>
                  <span className="font-medium text-gray-800">
                    {formatRupiah(pesanan.total_layanan)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Biaya Antar Jemput:</span>
                  <span className="font-medium text-gray-800">
                    {formatRupiah(pesanan.biaya_antar_jemput)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Diskon:</span>
                  <span className="font-medium text-red-600">
                    - {formatRupiah(pesanan.nilai_diskon)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Total Tagihan:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatRupiah(pesanan.total_bayar)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Metode Bayar:</span>
                  <span className="font-medium text-gray-800 capitalize">
                    {pesanan.metode_pembayaran ?? "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Jumlah Dibayar:</span>
                  <span className="font-semibold text-green-700">
                    {formatRupiah(pesanan.jumlah_bayar)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Kurang Bayar:</span>
                  <span
                    className={pesanan.kurang_bayar > 0 ? "font-semibold text-red-600" : "font-medium text-gray-800"}
                  >
                    {formatRupiah(pesanan.kurang_bayar)}
                  </span>
                </div>
                
              </div>
            </div>

            {/* Catatan jika ada */}
            {pesanan.catatan ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                <span className="font-medium">Catatan Pesanan:</span> {pesanan.catatan}
              </div>
            ) : null}

            {/* Action Buttons: WhatsApp, Print, Edit, Delete di paling bawah */}
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="text-xs text-gray-500 mb-2">Aksi Cepat</div>
              <div className="flex justify-start">
                <PesananDetailActionButtons pesanan={pesanan} />
              </div>
            </div>
          </fieldset>

          {/* 2.4 Fieldset Item Pesanan */}
          <fieldset className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <legend className="px-2 text-sm font-semibold text-gray-700">
              Item Pesanan
            </legend>
            {/* 2.5 Tombol Tambah Item Pesanan di paling atas */}
            <div className="mb-4 flex justify-end">
              <CreateItemPesananButton pesananId={pesanan.id} />
            </div>
            {/* 2.6 Table untuk menampilkan item pesanan */}
            <ItemPesananTable pesananId={pesanan.id} initialItems={initialItems} />
          </fieldset>
        </div>
      </div>
    </div>
  );
}
