'use client';

import { useRouter } from 'next/navigation';
import { UpdateToko, DeleteToko } from '@/app/ui/toko/buttons';
import { Toko } from '@/app/lib/definitions';
import { formatDateTimeToLocal } from '@/app/lib/utils';
import { BuildingStorefrontIcon, PhoneIcon, HomeIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function TokoDetailView({ toko }: { toko: Toko }) {
  const router = useRouter();

  return (
    <div className="w-full pb-10">
      {/* Header card */}
      <div className="mt-4 w-full rounded-lg bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-2 text-sm">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600">
              <BuildingStorefrontIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-base font-medium text-gray-900">
                {toko.nama_toko}
              </p>
              <p className="truncate text-gray-500 text-xs">
                Terakhir diubah :{' '}
                {toko.last_update ? formatDateTimeToLocal(toko.last_update) : '-'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <UpdateToko id={toko.id} />
            <DeleteToko
              id={toko.id}
              onDeleteAction={() => router.push('/laundry/pengaturan/toko')}
            />
          </div>
        </div>
      </div>

      {/* Informasi Toko */}
      <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Informasi Toko
        </legend>
        <div className="grid grid-cols-1 gap-x-8 text-xs text-gray-700 md:grid-cols-2 md:gap-y-1">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <BuildingStorefrontIcon className="h-4 w-4" />
              Nama Toko
            </span>
            <span className="font-medium text-gray-900 text-right">
              {toko.nama_toko}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <PhoneIcon className="h-4 w-4" />
              Telepon
            </span>
            <span className="font-medium text-gray-900 text-right">
              {toko.telephone || '-'}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <HomeIcon className="h-4 w-4" />
              Alamat Toko
            </span>
            <span className="font-medium text-gray-900 text-right max-w-[60%]">
              {toko.alamat_toko || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <ClockIcon className="h-4 w-4" />
              Terakhir Diubah
            </span>
            <span className="font-medium text-gray-900 text-right">
              {toko.last_update ? formatDateTimeToLocal(toko.last_update) : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <ClockIcon className="h-4 w-4" />
              Dibuat
            </span>
            <span className="font-medium text-gray-900 text-right">
              {toko.created_at ? formatDateTimeToLocal(toko.created_at) : '-'}
            </span>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
