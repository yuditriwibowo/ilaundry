"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ScaleIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import SelectPopup from "@/app/ui/shared/select-popup";
import { createItemPesanan, updateItemPesanan, State } from "@/app/lib/actions";
import { formatRupiah } from "@/app/lib/utils";
import type { ItemPesanan, TabelPesanan } from "@/app/lib/definitions";
import { StatusItemBadge } from "@/app/ui/pesanan/detail/status-item";
import {
  ErrorText,
  cariLayananId,
  cariParfumId,
  hitungItem,
  inputClass,
  satuanDariTipe,
  type OpsiDiskon,
  type OpsiLayanan,
  type OpsiParfum,
} from "@/app/ui/pesanan/pesanan-form-shared";

/**
 * Form SATU item pesanan di halaman detail pesanan.
 * - Tanpa prop `item`  -> mode tambah (server action createItemPesanan)
 * - Dengan prop `item` -> mode ubah  (server action updateItemPesanan)
 * Nilai layanan/parfum/diskon dikirim lewat hidden input (pola sama dengan
 * create-form), satuan dihitung otomatis dari tipe layanan yang dipilih.
 * Perhitungan di sini hanya pratinjau — perhitungan final sekaligus hitung
 * ulang total pesanan dilakukan di server action.
 */
export default function ItemPesananForm({
  pesanan,
  item,
  optionsLayanan,
  optionsParfum,
  optionsDiskon,
}: {
  pesanan: TabelPesanan;
  // Diisi saat mengubah item yang sudah ada (mode edit).
  item?: ItemPesanan;
  optionsLayanan: OpsiLayanan[];
  optionsParfum: OpsiParfum[];
  optionsDiskon: OpsiDiskon[];
}) {
  const isEdit = Boolean(item);

  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(
    item
      ? updateItemPesanan.bind(null, pesanan.id, item.id)
      : createItemPesanan.bind(null, pesanan.id),
    initialState,
  );

  // Nilai awal dari snapshot item (mode edit) atau kosong (mode tambah).
  // Snapshot hanya menyimpan nama, sehingga layanan/parfum dipetakan kembali
  // ke id opsi saat ini lewat cariLayananId/cariParfumId.
  const [layananId, setLayananId] = useState(() =>
    item ? cariLayananId(item, optionsLayanan) : "",
  );
  const [jumlah, setJumlah] = useState(() =>
    item ? String(item.jumlah) : "1",
  );
  const [parfumId, setParfumId] = useState(() =>
    item ? cariParfumId(item, optionsParfum) : "",
  );
  const [diskonId, setDiskonId] = useState(() => item?.diskon_id ?? "");

  const layananMap = useMemo(
    () => new Map(optionsLayanan.map((layanan) => [layanan.id, layanan])),
    [optionsLayanan],
  );

  const diskonMap = useMemo(
    () => new Map(optionsDiskon.map((diskon) => [diskon.id, diskon])),
    [optionsDiskon],
  );

  const layanan = layananMap.get(layananId);
  const satuan = satuanDariTipe(layanan?.nama_tipe);
  // Lama durasi layanan terpilih (jam). Timestamp estimasi selesai yang
  // sebenarnya dihitung di server action saat item disimpan.
  const lamaDurasi =
    layanan?.lama_durasi != null ? Number(layanan.lama_durasi) : null;

  const { subtotal, nilaiDiskon, subtotalFinal } = hitungItem(
    { layanan_id: layananId, jumlah, diskon_id: diskonId },
    layananMap,
    diskonMap,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="layanan_id" value={layananId} />
      <input type="hidden" name="parfum_id" value={parfumId} />
      <input type="hidden" name="diskon_id" value={diskonId} />
      <input type="hidden" name="satuan" value={satuan} />

      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Konteks pesanan agar tidak salah menambah item */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
          <span className="text-gray-500">
            Pesanan{" "}
            <span className="font-medium text-gray-900">
              {pesanan.nomor_pesanan ?? "-"}
            </span>
          </span>
          <span className="text-gray-500">
            Pelanggan{" "}
            <span className="font-medium text-gray-900">
              {pesanan.nama_pelanggan ?? "-"}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Kolom kiri: Layanan & Jumlah */}
          <div>
            {/* Layanan */}
            <div className="mb-4">
              <label
                htmlFor="layanan_id"
                className="mb-2 block text-sm font-medium"
              >
                Layanan
              </label>
              <SelectPopup
                id="layanan_id"
                value={layananId}
                onChangeAction={setLayananId}
                placeholder="Pilih Layanan"
                dialogTitle="Pilih Layanan"
                searchPlaceholder="Cari layanan..."
                emptyMessage="Layanan tidak ditemukan"
                resultLabel="layanan ditemukan"
                icon={ShoppingBagIcon}
                ariaLabel="Layanan item pesanan"
                options={optionsLayanan.map((option) => ({
                  id: option.id,
                  label: option.nama_layanan,
                  description: `${formatRupiah(Number(option.harga))}${
                    option.nama_tipe ? ` (${option.nama_tipe})` : ""
                  }`,
                }))}
              />
              <div id="layanan_id-error" aria-live="polite" aria-atomic="true">
                <ErrorText errors={state.errors?.layanan_id} />
              </div>
            </div>

            {/* Jumlah (satuan otomatis dari tipe layanan) */}
            <div className="mb-4">
              <label htmlFor="jumlah" className="mb-2 block text-sm font-medium">
                Jumlah
              </label>
              <div className="relative">
                <input
                  id="jumlah"
                  name="jumlah"
                  type="number"
                  min="0"
                  step="any"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  placeholder="Jumlah"
                  className={`${inputClass} pr-14`}
                  aria-describedby="jumlah-error"
                />
                <ScaleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                <span
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500"
                  aria-label="Satuan item"
                >
                  {satuan}
                </span>
              </div>
              <div id="jumlah-error" aria-live="polite" aria-atomic="true">
                <ErrorText errors={state.errors?.jumlah ?? state.errors?.satuan} />
              </div>
            </div>

            {/* Parfum */}
            <div className="mb-4">
              <label
                htmlFor="parfum_id"
                className="mb-2 block text-sm font-medium"
              >
                Parfum (Opsional)
              </label>
              <SelectPopup
                id="parfum_id"
                value={parfumId}
                onChangeAction={setParfumId}
                placeholder="Tanpa Parfum"
                dialogTitle="Pilih Parfum"
                searchPlaceholder="Cari parfum..."
                emptyMessage="Parfum tidak ditemukan"
                resultLabel="parfum ditemukan"
                icon={SparklesIcon}
                ariaLabel="Parfum item pesanan"
                options={optionsParfum.map((option) => ({
                  id: option.id,
                  label: option.nama_parfum,
                }))}
              />
            </div>

            {/* Diskon */}
            <div className="mb-4">
              <label
                htmlFor="diskon_id"
                className="mb-2 block text-sm font-medium"
              >
                Diskon (Opsional)
              </label>
              <SelectPopup
                id="diskon_id"
                value={diskonId}
                onChangeAction={setDiskonId}
                placeholder="Tanpa Diskon"
                dialogTitle="Pilih Diskon"
                searchPlaceholder="Cari diskon..."
                emptyMessage="Diskon tidak ditemukan"
                resultLabel="diskon ditemukan"
                icon={TagIcon}
                ariaLabel="Diskon item pesanan"
                options={optionsDiskon.map((option) => ({
                  id: option.id,
                  label: option.nama_diskon,
                  description:
                    option.tipe_diskon === "Persentase"
                      ? `${option.nilai_diskon}%`
                      : formatRupiah(Number(option.nilai_diskon)),
                }))}
              />
            </div>
          </div>

          {/* Kolom kanan: Ringkasan & Catatan Item */}
          <div>
            {/* Ringkasan Item */}
            <div className="mb-4 rounded-md border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-medium text-gray-900">
                Ringkasan Item
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Harga Satuan</dt>
                  <dd className="font-medium text-gray-900">
                    {formatRupiah(Number(layanan?.harga ?? 0))}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Jumlah</dt>
                  <dd className="font-medium text-gray-900">
                    {Number(jumlah) || 0} {satuan}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Subtotal</dt>
                  <dd className="font-medium text-gray-900">
                    {formatRupiah(subtotal)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Diskon</dt>
                  <dd className="font-medium text-gray-900">
                    -{formatRupiah(nilaiDiskon)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                  <dt className="font-medium text-gray-900">Subtotal Final</dt>
                  <dd className="font-semibold text-primary-600">
                    {formatRupiah(subtotalFinal)}
                  </dd>
                </div>
                {lamaDurasi != null && (
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-gray-500">
                      <ClockIcon className="h-4 w-4" />
                      Lama Durasi
                    </dt>
                    <dd className="font-medium text-gray-900">
                      {lamaDurasi} jam
                    </dd>
                  </div>
                )}
              </dl>
              <p className="mt-3 text-xs text-gray-500">
                Total pesanan akan dihitung ulang otomatis setelah item ini
                disimpan.
              </p>
            </div>

            {/* Catatan Item */}
            <div className="mb-4">
              <label
                htmlFor="catatan_item"
                className="mb-2 block text-sm font-medium"
              >
                Catatan Item (Opsional)
              </label>
              <div className="relative">
                <textarea
                  id="catatan_item"
                  name="catatan_item"
                  rows={3}
                  defaultValue={item?.catatan_item ?? ""}
                  placeholder="Mis. baju putih dipisah"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                />
                <ChatBubbleLeftRightIcon className="pointer-events-none absolute left-3 top-3 h-[18px] w-[18px] text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href={`/laundry/pesanan/${pesanan.id}/detail`}
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Batal
        </Link>
        <Button type="submit">
          {isEdit ? "Simpan Perubahan" : "Tambah Item"}
        </Button>
      </div>

      {/* General Form Message */}
      <div className="mt-4 text-center">
        {state.message && <p className="text-sm text-red-500">{state.message}</p>}
      </div>
    </form>
  );
}