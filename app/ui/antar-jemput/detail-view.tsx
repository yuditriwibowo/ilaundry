'use client';

import { useRouter } from 'next/navigation';
import { UpdateAntarJemput, DeleteAntarJemput } from '@/app/ui/antar-jemput/buttons';
import { AntarJemput } from '@/app/lib/definitions';
import { formatDateTimeToLocal, formatRupiah } from '@/app/lib/utils';
import { Truck } from 'lucide-react';

export default function AntarJemputDetailView({ antarJemput }: { antarJemput: AntarJemput }) {
  const router = useRouter();

  return (
    <div className="w-full pb-10">
      {/* Header card */}
      <div className="mt-4 w-full rounded-lg bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-2 text-sm">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-base font-medium text-gray-900">
                {antarJemput.nama_antar_jemput}
              </p>
              <p className="truncate text-gray-500 text-xs">
                Terakhir diubah :{' '}
                {antarJemput.last_update ? formatDateTimeToLocal(antarJemput.last_update) : '-'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <UpdateAntarJemput id={antarJemput.id} />
            <DeleteAntarJemput
              id={antarJemput.id}
              onDeleteAction={() => router.push('/laundry/pengaturan/antar-jemput')}
            />
          </div>
        </div>
      </div>

      {/* Informasi Antar-Jemput */}
      <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Informasi Antar-Jemput
        </legend>
        <div className="grid grid-cols-1 gap-x-8 text-xs text-gray-700 md:grid-cols-2 md:gap-y-1">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Truck className="h-4 w-4" />
              Nama Antar-Jemput
            </span>
            <span className="font-medium text-gray-900 text-right">
              {antarJemput.nama_antar_jemput}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Truck className="h-4 w-4" />
              Harga
            </span>
            <span className="font-medium text-gray-900 text-right">
              {formatRupiah(antarJemput.harga_antar_jemput)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Truck className="h-4 w-4" />
              Terakhir Diubah
            </span>
            <span className="font-medium text-gray-900 text-right">
              {antarJemput.last_update ? formatDateTimeToLocal(antarJemput.last_update) : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Truck className="h-4 w-4" />
              Dibuat
            </span>
            <span className="font-medium text-gray-900 text-right">
              {antarJemput.created_at ? formatDateTimeToLocal(antarJemput.created_at) : '-'}
            </span>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
