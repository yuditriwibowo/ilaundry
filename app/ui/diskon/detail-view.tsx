'use client';

import { useRouter } from 'next/navigation';
import { UpdateDiskon, DeleteDiskon } from '@/app/ui/diskon/buttons';
import { Diskon } from '@/app/lib/definitions';
import { formatDateTimeToLocal, formatRupiah } from '@/app/lib/utils';
import { TicketIcon } from 'lucide-react';
import DetailLayout from '@/app/ui/shared/detail-layout';

const BASE = '/laundry/pengaturan/diskon';

export default function DiskonDetailView({ diskon }: { diskon: Diskon }) {
  const router = useRouter();

  return (
    <DetailLayout
      icon={TicketIcon}
      title={diskon.nama_diskon}
      lastUpdate={
        diskon.last_update ? formatDateTimeToLocal(diskon.last_update) : '-'
      }
      actions={
        <>
          <UpdateDiskon id={diskon.id} />
          <DeleteDiskon
            id={diskon.id}
            onDeleteAction={() => router.push(BASE)}
          />
        </>
      }
      sectionTitle="Informasi Diskon"
      fields={[
        { label: 'Nama Diskon', value: diskon.nama_diskon },
        { label: 'Tipe Diskon', value: diskon.tipe_diskon },
        {
          label: 'Nilai Diskon',
          value:
            diskon.tipe_diskon === 'Persentase'
              ? `${diskon.nilai_diskon}%`
              : formatRupiah(diskon.nilai_diskon),
        },
        {
          label: 'Terakhir Diubah',
          value: diskon.last_update ? formatDateTimeToLocal(diskon.last_update) : '-',
        },
        {
          label: 'Dibuat',
          value: diskon.created_at ? formatDateTimeToLocal(diskon.created_at) : '-',
        },
      ]}
    />
  );
}
