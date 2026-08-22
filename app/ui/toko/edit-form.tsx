'use client';
import { updateToko, State } from '@/app/lib/actions';
import { Toko } from '@/app/lib/definitions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { BuildingStorefrontIcon, PhoneIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useActionState } from 'react';

export default function EditTokoForm({
  toko,
}: {
  toko: Toko;
}) {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(updateToko.bind(null, toko.id), initialState);
  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nama Toko */}
        <div className="mb-4">
          <label htmlFor="nama_toko" className="mb-2 block text-sm font-medium">
            Nama Toko
          </label>
          <div className="relative">
            <input
              id="nama_toko"
              name="nama_toko"
              defaultValue={toko.nama_toko}
              placeholder="Enter store name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="nama_toko-error"
            />
            <BuildingStorefrontIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="nama_toko-error" aria-live="polite" aria-atomic="true">
            {state.errors?.nama_toko &&
              state.errors.nama_toko.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Telephone */}
        <div className="mb-4">
          <label htmlFor="telephone" className="mb-2 block text-sm font-medium">
            Telepon
          </label>
          <div className="relative">
            <input
              id="telephone"
              name="telephone"
              defaultValue={toko.telephone || ''}
              placeholder="Enter phone number"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="telephone-error"
            />
            <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="telephone-error" aria-live="polite" aria-atomic="true">
            {state.errors?.telephone &&
              state.errors.telephone.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Alamat Toko */}
        <div className="mb-4">
          <label htmlFor="alamat_toko" className="mb-2 block text-sm font-medium">
            Alamat Toko
          </label>
          <div className="relative">
            <textarea
              id="alamat_toko"
              name="alamat_toko"
              defaultValue={toko.alamat_toko || ''}
              rows={3}
              placeholder="Enter address"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
            <HomeIcon className="pointer-events-none absolute left-3 top-3 h-[18px] w-[18px] text-gray-500" />
          </div>
        </div>
      </div>
       <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/laundry/pengaturan/toko"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Batal
          </Link>
          <Button type="submit">Update Toko</Button>
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
