'use client';
import { updateDurasi, State } from '@/app/lib/actions';
import { Durasi } from '@/app/lib/definitions';
import { IdentificationIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useActionState } from 'react';
import { FormField, FormFooter } from '@/app/ui/shared/form-fields';

const BASE = '/laundry/pengaturan/durasi';

export default function EditDurasiForm({
  durasi,
}: {
  durasi: Durasi;
}) {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(updateDurasi.bind(null, durasi.id), initialState);
  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <FormField
          id="nama_durasi"
          label="Nama Durasi Layanan"
          icon={IdentificationIcon}
          placeholder="Masukkan nama durasi layanan"
          defaultValue={durasi.nama_durasi || ''}
          errors={state.errors?.nama_durasi}
        />
        <FormField
          id="lama_durasi"
          label="Lama Durasi (Jam)"
          icon={ClockIcon}
          type="number"
          placeholder="Masukkan angka lama durasi dalam jam"
          defaultValue={durasi.lama_durasi || ''}
          errors={state.errors?.lama_durasi}
        />
      </div>
      <FormFooter
        cancelHref={BASE}
        submitLabel="Update Durasi"
        message={state.message}
      />
    </form>
  );
}

