"use client";
import Link from "next/link";
import {
  IdentificationIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { updateLayanan, State } from "@/app/lib/actions";
import { Layanan } from "@/app/lib/definitions";
import { useActionState } from "react";

export default function EditLayananForm({
  layanan,
  optionsTipe,
  optionsDurasi,
}: {
  layanan: Layanan;
  optionsTipe: any[];
  optionsDurasi: any[];
}) {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(updateLayanan.bind(null, layanan.id), initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Tipe Layanan */}
        <div className="mb-4">
          <label htmlFor="tipe_id" className="mb-2 block text-sm font-medium">
            Tipe Layanan
          </label>
          <div className="relative">
            <select
              id="tipe_id"
              name="tipe_id"
              defaultValue={layanan.tipe_id}
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="tipe_id-error"
            >
              <option value="">Pilih Tipe Layanan</option>
              {optionsTipe.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.nama}
                </option>
              ))}
            </select>
            <BuildingStorefrontIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="tipe_id-error" aria-live="polite" aria-atomic="true">
            {state.errors?.tipe_id &&
              state.errors.tipe_id.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Durasi Layanan */}
        <div className="mb-4">
          <label htmlFor="durasi_id" className="mb-2 block text-sm font-medium">
            Durasi Layanan
          </label>
          <div className="relative">
            <select
              id="durasi_id"
              name="durasi_id"
              defaultValue={layanan.durasi_id}
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="durasi_id-error"
            >
              <option value="">Pilih Durasi Layanan</option>
              {optionsDurasi.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.nama}
                </option>
              ))}
            </select>
            <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="durasi_id-error" aria-live="polite" aria-atomic="true">
            {state.errors?.durasi_id &&
              state.errors.durasi_id.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Nama Layanan */}
        <div className="mb-4">
          <label htmlFor="nama_layanan" className="mb-2 block text-sm font-medium">
            Nama Layanan
          </label>
          <div className="relative">
            <input
              id="nama_layanan"
              name="nama_layanan"
              type="text"
              defaultValue={layanan.nama_layanan}
              placeholder="Masukkan nama layanan"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="nama_layanan-error"
            />
            <IdentificationIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="nama_layanan-error" aria-live="polite" aria-atomic="true">
            {state.errors?.nama_layanan &&
              state.errors.nama_layanan.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Harga Layanan */}
        <div className="mb-4">
          <label htmlFor="harga" className="mb-2 block text-sm font-medium">
            Harga Layanan
          </label>
          <div className="relative">
            <input
              id="harga"
              name="harga"
              type="number"
              defaultValue={layanan.harga}
              placeholder="Masukkan harga layanan"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="harga-error"
            />
            <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="harga-error" aria-live="polite" aria-atomic="true">
            {state.errors?.harga &&
              state.errors.harga.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/laundry/pengaturan/layanan"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Batal
        </Link>
        <Button type="submit">Update Layanan</Button>
      </div>

      {/* General Form Message */}
      <div className="mt-4 text-center">
        {state.message && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}
      </div>
    </form>
  );
}
