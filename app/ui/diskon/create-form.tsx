"use client";
import {
  TagIcon,
  BanknotesIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { createDiskon, State } from "@/app/lib/actions";
import { useActionState } from "react";
import { FormField, SelectField, FormFooter } from "@/app/ui/shared/form-fields";

const BASE = "/laundry/pengaturan/diskon";

export default function Form() {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(createDiskon, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <FormField
          id="nama_diskon"
          label="Nama Diskon"
          icon={TagIcon}
          placeholder="Masukkan nama diskon"
          errors={state.errors?.nama_diskon}
        />
        <SelectField
          id="tipe_diskon"
          label="Tipe Diskon"
          icon={InformationCircleIcon}
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
          errors={state.errors?.nilai_diskon}
        />
      </div>
      <FormFooter
        cancelHref={BASE}
        submitLabel="Tambah Diskon"
        message={state.message}
      />
    </form>
  );
}
