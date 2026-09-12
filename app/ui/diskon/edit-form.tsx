'use client';
import { updateDiskon, State } from '@/app/lib/actions';
import { Diskon } from '@/app/lib/definitions';
import {
  TagIcon,
  BanknotesIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useActionState } from 'react';
import { FormField, SelectField, FormFooter } from '@/app/ui/shared/form-fields';

const BASE = '/laundry/pengaturan/diskon';

export default function EditDiskonForm({
  diskon,
}: {
  diskon: Diskon;
}) {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(updateDiskon.bind(null, diskon.id), initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <FormField
          id="nama_diskon"
          label="Nama Diskon"
          icon={TagIcon}
          placeholder="Masukkan nama diskon"
          defaultValue={diskon.nama_diskon || ''}
          errors={state.errors?.nama_diskon}
        />
        <SelectField
          id="tipe_diskon"
          label="Tipe Diskon"
          icon={InformationCircleIcon}
          defaultValue={diskon.tipe_diskon || ''}
          placeholder="Pilih tipe diskon"
          errors={state.errors?.tipe_diskon}
          options={[
            { id: "Persentase", label: "Persentase (%)" },
            { id: "Nominal", label: "Nominal (Rp)" },
          ]}
        />
        <FormField
          id="nilai_diskon"
          label="Nilai Diskon"
          icon={BanknotesIcon}
          type="number"
          placeholder="Masukkan nilai diskon"
          defaultValue={diskon.nilai_diskon || ''}
          errors={state.errors?.nilai_diskon}
        />
      </div>
      <FormFooter
        cancelHref={BASE}
        submitLabel="Update Diskon"
        message={state.message}
      />
    </form>
  );
}
