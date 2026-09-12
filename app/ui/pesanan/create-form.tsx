"use client";
import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import {
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  ScaleIcon,
  ShoppingBagIcon,
  SparklesIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { createPesanan, State } from "@/app/lib/actions";
import { formatRupiah } from "@/app/lib/utils";
import SelectPelanggan, {
  type OpsiPelanggan,
} from "@/app/ui/pesanan/select-pelanggan";
import SelectPopup from "@/app/ui/shared/select-popup";

type OpsiLayanan = {
  id: string;
  nama_layanan: string;
  harga: number;
  nama_tipe: string;
  nama_durasi: string | null;
  lama_durasi?: number | null;
};
type OpsiParfum = { id: string; nama_parfum: string };
type OpsiDiskon = {
  id: string;
  nama_diskon: string;
  tipe_diskon: string;
  nilai_diskon: number;
};
type OpsiAntarJemput = {
  id: string;
  nama_antar_jemput: string;
  harga_antar_jemput: number;
};

type ItemRow = {
  key: number;
  layanan_id: string;
  jumlah: string;
  parfum_id: string;
  diskon_id: string;
};

// Satuan ditentukan otomatis dari tipe layanan:
// kiloan -> kg, satuan -> pcs, meteran -> m
function satuanDariTipe(namaTipe: string | null | undefined): string {
  const tipe = (namaTipe ?? "").toLowerCase();
  if (tipe.includes("kiloan")) return "kg";
  if (tipe.includes("satuan")) return "pcs";
  if (tipe.includes("meteran")) return "m";
  return "kg";
}

const inputClass =
  "peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500";

function ErrorText({ errors }: { errors?: string[] }) {
  if (!errors) return null;
  return (
    <>
      {errors.map((error) => (
        <p className="mt-2 text-sm text-red-500" key={error}>
          {error}
        </p>
      ))}
    </>
  );
}

export default function Form({
  optionsPelanggan,
  optionsLayanan,
  optionsParfum,
  optionsDiskon,
  optionsAntarJemput,
}: {
  optionsPelanggan: OpsiPelanggan[];
  optionsLayanan: OpsiLayanan[];
  optionsParfum: OpsiParfum[];
  optionsDiskon: OpsiDiskon[];
  optionsAntarJemput: OpsiAntarJemput[];
}) {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(createPesanan, initialState);

  const [items, setItems] = useState<ItemRow[]>([
    { key: 0, layanan_id: "", jumlah: "1", parfum_id: "", diskon_id: "" },
  ]);
  const nextKey = useRef(1);

  const [antarJemputYt, setAntarJemputYt] = useState("tidak");
  const [antarJemputId, setAntarJemputId] = useState("");
  const [jumlahBayar, setJumlahBayar] = useState("0");

  const layananMap = useMemo(
    () => new Map(optionsLayanan.map((layanan) => [layanan.id, layanan])),
    [optionsLayanan],
  );

  const diskonMap = useMemo(
    () => new Map(optionsDiskon.map((diskon) => [diskon.id, diskon])),
    [optionsDiskon],
  );

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        key: nextKey.current++,
        layanan_id: "",
        jumlah: "1",
        parfum_id: "",
        diskon_id: "",
      },
    ]);
  }

  function removeItem(key: number) {
    setItems((prev) =>
      prev.length > 1 ? prev.filter((item) => item.key !== key) : prev,
    );
  }

  function updateItem(
    key: number,
    field: keyof Omit<ItemRow, "key">,
    value: string,
  ) {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)),
    );
  }

  // Perhitungan diskon per item:
  // - Persentase: (diskon.nilai_diskon / 100) * subtotal item
  // - Nominal: diskon.nilai_diskon langsung dipakai
  // Nilai diskon per item dibatasi maksimal subtotal item agar subtotal_final tidak negatif.
  function hitungItem(item: ItemRow) {
    const layanan = layananMap.get(item.layanan_id);
    const jumlah = Number(item.jumlah) || 0;
    const subtotal = layanan ? Number(layanan.harga) * jumlah : 0;
    const diskon = item.diskon_id ? diskonMap.get(item.diskon_id) : undefined;
    const nilaiDiskon = diskon
      ? Math.min(
          Math.max(
            0,
            diskon.tipe_diskon === "Persentase"
              ? Math.round((Number(diskon.nilai_diskon) / 100) * subtotal)
              : Number(diskon.nilai_diskon),
          ),
          subtotal,
        )
      : 0;
    const subtotalFinal = Math.max(0, subtotal - nilaiDiskon);
    return { subtotal, nilaiDiskon, subtotalFinal };
  }

  // Ringkasan biaya (estimasi di sisi klien; perhitungan final di server action)
  const itemHitung = items.map(hitungItem);
  const totalLayanan = itemHitung.reduce((sum, item) => sum + item.subtotal, 0);
  const totalDiskon = itemHitung.reduce((sum, item) => sum + item.nilaiDiskon, 0);

  const biayaAntarJemput =
    antarJemputYt === "ya"
      ? Number(
          optionsAntarJemput.find((a) => a.id === antarJemputId)
            ?.harga_antar_jemput ?? 0,
        )
      : 0;

  const totalTagihan = Math.max(0, totalLayanan + biayaAntarJemput - totalDiskon);
  // Kurang Bayar = Total Tagihan - Jumlah Bayar (tidak pernah negatif)
  const kurangBayar = Math.max(0, totalTagihan - (Number(jumlahBayar) || 0));

  // Item pesanan dikirim sebagai JSON lewat hidden input
  // Satuan diambil dari tipe layanan yang dipilih per item
  const itemsPayload = JSON.stringify(
    items.map((item) => ({
      layanan_id: item.layanan_id,
      jumlah: Number(item.jumlah) || 0,
      satuan: satuanDariTipe(layananMap.get(item.layanan_id)?.nama_tipe),
      parfum_id: item.parfum_id || undefined,
      diskon_id: item.diskon_id || undefined,
    })),
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="items" value={itemsPayload} />
      <input type="hidden" name="antar_jemput_id" value={antarJemputId} />
      {/* jumlah_bayar dikirim sebagai angka polos (tanpa format) untuk server action */}
      <input type="hidden" name="jumlah_bayar" value={jumlahBayar || "0"} />

      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Pelanggan */}
        <div className="mb-4">
          <label htmlFor="pelanggan_id" className="mb-2 block text-sm font-medium">
            Pelanggan
          </label>
          <SelectPelanggan id="pelanggan_id" options={optionsPelanggan} />
          <div id="pelanggan_id-error" aria-live="polite" aria-atomic="true">
            <ErrorText errors={state.errors?.pelanggan_id} />
          </div>
        </div>

        {/* Item Layanan */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Item Layanan</label>
          <div className="space-y-3">
            {items.map((item, index) => {
              const layanan = layananMap.get(item.layanan_id);
              const jumlah = Number(item.jumlah) || 0;
              const { subtotal, nilaiDiskon, subtotalFinal } = hitungItem(item);
              return (
                <div
                  key={item.key}
                  className="rounded-md border border-gray-200 bg-white p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      Item {index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        title="Hapus Item"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <span className="sr-only">Hapus Item</span>
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Layanan */}
                    <div className="sm:col-span-2">
                      <SelectPopup
                        value={item.layanan_id}
                        onChange={(newValue) =>
                          updateItem(item.key, "layanan_id", newValue)
                        }
                        placeholder="Pilih Layanan"
                        dialogTitle="Pilih Layanan"
                        searchPlaceholder="Cari layanan..."
                        emptyMessage="Layanan tidak ditemukan"
                        resultLabel="layanan ditemukan"
                        icon={ShoppingBagIcon}
                        ariaLabel={`Layanan item ${index + 1}`}
                        options={optionsLayanan.map((option) => ({
                          id: option.id,
                          label: option.nama_layanan,
                          description: `${formatRupiah(Number(option.harga))}${
                            option.nama_tipe ? ` (${option.nama_tipe})` : ""
                          }`,
                        }))}
                      />
                    </div>

                    {/* Jumlah (satuan otomatis dari tipe layanan) */}
                    <div className="relative sm:col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.jumlah}
                        onChange={(e) => updateItem(item.key, "jumlah", e.target.value)}
                        placeholder="Jumlah"
                        className={`${inputClass} pr-14`}
                        aria-label={`Jumlah item ${index + 1}`}
                      />
                      <ScaleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                      <span
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500"
                        aria-label={`Satuan item ${index + 1}`}
                      >
                        {satuanDariTipe(layanan?.nama_tipe)}
                      </span>
                    </div>

                    {/* Parfum */}
                    <div className="sm:col-span-2">
                      <SelectPopup
                        value={item.parfum_id}
                        onChange={(newValue) =>
                          updateItem(item.key, "parfum_id", newValue)
                        }
                        placeholder="Tanpa Parfum"
                        dialogTitle="Pilih Parfum"
                        searchPlaceholder="Cari parfum..."
                        emptyMessage="Parfum tidak ditemukan"
                        resultLabel="parfum ditemukan"
                        icon={SparklesIcon}
                        ariaLabel={`Parfum item ${index + 1}`}
                        options={optionsParfum.map((option) => ({
                          id: option.id,
                          label: option.nama_parfum,
                        }))}
                      />
                    </div>

                    {/* Diskon */}
                    <div className="sm:col-span-2">
                      <SelectPopup
                        value={item.diskon_id}
                        onChange={(newValue) =>
                          updateItem(item.key, "diskon_id", newValue)
                        }
                        placeholder="Tanpa Diskon"
                        dialogTitle="Pilih Diskon"
                        searchPlaceholder="Cari diskon..."
                        emptyMessage="Diskon tidak ditemukan"
                        resultLabel="diskon ditemukan"
                        icon={TagIcon}
                        ariaLabel={`Diskon item ${index + 1}`}
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

                  {layanan && (
                    <div className="mt-2 text-right text-xs text-gray-500">
                      <p>
                        {formatRupiah(Number(layanan.harga))} × {jumlah}{" "}
                        {satuanDariTipe(layanan.nama_tipe)} ={" "}
                        <span className="font-medium text-gray-900">
                          {formatRupiah(subtotal)}
                        </span>
                      </p>
                      {nilaiDiskon > 0 && (
                        <>
                          <p>
                            Diskon: <span className="text-red-500">-{formatRupiah(nilaiDiskon)}</span>
                          </p>
                          <p>
                            Subtotal Final:{" "}
                            <span className="font-medium text-gray-900">
                              {formatRupiah(subtotalFinal)}
                            </span>
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-3 inline-flex touch-manipulation items-center gap-1.5 rounded-lg border border-dashed border-primary-600 px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
          >
            <PlusIcon className="h-4 w-4" />
            Tambah Item
          </button>

          <div id="items-error" aria-live="polite" aria-atomic="true">
            <ErrorText errors={state.errors?.items} />
          </div>
        </div>

        {/* Antar Jemput */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Antar Jemput</label>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="antar-ya"
                  name="antar_jemput_yt"
                  type="radio"
                  value="ya"
                  checked={antarJemputYt === "ya"}
                  onChange={() => setAntarJemputYt("ya")}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="antar-ya"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Ya <TruckIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="antar-tidak"
                  name="antar_jemput_yt"
                  type="radio"
                  value="tidak"
                  checked={antarJemputYt === "tidak"}
                  onChange={() => {
                    setAntarJemputYt("tidak");
                    setAntarJemputId("");
                  }}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="antar-tidak"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Tidak <TruckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>

          {antarJemputYt === "ya" && (
            <div className="mt-3">
              <SelectPopup
                value={antarJemputId}
                onChange={setAntarJemputId}
                placeholder="Pilih Layanan Antar Jemput"
                dialogTitle="Pilih Layanan Antar Jemput"
                searchPlaceholder="Cari layanan antar jemput..."
                emptyMessage="Layanan antar jemput tidak ditemukan"
                resultLabel="layanan antar jemput ditemukan"
                icon={TruckIcon}
                options={optionsAntarJemput.map((option) => ({
                  id: option.id,
                  label: option.nama_antar_jemput,
                  description: formatRupiah(Number(option.harga_antar_jemput)),
                }))}
              />
            </div>
          )}

          <div id="antar_jemput_id-error" aria-live="polite" aria-atomic="true">
            <ErrorText errors={state.errors?.antar_jemput_id} />
          </div>
        </div>

        {/* Ringkasan Pembayaran */}
        <div className="mb-4 rounded-md border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-900">
            Ringkasan Pembayaran
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Total Layanan</dt>
              <dd className="font-medium text-gray-900">{formatRupiah(totalLayanan)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Biaya Antar Jemput</dt>
              <dd className="font-medium text-gray-900">{formatRupiah(biayaAntarJemput)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Diskon</dt>
              <dd className="font-medium text-gray-900">-{formatRupiah(totalDiskon)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-2">
              <dt className="font-medium text-gray-900">Total Tagihan</dt>
              <dd className="font-semibold text-primary-600">{formatRupiah(totalTagihan)}</dd>
            </div>
          </dl>
        </div>

        {/* Metode Pembayaran */}
        <div className="mb-4">
          <label htmlFor="metode_pembayaran" className="mb-2 block text-sm font-medium">
            Metode Pembayaran
          </label>
          <div>
            <SelectPopup
              id="metode_pembayaran"
              name="metode_pembayaran"
              placeholder="Pilih Metode Pembayaran"
              dialogTitle="Pilih Metode Pembayaran"
              searchPlaceholder="Cari metode pembayaran..."
              emptyMessage="Metode pembayaran tidak ditemukan"
              resultLabel="metode pembayaran ditemukan"
              icon={BanknotesIcon}
              options={[
                { id: "tunai", label: "Tunai" },
                { id: "non_tunai", label: "Non Tunai" },
              ]}
            />
          </div>
          <div id="metode_pembayaran-error" aria-live="polite" aria-atomic="true">
            <ErrorText errors={state.errors?.metode_pembayaran} />
          </div>
        </div>

        {/* Jumlah Bayar (format rupiah) */}
        <div className="mb-4">
          <label htmlFor="jumlah_bayar" className="mb-2 block text-sm font-medium">
            Jumlah Bayar
          </label>
          <div className="relative">
            <input
              id="jumlah_bayar"
              type="text"
              inputMode="numeric"
              value={jumlahBayar === "" ? "" : formatRupiah(Number(jumlahBayar))}
              onChange={(e) =>
                setJumlahBayar(e.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder="Masukkan jumlah bayar"
              className={`${inputClass} pr-14`}
              aria-describedby="jumlah_bayar-error"
            />
            <BanknotesIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="jumlah_bayar-error" aria-live="polite" aria-atomic="true">
            <ErrorText errors={state.errors?.jumlah_bayar} />
          </div>
          {/* Kurang Bayar = Total Tagihan - Jumlah Bayar */}
          <div className="mt-3 flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm">
            <span className="text-gray-500">Kurang Bayar</span>
            <span className="font-semibold text-gray-900">{formatRupiah(kurangBayar)}</span>
          </div>
        </div>

        {/* Catatan */}
        <div className="mb-4">
          <label htmlFor="catatan" className="mb-2 block text-sm font-medium">
            Catatan (Opsional)
          </label>
          <div className="relative">
            <textarea
              id="catatan"
              name="catatan"
              rows={3}
              placeholder="Masukkan catatan"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
            <ChatBubbleLeftRightIcon className="pointer-events-none absolute left-3 top-3 h-[18px] w-[18px] text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/laundry/pesanan"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Batal
        </Link>
        <Button type="submit">Tambah Pesanan</Button>
      </div>

      {/* General Form Message */}
      <div className="mt-4 text-center">
        {state.message && <p className="text-sm text-red-500">{state.message}</p>}
      </div>
    </form>
  );
}
