'use client';

import { useRouter } from 'next/navigation';
import { UpdateAntarJemput, DeleteAntarJemput } from '@/app/ui/antar-jemput/buttons';
import { AntarJemput } from '@/app/lib/definitions';
import { formatDateTimeToLocal, formatRupiah } from '@/app/lib/utils';
import { Truck } from 'lucide-react';
import DetailLayout from '@/app/ui/shared/detail-layout';

const BASE = '/laundry/pengaturan/antar-jemput';

export default function AntarJemputDetailView({ antarJemput }: { antarJemput: AntarJemput }) {
  const router = useRouter();

  return (
    <DetailLayout
      icon={Truck}
      title={antarJemput.nama_antar_jemput}
      lastUpdate={
        antarJemput.last_update ? formatDateTimeToLocal(antarJemput.last_update) : '-'
      }
      actions={
        <>
          <UpdateAntarJemput id={antarJemput.id} />
          <DeleteAntarJemput
            id={antarJemput.id}
            onDeleteAction={() => router.push(BASE)}
          />
        </>
      }
      sectionTitle="Informasi Antar-Jemput"
      fields={[
        { label: 'Nama Antar-Jemput', value: antarJemput.nama_antar_jemput },
        { label: 'Harga', value: formatRupiah(antarJemput.harga_antar_jemput) },
        {
          label: 'Terakhir Diubah',
          value: antarJemput.last_update ? formatDateTimeToLocal(antarJemput.last_update) : '-',
        },
        {
          label: 'Dibuat',
          value: antarJemput.created_at ? formatDateTimeToLocal(antarJemput.created_at) : '-',
        },
      ]}
    />
  );
}
