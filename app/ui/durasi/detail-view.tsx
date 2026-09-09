'use client';

import { useRouter } from 'next/navigation';
import { UpdateDurasi, DeleteDurasi } from '@/app/ui/durasi/buttons';
import { Durasi } from '@/app/lib/definitions';
import { formatDateTimeToLocal } from '@/app/lib/utils';
import { ClockIcon } from 'lucide-react';

export default function DurasiDetailView({ durasi }: { durasi: Durasi }) {
  const router = useRouter();

  return (
    <div className="w-full pb-10">
      {/* Header card */}
      <div className="mt-4 w-full rounded-lg bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-2 text-sm">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600">
              <ClockIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-base font-medium text-gray-900">
                {durasi.nama_durasi}
              </p>
              <p className="truncate text-gray-500 text-xs">
                Terakhir diubah :{' '}
                {durasi.last_update ? formatDateTimeToLocal(durasi.last_update) : '-'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <UpdateDurasi id={durasi.id} />
            <DeleteDurasi
              id={durasi.id}
              onDeleteAction={() => router.push('/laundry/pengaturan/durasi')}
            />
          </div>
        </div>
      </div>

      {/* Informasi Durasi */}
      <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Informasi Durasi
        </legend>
        <div className="grid grid-cols-1 gap-x-8 text-xs text-gray-700 md:grid-cols-2 md:gap-y-1">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <ClockIcon className="h-4 w-4" />
              Nama Durasi
            </span>
            <span className="font-medium text-gray-900 text-right">
              {durasi.nama_durasi || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <ClockIcon className="h-4 w-4" />
              Lama Durasi
            </span>
            <span className="font-medium text-gray-900 text-right">
              {durasi.lama_durasi ? `${durasi.lama_durasi} jam` : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <ClockIcon className="h-4 w-4" />
              Terakhir Diubah
            </span>
            <span className="font-medium text-gray-900 text-right">
              {durasi.last_update ? formatDateTimeToLocal(durasi.last_update) : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <ClockIcon className="h-4 w-4" />
              Dibuat
            </span>
            <span className="font-medium text-gray-900 text-right">
              {durasi.created_at ? formatDateTimeToLocal(durasi.created_at) : '-'}
            </span>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
