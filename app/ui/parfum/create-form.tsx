"use client";
import { IdentificationIcon } from "@heroicons/react/24/outline";
import { createParfum, State } from "@/app/lib/actions";
import { useActionState } from "react";
import { FormField, FormFooter } from "@/app/ui/shared/form-fields";

const BASE = "/laundry/pengaturan/parfum";

export default function Form() {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(createParfum, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <FormField
          id="nama_parfum"
          label="Nama Parfum"
          icon={IdentificationIcon}
          placeholder="Masukkan nama parfum"
          errors={state.errors?.nama_parfum}
        />
      </div>
      <FormFooter
        cancelHref={BASE}
        submitLabel="Tambah Parfum"
        message={state.message}
      />
    </form>
  );
}

