'use client';

import { useRouter } from 'next/navigation';
import { UpdateParfum, DeleteParfum } from '@/app/ui/parfum/buttons';
import { Parfum } from '@/app/lib/definitions';
import { formatDateTimeToLocal } from '@/app/lib/utils';
import { Droplets } from 'lucide-react';
import DetailLayout from '@/app/ui/shared/detail-layout';

const BASE = '/laundry/pengaturan/parfum';

export default function ParfumDetailView({ parfum }: { parfum: Parfum }) {
  const router = useRouter();

  return (
    <DetailLayout
      icon={Droplets}
      title={parfum.nama_parfum}
      lastUpdate={
        parfum.last_update ? formatDateTimeToLocal(parfum.last_update) : '-'
      }
      actions={
        <>
          <UpdateParfum id={parfum.id} />
          <DeleteParfum
            id={parfum.id}
            onDeleteAction={() => router.push(BASE)}
          />
        </>
      }
      sectionTitle="Informasi Parfum"
      fields={[
        { label: 'Nama Parfum', value: parfum.nama_parfum },
        {
          label: 'Terakhir Diubah',
          value: parfum.last_update ? formatDateTimeToLocal(parfum.last_update) : '-',
        },
        {
          label: 'Dibuat',
          value: parfum.created_at ? formatDateTimeToLocal(parfum.created_at) : '-',
        },
      ]}
    />
  );
}

