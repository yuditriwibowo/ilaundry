"use client";

import {
  TruckIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { createAntarJemput, State } from "@/app/lib/actions";
import { useActionState } from "react";
import { FormField, FormFooter } from "@/app/ui/shared/form-fields";

const BASE = "/laundry/pengaturan/antar-jemput";

export default function Form() {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(createAntarJemput, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <FormField
          id="nama_antar_jemput"
          label="Nama Antar-Jemput"
          icon={TruckIcon}
          placeholder="Masukkan nama antar-jemput"
          errors={state.errors?.nama_antar_jemput}
        />
        <FormField
          id="harga_antar_jemput"
          label="Harga Antar-Jemput"
          icon={BanknotesIcon}
          type="number"
          placeholder="Masukkan harga antar-jemput"
          errors={state.errors?.harga_antar_jemput}
        />
      </div>
      <FormFooter
        cancelHref={BASE}
        submitLabel="Tambah Antar-Jemput"
        message={state.message}
      />
    </form>
  );
}
