"use client";
import Link from "next/link";
import {
  IdentificationIcon,
  ClockIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { createDurasi, State } from "@/app/lib/actions";
import { useActionState } from "react";

export default function Form() {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(createDurasi, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nama Durasi */}
        <div className="mb-4">
          <label htmlFor="nama_durasi" className="mb-2 block text-sm font-medium">
            Nama Tipe Layanan
          </label>
          <div className="relative">
            <input
              id="nama_durasi"
              name="nama_durasi"
              type="text"
              placeholder="Masukkan nama tipe layanan"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="nama_durasi-error"
            />
            <IdentificationIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="nama_durasi-error" aria-live="polite" aria-atomic="true">
            {state.errors?.nama_durasi &&
              state.errors.nama_durasi.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Lama Durasi */}
        <div className="mb-4">
          <label htmlFor="lama_durasi" className="mb-2 block text-sm font-medium">
            Lama Durasi (Jam)
          </label>
          <div className="relative">
            <input
              id="lama_durasi"
              name="lama_durasi"
              type="number"
              placeholder="Masukkan angka lama durasi dalam jam"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="lama_durasi-error"
            />
            <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="lama_durasi-error" aria-live="polite" aria-atomic="true">
            {state.errors?.lama_durasi &&
              state.errors.lama_durasi.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/laundry/pengaturan/durasi"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Batal
        </Link>
        <Button type="submit">Tambah Durasi</Button>
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
