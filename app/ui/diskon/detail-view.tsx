'use client';

import { useRouter } from 'next/navigation';
import { UpdateDiskon, DeleteDiskon } from '@/app/ui/diskon/buttons';
import { Diskon } from '@/app/lib/definitions';
import { formatDateTimeToLocal, formatRupiah } from '@/app/lib/utils';
import { TicketIcon } from 'lucide-react';

export default function DiskonDetailView({ diskon }: { diskon: Diskon }) {
  const router = useRouter();

  return (
    <div className="w-full pb-10">
      {/* Header card */}
      <div className="mt-4 w-full rounded-lg bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-2 text-sm">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600">
              <TicketIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-base font-medium text-gray-900">
                {diskon.nama_diskon}
              </p>
              <p className="truncate text-gray-500 text-xs">
                Terakhir diubah :{' '}
                {diskon.last_update ? formatDateTimeToLocal(diskon.last_update) : '-'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <UpdateDiskon id={diskon.id} />
            <DeleteDiskon
              id={diskon.id}
              onDeleteAction={() => router.push('/laundry/pengaturan/diskon')}
            />
          </div>
        </div>
      </div>

      {/* Informasi Diskon */}
      <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Informasi Diskon
        </legend>
        <div className="grid grid-cols-1 gap-x-8 text-xs text-gray-700 md:grid-cols-2 md:gap-y-1">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <TicketIcon className="h-4 w-4" />
              Nama Diskon
            </span>
            <span className="font-medium text-gray-900 text-right">
              {diskon.nama_diskon}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <TicketIcon className="h-4 w-4" />
              Tipe Diskon
            </span>
            <span className="font-medium text-gray-900 text-right">
              {diskon.tipe_diskon}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <TicketIcon className="h-4 w-4" />
              Nilai Diskon
            </span>
            <span className="font-medium text-gray-900 text-right">
              {diskon.tipe_diskon === 'Persentase'
                ? `${diskon.nilai_diskon}%`
                : formatRupiah(diskon.nilai_diskon)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <TicketIcon className="h-4 w-4" />
              Terakhir Diubah
            </span>
            <span className="font-medium text-gray-900 text-right">
              {diskon.last_update ? formatDateTimeToLocal(diskon.last_update) : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <TicketIcon className="h-4 w-4" />
              Dibuat
            </span>
            <span className="font-medium text-gray-900 text-right">
              {diskon.created_at ? formatDateTimeToLocal(diskon.created_at) : '-'}
            </span>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
