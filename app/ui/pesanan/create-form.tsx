"use client";
import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import {
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  CubeIcon,
  ScaleIcon,
  ShoppingBagIcon,
  SparklesIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  TruckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { createPesanan, State } from "@/app/lib/actions";
import { formatRupiah } from "@/app/lib/utils";

type OpsiPelanggan = { id: string; nama: string; no_hp: string };
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
  satuan: string;
  parfum_id: string;
};

const selectClass =
  "peer block w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm outline-2 placeholder:text-gray-500";
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
    { key: 0, layanan_id: "", jumlah: "1", satuan: "kg", parfum_id: "" },
  ]);
  const nextKey = useRef(1);

  const [antarJemputYt, setAntarJemputYt] = useState("tidak");
  const [antarJemputId, setAntarJemputId] = useState("");
  const [diskonId, setDiskonId] = useState("");
  const [jumlahBayar, setJumlahBayar] = useState("0");

  const layananMap = useMemo(
    () => new Map(optionsLayanan.map((layanan) => [layanan.id, layanan])),
    [optionsLayanan],
  );

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        key: nextKey.current++,
        layanan_id: "",
        jumlah: "1",
        satuan: "kg",
        parfum_id: "",
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

  // Ringkasan biaya (estimasi di sisi klien; perhitungan final di server action)
  const totalLayanan = items.reduce((sum, item) => {
    const layanan = layananMap.get(item.layanan_id);
    const jumlah = Number(item.jumlah) || 0;
    return sum + (layanan ? Number(layanan.harga) * jumlah : 0);
  }, 0);

  const biayaAntarJemput =
    antarJemputYt === "ya"
      ? Number(
          optionsAntarJemput.find((a) => a.id === antarJemputId)
            ?.harga_antar_jemput ?? 0,
        )
      : 0;

  const selectedDiskon = optionsDiskon.find((d) => d.id === diskonId);
  const nilaiDiskon = selectedDiskon
    ? Math.min(
        selectedDiskon.tipe_diskon === "Persentase"
          ? Math.round((Number(selectedDiskon.nilai_diskon) / 100) * totalLayanan)
          : Number(selectedDiskon.nilai_diskon),
        totalLayanan + biayaAntarJemput,
      )
    : 0;

  const totalBayar = Math.max(0, totalLayanan + biayaAntarJemput - nilaiDiskon);
  const kurangBayar = Math.max(0, totalBayar - (Number(jumlahBayar) || 0));

  // Item pesanan dikirim sebagai JSON lewat hidden input
  const itemsPayload = JSON.stringify(
    items.map((item) => ({
      layanan_id: item.layanan_id,
      jumlah: Number(item.jumlah) || 0,
      satuan: item.satuan,
      parfum_id: item.parfum_id || undefined,
    })),
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="items" value={itemsPayload} />
      <input type="hidden" name="antar_jemput_id" value={antarJemputId} />

      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Pelanggan */}
        <div className="mb-4">
          <label htmlFor="pelanggan_id" className="mb-2 block text-sm font-medium">
            Pelanggan
          </label>
          <div className="relative">
            <select
              id="pelanggan_id"
              name="pelanggan_id"
              defaultValue=""
              className={selectClass}
              aria-describedby="pelanggan_id-error"
            >
              <option value="">Pilih Pelanggan</option>
              {optionsPelanggan.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.nama}
                  {option.no_hp ? ` - ${option.no_hp}` : ""}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
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
                    <div className="relative sm:col-span-2">
                      <select
                        value={item.layanan_id}
                        onChange={(e) =>
                          updateItem(item.key, "layanan_id", e.target.value)
                        }
                        className={selectClass}
                        aria-label={`Layanan item ${index + 1}`}
                      >
                        <option value="">Pilih Layanan</option>
                        {optionsLayanan.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.nama_layanan} - {formatRupiah(Number(option.harga))}
                            {option.nama_tipe ? ` (${option.nama_tipe})` : ""}
                          </option>
                        ))}
                      </select>
                      <ShoppingBagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>

                    {/* Jumlah */}
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.jumlah}
                        onChange={(e) => updateItem(item.key, "jumlah", e.target.value)}
                        placeholder="Jumlah"
                        className={inputClass}
                        aria-label={`Jumlah item ${index + 1}`}
                      />
                      <ScaleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>

                    {/* Satuan */}
                    <div className="relative">
                      <select
                        value={item.satuan}
                        onChange={(e) => updateItem(item.key, "satuan", e.target.value)}
                        className={selectClass}
                        aria-label={`Satuan item ${index + 1}`}
                      >
                        <option value="kg">kg</option>
                        <option value="pcs">pcs</option>
                      </select>
                      <CubeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>

                    {/* Parfum */}
                    <div className="relative sm:col-span-2">
                      <select
                        value={item.parfum_id}
                        onChange={(e) => updateItem(item.key, "parfum_id", e.target.value)}
                        className={selectClass}
                        aria-label={`Parfum item ${index + 1}`}
                      >
                        <option value="">Tanpa Parfum</option>
                        {optionsParfum.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.nama_parfum}
                          </option>
                        ))}
                      </select>
                      <SparklesIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>

                  {layanan && (
                    <p className="mt-2 text-right text-xs text-gray-500">
                      {formatRupiah(Number(layanan.harga))} × {jumlah} {item.satuan} ={" "}
                      <span className="font-medium text-gray-900">
                        {formatRupiah(Number(layanan.harga) * jumlah)}
                      </span>
                    </p>
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
            <div className="relative mt-3">
              <select
                value={antarJemputId}
                onChange={(e) => setAntarJemputId(e.target.value)}
                className={selectClass}
                aria-describedby="antar_jemput_id-error"
              >
                <option value="">Pilih Layanan Antar Jemput</option>
                {optionsAntarJemput.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.nama_antar_jemput} - {formatRupiah(Number(option.harga_antar_jemput))}
                  </option>
                ))}
              </select>
              <TruckIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          )}

          <div id="antar_jemput_id-error" aria-live="polite" aria-atomic="true">
            <ErrorText errors={state.errors?.antar_jemput_id} />
          </div>
        </div>

        {/* Diskon */}
        <div className="mb-4">
          <label htmlFor="diskon_id" className="mb-2 block text-sm font-medium">
            Diskon (Opsional)
          </label>
          <div className="relative">
            <select
              id="diskon_id"
              name="diskon_id"
              value={diskonId}
              onChange={(e) => setDiskonId(e.target.value)}
              className={selectClass}
            >
              <option value="">Tanpa Diskon</option>
              {optionsDiskon.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.nama_diskon} (
                  {option.tipe_diskon === "Persentase"
                    ? `${option.nilai_diskon}%`
                    : formatRupiah(Number(option.nilai_diskon))}
                  )
                </option>
              ))}
            </select>
            <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
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
              <dd className="font-medium text-gray-900">-{formatRupiah(nilaiDiskon)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-2">
              <dt className="font-medium text-gray-900">Total Bayar</dt>
              <dd className="font-semibold text-primary-600">{formatRupiah(totalBayar)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Kurang Bayar</dt>
              <dd className="font-medium text-gray-900">{formatRupiah(kurangBayar)}</dd>
            </div>
          </dl>
        </div>

        {/* Metode Pembayaran */}
        <div className="mb-4">
          <label htmlFor="metode_pembayaran" className="mb-2 block text-sm font-medium">
            Metode Pembayaran (Opsional)
          </label>
          <div className="relative">
            <select
              id="metode_pembayaran"
              name="metode_pembayaran"
              defaultValue=""
              className={selectClass}
            >
              <option value="">Pilih Metode Pembayaran</option>
              <option value="tunai">Tunai</option>
              <option value="transfer">Transfer</option>
              <option value="qris">QRIS</option>
            </select>
            <BanknotesIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>

        {/* Jumlah Bayar */}
        <div className="mb-4">
          <label htmlFor="jumlah_bayar" className="mb-2 block text-sm font-medium">
            Jumlah Bayar
          </label>
          <div className="relative">
            <input
              id="jumlah_bayar"
              name="jumlah_bayar"
              type="number"
              min="0"
              step="any"
              value={jumlahBayar}
              onChange={(e) => setJumlahBayar(e.target.value)}
              placeholder="Masukkan jumlah bayar"
              className={inputClass}
              aria-describedby="jumlah_bayar-error"
            />
            <BanknotesIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="jumlah_bayar-error" aria-live="polite" aria-atomic="true">
            <ErrorText errors={state.errors?.jumlah_bayar} />
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
