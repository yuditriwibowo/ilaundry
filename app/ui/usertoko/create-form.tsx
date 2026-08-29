"use client";
import Link from "next/link";
import {
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { createUserToko, State } from "@/app/lib/actions";
import { useActionState } from "react";
import { UserTokoDetail } from "@/app/lib/definitions";

export default function Form({ 
  optionsUsers 
}: { 
  optionsUsers: UserTokoDetail[]; 
}) {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(createUserToko, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nama User */}
        <div className="mb-4">
          <label htmlFor="id" className="mb-2 block text-sm font-medium">
            Nama User
          </label>
          <div className="relative">
            <select
              id="id"
              name="id"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="id-error"
            >
              <option value="">Pilih User</option>
              {optionsUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="id-error" aria-live="polite" aria-atomic="true">
            {state.errors?.id &&
              state.errors.id.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Peran */}
        <div className="mb-4">
          <label htmlFor="peran" className="mb-2 block text-sm font-medium">
            Peran
          </label>
          <div className="relative">
            <select
              id="peran"
              name="peran"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="peran-error"
            >
              <option value="">Pilih Peran</option>
              <option value="Administrator">Administrator</option>
              <option value="Manager">Manager</option>
              <option value="Kasir">Kasir</option>
            </select>
            <ShieldCheckIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="peran-error" aria-live="polite" aria-atomic="true">
            {state.errors?.peran &&
              state.errors.peran.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/laundry/pengaturan/usertoko"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Batal
        </Link>
        <Button type="submit">Tambah User Toko</Button>
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
