"use client";

import Link from "next/link";
import {
  TruckIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { createAntarJemput, State } from "@/app/lib/actions";
import { useActionState } from "react";

export default function Form() {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(createAntarJemput, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nama Antar-Jemput */}
        <div className="mb-4">
          <label htmlFor="nama_antar_jemput" className="mb-2 block text-sm font-medium">
            Nama Antar-Jemput
          </label>
          <div className="relative">
            <input
              id="nama_antar_jemput"
              name="nama_antar_jemput"
              type="text"
              placeholder="Masukkan nama antar-jemput"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="nama_antar_jemput-error"
            />
            <TruckIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="nama_antar_jemput-error" aria-live="polite" aria-atomic="true">
            {state.errors?.nama_antar_jemput &&
              state.errors.nama_antar_jemput.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Harga Antar-Jemput */}
        <div className="mb-4">
          <label htmlFor="harga_antar_jemput" className="mb-2 block text-sm font-medium">
            Harga Antar-Jemput
          </label>
          <div className="relative">
            <input
              id="harga_antar_jemput"
              name="harga_antar_jemput"
              type="number"
              placeholder="Masukkan harga antar-jemput"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="harga_antar_jemput-error"
            />
            <BanknotesIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="harga_antar_jemput-error" aria-live="polite" aria-atomic="true">
            {state.errors?.harga_antar_jemput &&
              state.errors.harga_antar_jemput.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/laundry/pengaturan/antar-jemput"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Batal
        </Link>
        <Button type="submit">Tambah Antar-Jemput</Button>
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
