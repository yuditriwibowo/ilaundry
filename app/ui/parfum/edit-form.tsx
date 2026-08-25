'use client';
import { updateParfum, State } from '@/app/lib/actions';
import { Parfum } from '@/app/lib/definitions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { IdentificationIcon } from '@heroicons/react/24/outline';
import { useActionState } from 'react';

export default function EditParfumForm({
  parfum,
}: {
  parfum: Parfum;
}) {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(updateParfum.bind(null, parfum.id), initialState);
  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nama Parfum */}
        <div className="mb-4">
          <label htmlFor="nama_parfum" className="mb-2 block text-sm font-medium">
            Nama Parfum
          </label>
          <div className="relative">
            <input
              id="nama_parfum"
              name="nama_parfum"
              defaultValue={parfum.nama_parfum || ''}
              placeholder="Masukkan nama parfum"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="nama_parfum-error"
            />
            <IdentificationIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="nama_parfum-error" aria-live="polite" aria-atomic="true">
            {state.errors?.nama_parfum &&
              state.errors.nama_parfum.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/laundry/pengaturan/parfum"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Batal
        </Link>
        <Button type="submit">Update Parfum</Button>
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
