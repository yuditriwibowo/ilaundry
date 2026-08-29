"use client";
import Link from "next/link";
import {
  TagIcon,
  BanknotesIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { createDiskon, State } from "@/app/lib/actions";
import { useActionState } from "react";

export default function Form() {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(createDiskon, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nama Diskon */}
        <div className="mb-4">
          <label htmlFor="nama_diskon" className="mb-2 block text-sm font-medium">
            Nama Diskon
          </label>
          <div className="relative">
            <input
              id="nama_diskon"
              name="nama_diskon"
              type="text"
              placeholder="Masukkan nama diskon"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="nama_diskon-error"
            />
            <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="nama_diskon-error" aria-live="polite" aria-atomic="true">
            {state.errors?.nama_diskon &&
              state.errors.nama_diskon.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Tipe Diskon */}
        <div className="mb-4">
          <label htmlFor="tipe_diskon" className="mb-2 block text-sm font-medium">
            Tipe Diskon
          </label>
          <div className="relative">
            <select
              id="tipe_diskon"
              name="tipe_diskon"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
              aria-describedby="tipe_diskon-error"
            >
              <option value="" disabled>Pilih tipe diskon</option>
              <option value="Persentase">Persentase (%)</option>
              <option value="Nominal">Nominal (Rp)</option>
            </select>
            <InformationCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="tipe_diskon-error" aria-live="polite" aria-atomic="true">
            {state.errors?.tipe_diskon &&
              state.errors.tipe_diskon.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Nilai Diskon */}
        <div className="mb-4">
          <label htmlFor="nilai_diskon" className="mb-2 block text-sm font-medium">
            Nilai Diskon
          </label>
          <div className="relative">
            <input
              id="nilai_diskon"
              name="nilai_diskon"
              type="number"
              placeholder="Masukkan nilai diskon"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="nilai_diskon-error"
            />
            <BanknotesIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="nilai_diskon-error" aria-live="polite" aria-atomic="true">
            {state.errors?.nilai_diskon &&
              state.errors.nilai_diskon.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/laundry/pengaturan/diskon"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Batal
        </Link>
        <Button type="submit">Tambah Diskon</Button>
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
