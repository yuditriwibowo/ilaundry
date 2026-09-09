'use client';

import { useRouter } from 'next/navigation';
import { UpdateParfum, DeleteParfum } from '@/app/ui/parfum/buttons';
import { Parfum } from '@/app/lib/definitions';
import { formatDateTimeToLocal } from '@/app/lib/utils';
import { Droplets } from 'lucide-react';

export default function ParfumDetailView({ parfum }: { parfum: Parfum }) {
  const router = useRouter();

  return (
    <div className="w-full pb-10">
      {/* Header card */}
      <div className="mt-4 w-full rounded-lg bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-2 text-sm">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-base font-medium text-gray-900">
                {parfum.nama_parfum}
              </p>
              <p className="truncate text-gray-500 text-xs">
                Terakhir diubah :{' '}
                {parfum.last_update ? formatDateTimeToLocal(parfum.last_update) : '-'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <UpdateParfum id={parfum.id} />
            <DeleteParfum
              id={parfum.id}
              onDeleteAction={() => router.push('/laundry/pengaturan/parfum')}
            />
          </div>
        </div>
      </div>

      {/* Informasi Parfum */}
      <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Informasi Parfum
        </legend>
        <div className="grid grid-cols-1 gap-x-8 text-xs text-gray-700 md:grid-cols-2 md:gap-y-1">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Droplets className="h-4 w-4" />
              Nama Parfum
            </span>
            <span className="font-medium text-gray-900 text-right">
              {parfum.nama_parfum}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Droplets className="h-4 w-4" />
              Terakhir Diubah
            </span>
            <span className="font-medium text-gray-900 text-right">
              {parfum.last_update ? formatDateTimeToLocal(parfum.last_update) : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Droplets className="h-4 w-4" />
              Dibuat
            </span>
            <span className="font-medium text-gray-900 text-right">
              {parfum.created_at ? formatDateTimeToLocal(parfum.created_at) : '-'}
            </span>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
