'use client';

import { useRouter } from 'next/navigation';
import { UpdateLayanan, DeleteLayanan } from '@/app/ui/layanan/buttons';
import { DetailLayanan } from '@/app/lib/definitions';
import { formatDateTimeToLocal, formatRupiah } from '@/app/lib/utils';
import { PackageIcon } from 'lucide-react';
import DetailLayout from '@/app/ui/shared/detail-layout';

const BASE = '/laundry/pengaturan/layanan';

export default function LayananDetailView({ layanan }: { layanan: DetailLayanan }) {
  const router = useRouter();

  return (
    <DetailLayout
      icon={PackageIcon}
      title={layanan.nama_layanan}
      lastUpdate={
        layanan.last_update ? formatDateTimeToLocal(layanan.last_update) : '-'
      }
      actions={
        <>
          <UpdateLayanan id={layanan.id} />
          <DeleteLayanan
            id={layanan.id}
            onDeleteAction={() => router.push(BASE)}
          />
        </>
      }
      sectionTitle="Informasi Layanan"
      fields={[
        { label: 'Nama Layanan', value: layanan.nama_layanan },
        { label: 'Tipe', value: layanan.nama_tipe },
        {
          label: 'Durasi',
          value: layanan.nama_durasi
            ? `${layanan.nama_durasi}${layanan.lama_durasi ? ` - ${layanan.lama_durasi} Jam` : ''}`
            : '-',
        },
        { label: 'Harga', value: formatRupiah(layanan.harga) },
        { label: 'Toko', value: layanan.nama_toko || '-' },
        {
          label: 'Terakhir Diubah',
          value: layanan.last_update ? formatDateTimeToLocal(layanan.last_update) : '-',
        },
        {
          label: 'Dibuat',
          value: layanan.created_at ? formatDateTimeToLocal(layanan.created_at) : '-',
        },
      ]}
    />
  );
}
