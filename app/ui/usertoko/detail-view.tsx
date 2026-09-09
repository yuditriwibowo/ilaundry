'use client';

import { useRouter } from 'next/navigation';
import { UpdateUserToko, DeleteUserToko } from '@/app/ui/usertoko/buttons';
import { UserTokoDetail } from '@/app/lib/definitions';
import { formatDateTimeToLocal } from '@/app/lib/utils';
import { Users, MailIcon } from 'lucide-react';

export default function UserTokoDetailView({ userToko }: { userToko: UserTokoDetail }) {
  const router = useRouter();

  return (
    <div className="w-full pb-10">
      {/* Header card */}
      <div className="mt-4 w-full rounded-lg bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-2 text-sm">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-base font-medium text-gray-900">
                {userToko.name}
              </p>
              <p className="truncate text-gray-500 text-xs">
                Peran : {userToko.peran || '-'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <UpdateUserToko id={userToko.id} />
            <DeleteUserToko
              id={userToko.id}
              onDeleteAction={() => router.push('/laundry/pengaturan/usertoko')}
            />
          </div>
        </div>
      </div>

      {/* Informasi User Toko */}
      <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Informasi User Toko
        </legend>
        <div className="grid grid-cols-1 gap-x-8 text-xs text-gray-700 md:grid-cols-2 md:gap-y-1">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Users className="h-4 w-4" />
              Nama User
            </span>
            <span className="font-medium text-gray-900 text-right">
              {userToko.name}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <MailIcon className="h-4 w-4" />
              Email
            </span>
            <span className="font-medium text-gray-900 text-right">
              {userToko.email}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Users className="h-4 w-4" />
              Toko
            </span>
            <span className="font-medium text-gray-900 text-right">
              {userToko.nama_toko || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Users className="h-4 w-4" />
              Peran
            </span>
            <span className="font-medium text-gray-900 text-right">
              {userToko.peran || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Users className="h-4 w-4" />
              Terakhir Diubah
            </span>
            <span className="font-medium text-gray-900 text-right">
              {userToko.last_update ? formatDateTimeToLocal(userToko.last_update) : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Users className="h-4 w-4" />
              Dibuat
            </span>
            <span className="font-medium text-gray-900 text-right">
              {userToko.created_at ? formatDateTimeToLocal(userToko.created_at) : '-'}
            </span>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
