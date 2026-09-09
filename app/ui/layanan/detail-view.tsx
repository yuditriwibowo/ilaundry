'use client';

import { useRouter } from 'next/navigation';
import { UpdateLayanan, DeleteLayanan } from '@/app/ui/layanan/buttons';
import { DetailLayanan } from '@/app/lib/definitions';
import { formatDateTimeToLocal, formatRupiah } from '@/app/lib/utils';
import { PackageIcon } from 'lucide-react';

export default function LayananDetailView({ layanan }: { layanan: DetailLayanan }) {
  const router = useRouter();

  return (
    <div className="w-full pb-10">
      {/* Header card */}
      <div className="mt-4 w-full rounded-lg bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-2 text-sm">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600">
              <PackageIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-base font-medium text-gray-900">
                {layanan.nama_layanan}
              </p>
              <p className="truncate text-gray-500 text-xs">
                Terakhir diubah :{' '}
                {layanan.last_update ? formatDateTimeToLocal(layanan.last_update) : '-'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <UpdateLayanan id={layanan.id} />
            <DeleteLayanan
              id={layanan.id}
              onDeleteAction={() => router.push('/laundry/pengaturan/layanan')}
            />
          </div>
        </div>
      </div>

      {/* Informasi Layanan */}
      <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Informasi Layanan
        </legend>
        <div className="grid grid-cols-1 gap-x-8 text-xs text-gray-700 md:grid-cols-2 md:gap-y-1">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <PackageIcon className="h-4 w-4" />
              Nama Layanan
            </span>
            <span className="font-medium text-gray-900 text-right">
              {layanan.nama_layanan}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <PackageIcon className="h-4 w-4" />
              Tipe
            </span>
            <span className="font-medium text-gray-900 text-right">
              {layanan.nama_tipe}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <PackageIcon className="h-4 w-4" />
              Durasi
            </span>
            <span className="font-medium text-gray-900 text-right">
              {layanan.nama_durasi
                ? `${layanan.nama_durasi}${layanan.lama_durasi ? ` - ${layanan.lama_durasi} Jam` : ''}`
                : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <PackageIcon className="h-4 w-4" />
              Harga
            </span>
            <span className="font-medium text-gray-900 text-right">
              {formatRupiah(layanan.harga)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <PackageIcon className="h-4 w-4" />
              Toko
            </span>
            <span className="font-medium text-gray-900 text-right">
              {layanan.nama_toko || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <PackageIcon className="h-4 w-4" />
              Terakhir Diubah
            </span>
            <span className="font-medium text-gray-900 text-right">
              {layanan.last_update ? formatDateTimeToLocal(layanan.last_update) : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <PackageIcon className="h-4 w-4" />
              Dibuat
            </span>
            <span className="font-medium text-gray-900 text-right">
              {layanan.created_at ? formatDateTimeToLocal(layanan.created_at) : '-'}
            </span>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
