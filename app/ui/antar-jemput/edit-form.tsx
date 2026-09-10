'use client';

import { updateAntarJemput, State } from '@/app/lib/actions';
import { AntarJemput } from '@/app/lib/definitions';
import {
  TruckIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useActionState } from 'react';
import { FormField, FormFooter } from '@/app/ui/shared/form-fields';

const BASE = '/laundry/pengaturan/antar-jemput';

export default function EditAntarJemputForm({
  antarJemput,
}: {
  antarJemput: AntarJemput;
}) {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(updateAntarJemput.bind(null, antarJemput.id), initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <FormField
          id="nama_antar_jemput"
          label="Nama Antar-Jemput"
          icon={TruckIcon}
          placeholder="Masukkan nama antar-jemput"
          defaultValue={antarJemput.nama_antar_jemput || ''}
          errors={state.errors?.nama_antar_jemput}
        />
        <FormField
          id="harga_antar_jemput"
          label="Harga Antar-Jemput"
          icon={BanknotesIcon}
          type="number"
          placeholder="Masukkan harga antar-jemput"
          defaultValue={antarJemput.harga_antar_jemput ?? ''}
          errors={state.errors?.harga_antar_jemput}
        />
      </div>
      <FormFooter
        cancelHref={BASE}
        submitLabel="Update Antar-Jemput"
        message={state.message}
      />
    </form>
  );
}
