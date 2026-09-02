"use client";
import Link from "next/link";
import {
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { createUserToko, State } from "@/app/lib/actions";
import { useActionState } from "react";

export default function Form() {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(createUserToko, initialState);
  const isExistingUser = state.conflict === "existing_user";
  const isExistingUserToko = state.conflict === "existing_user_toko";
  const fieldsLocked = isExistingUser || isExistingUserToko;

  return (
    <form action={formAction} key={state.conflict ?? "create"}>
      {isExistingUser && state.existingUser && (
        <input type="hidden" name="existing_user_id" value={state.existingUser.id} />
      )}
      {fieldsLocked && state.existingUser && (
        <>
          <input type="hidden" name="name" value={state.existingUser.name} />
          <input type="hidden" name="email" value={state.existingUser.email} />
        </>
      )}
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nama */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Nama User
          </label>
          <div className="relative">
            <input
              id="name"
              name={fieldsLocked ? undefined : "name"}
              type="text"
              defaultValue={state.existingUser?.name ?? ""}
              disabled={fieldsLocked}
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 disabled:bg-gray-100 disabled:text-gray-700"
              placeholder="Masukkan nama user"
            />
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.name &&
              state.errors.name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              name={fieldsLocked ? undefined : "email"}
              type="email"
              defaultValue={state.existingUser?.email ?? ""}
              disabled={fieldsLocked}
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 disabled:bg-gray-100 disabled:text-gray-700"
              placeholder="contoh@email.com"
            />
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {state.errors?.email &&
              state.errors.email.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name={fieldsLocked ? undefined : "password"}
              type="password"
              defaultValue=""
              disabled={fieldsLocked}
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 disabled:bg-gray-100 disabled:text-gray-700"
              placeholder="Masukkan password"
            />
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="password-error" aria-live="polite" aria-atomic="true">
            {state.errors?.password &&
              state.errors.password.map((error: string) => (
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
              defaultValue={state.peran ?? ""}
              disabled={isExistingUserToko}
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 disabled:bg-gray-100 disabled:text-gray-700"
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

      {state.message && (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-500">{state.message}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-4">
        {isExistingUser && (
          <>
            <Link
              href="/laundry/pengaturan/usertoko"
              className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              Tidak
            </Link>
            <Button type="submit" name="intent" value="confirm_existing">
              Ya
            </Button>
          </>
        )}

        {isExistingUserToko && (
          <Link
            href="/laundry/pengaturan/usertoko"
            className="flex h-10 items-center rounded-lg bg-primary-500 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-400"
          >
            OK
          </Link>
        )}

        {!fieldsLocked && (
          <>
            <Link
              href="/laundry/pengaturan/usertoko"
              className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              Batal
            </Link>
            <Button type="submit">Tambah User Toko</Button>
          </>
        )}
      </div>
    </form>
  );
}
