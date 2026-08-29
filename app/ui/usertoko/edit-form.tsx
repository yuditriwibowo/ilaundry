'use client';
import { updateUserToko, State } from '@/app/lib/actions';
import { UserTokoDetail } from '@/app/lib/definitions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import { useActionState } from 'react';

export default function EditUserTokoForm({
  userToko,
}: {
  userToko: UserTokoDetail;
}) {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(updateUserToko.bind(null, userToko.id), initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nama User */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Nama User
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              defaultValue={userToko.name}
              readOnly
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 bg-gray-100 placeholder:text-gray-500"
            />
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
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
              defaultValue={userToko.peran || ''}
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
        <Button type="submit">Update Peran User</Button>
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
