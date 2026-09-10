'use client';

import { useRouter } from 'next/navigation';
import { UpdateDurasi, DeleteDurasi } from '@/app/ui/durasi/buttons';
import { Durasi } from '@/app/lib/definitions';
import { formatDateTimeToLocal } from '@/app/lib/utils';
import { ClockIcon } from 'lucide-react';
import DetailLayout from '@/app/ui/shared/detail-layout';

const BASE = '/laundry/pengaturan/durasi';

export default function DurasiDetailView({ durasi }: { durasi: Durasi }) {
  const router = useRouter();

  return (
    <DetailLayout
      icon={ClockIcon}
      title={durasi.nama_durasi ?? ''}
      lastUpdate={
        durasi.last_update ? formatDateTimeToLocal(durasi.last_update) : '-'
      }
      actions={
        <>
          <UpdateDurasi id={durasi.id} />
          <DeleteDurasi
            id={durasi.id}
            onDeleteAction={() => router.push(BASE)}
          />
        </>
      }
      sectionTitle="Informasi Durasi"
      fields={[
        { label: 'Nama Durasi', value: durasi.nama_durasi || '-' },
        {
          label: 'Lama Durasi',
          value: durasi.lama_durasi ? `${durasi.lama_durasi} jam` : '-',
        },
        {
          label: 'Terakhir Diubah',
          value: durasi.last_update ? formatDateTimeToLocal(durasi.last_update) : '-',
        },
        {
          label: 'Dibuat',
          value: durasi.created_at ? formatDateTimeToLocal(durasi.created_at) : '-',
        },
      ]}
    />
  );
}
