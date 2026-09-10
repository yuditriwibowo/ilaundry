'use client';
import { updateParfum, State } from '@/app/lib/actions';
import { Parfum } from '@/app/lib/definitions';
import { IdentificationIcon } from '@heroicons/react/24/outline';
import { useActionState } from 'react';
import { FormField, FormFooter } from '@/app/ui/shared/form-fields';

const BASE = '/laundry/pengaturan/parfum';

export default function EditParfumForm({
  parfum,
}: {
  parfum: Parfum;
}) {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(updateParfum.bind(null, parfum.id), initialState);
  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <FormField
          id="nama_parfum"
          label="Nama Parfum"
          icon={IdentificationIcon}
          placeholder="Masukkan nama parfum"
          defaultValue={parfum.nama_parfum || ''}
          errors={state.errors?.nama_parfum}
        />
      </div>
      <FormFooter
        cancelHref={BASE}
        submitLabel="Update Parfum"
        message={state.message}
      />
    </form>
  );
}

