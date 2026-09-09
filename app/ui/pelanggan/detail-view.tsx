'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UpdatePelanggan, DeletePelanggan } from '@/app/ui/pelanggan/buttons';
import { Pelanggan } from '@/app/lib/definitions';
import { formatDateToLocal } from '@/app/lib/utils';
import { User, Phone, Mail, Home, Clock } from 'lucide-react';

export default function PelangganDetailView({ pelanggan }: { pelanggan: Pelanggan }) {
  const router = useRouter();

  return (
    <div className="w-full pb-10">
      {/* Header card */}
      <div className="mt-4 w-full rounded-lg bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-2 text-sm">
          <div className="flex min-w-0 gap-3">
            {pelanggan.image_url ? (
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={pelanggan.image_url}
                  className="object-cover"
                  fill
                  sizes="36px"
                  alt={`${pelanggan.nama}'s profile picture`}
                />
              </div>
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-base font-medium text-gray-900">
                {pelanggan.nama}
              </p>
              <p className="truncate text-gray-500 text-xs">{pelanggan.no_hp}</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <UpdatePelanggan id={pelanggan.id} />
            <DeletePelanggan
              id={pelanggan.id}
              onDeleteAction={() => router.push('/laundry/pelanggan')}
            />
          </div>
        </div>
      </div>

      {/* Informasi Pelanggan */}
      <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Informasi Pelanggan
        </legend>
        <div className="grid grid-cols-1 gap-x-8 text-xs text-gray-700 md:grid-cols-2 md:gap-y-1">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <User className="h-4 w-4" />
              Nama
            </span>
            <span className="font-medium text-gray-900 text-right">
              {pelanggan.nama}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Phone className="h-4 w-4" />
              No HP
            </span>
            <span className="font-medium text-gray-900 text-right">
              {pelanggan.no_hp}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Mail className="h-4 w-4" />
              Email
            </span>
            <span className="font-medium text-gray-900 text-right">
              {pelanggan.email || '-'}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Home className="h-4 w-4" />
              Alamat
            </span>
            <span className="font-medium text-gray-900 text-right max-w-[60%]">
              {pelanggan.alamat || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Clock className="h-4 w-4" />
              Tanggal Daftar
            </span>
            <span className="font-medium text-gray-900 text-right">
              {pelanggan.tgl_daftar ? formatDateToLocal(pelanggan.tgl_daftar) : '-'}
            </span>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
