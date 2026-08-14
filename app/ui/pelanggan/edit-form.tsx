'use client';
import { updatePelanggan } from '@/app/lib/actions';
import { Pelanggan } from '@/app/lib/definitions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function EditPelangganForm({
  pelanggan,
}: {
  pelanggan: Pelanggan;
}) {
  const updatePelangganWithId = updatePelanggan.bind(null, pelanggan.id);
  return (
    <form action={updatePelangganWithId}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nama */}
        <div className="mb-4">
          <label htmlFor="nama" className="mb-2 block text-sm font-medium">
            Nama Pelanggan
          </label>
          <div className="relative">
            <input
              id="nama"
              name="nama"
              defaultValue={pelanggan.nama}
              placeholder="Enter name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* No HP */}
        <div className="mb-4">
          <label htmlFor="no_hp" className="mb-2 block text-sm font-medium">
            No HP
          </label>
          <div className="relative">
            <input
              id="no_hp"
              name="no_hp"
              defaultValue={pelanggan.no_hp}
              placeholder="Enter phone number"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
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
              name="email"
              defaultValue={pelanggan.email || ''}
              placeholder="Enter email"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Alamat */}
        <div className="mb-4">
          <label htmlFor="alamat" className="mb-2 block text-sm font-medium">
            Alamat
          </label>
          <div className="relative">
            <input
              id="alamat"
              name="alamat"
              defaultValue={pelanggan.alamat || ''}
              placeholder="Enter address"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/laundry/pelanggan"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Update Pelanggan</Button>
      </div>
    </form>
  );
}
