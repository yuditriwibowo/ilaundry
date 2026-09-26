'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UpdateInfoIklan, DeleteInfoIklan } from '@/app/ui/info-iklan/buttons';
import { InfoIklan } from '@/app/lib/definitions';
import { formatDateTimeToLocal } from '@/app/lib/utils';
import { Megaphone } from 'lucide-react';
import DetailLayout from '@/app/ui/shared/detail-layout';

const BASE = '/laundry/pengaturan/info-iklan';

export default function InfoIklanDetailView({
  infoIklan,
}: {
  infoIklan: InfoIklan;
}) {
  const router = useRouter();

  return (
    <>
      <DetailLayout
        icon={Megaphone}
        title={infoIklan.title ?? '(tanpa judul)'}
        lastUpdate={
          infoIklan.last_update
            ? formatDateTimeToLocal(infoIklan.last_update)
            : '-'
        }
        actions={
          <>
            <UpdateInfoIklan id={infoIklan.id} />
            <DeleteInfoIklan
              id={infoIklan.id}
              onDeleteAction={() => router.push(BASE)}
            />
          </>
        }
        sectionTitle="Informasi Info & Iklan"
        fields={[
          { label: 'Judul', value: infoIklan.title ?? '-' },
          { label: 'Deskripsi', value: infoIklan.description ?? '-' },
          { label: 'Gambar', value: infoIklan.image_src ?? '-' },
          { label: 'Link Tujuan', value: infoIklan.link ?? '-' },
          {
            label: 'Mulai Berlaku',
            value: infoIklan.start
              ? formatDateTimeToLocal(infoIklan.start)
              : '-',
          },
          {
            label: 'Selesai Berlaku',
            value: infoIklan.end ? formatDateTimeToLocal(infoIklan.end) : '-',
          },
          {
            label: 'Terakhir Diubah',
            value: infoIklan.last_update
              ? formatDateTimeToLocal(infoIklan.last_update)
              : '-',
          },
          {
            label: 'Dibuat',
            value: infoIklan.created_at
              ? formatDateTimeToLocal(infoIklan.created_at)
              : '-',
          },
        ]}
      />

      {/* Pratinjau gambar (hanya bila image_src terisi).
          Gambar internal di /public/carousel/ — Image optimized. */}
      {infoIklan.image_src && (
        <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <legend className="px-2 text-sm font-semibold text-gray-700">
            Pratinjau Gambar
          </legend>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={infoIklan.image_src}
              alt={infoIklan.title ?? 'Gambar info/iklan'}
              width={1200}
              height={400}
              className="h-auto w-full"
            />
          </div>
        </fieldset>
      )}
    </>
  );
}