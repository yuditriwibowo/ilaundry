"use client";
import {
  IdentificationIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { createDurasi, State } from "@/app/lib/actions";
import { useActionState } from "react";
import { FormField, FormFooter } from "@/app/ui/shared/form-fields";

const BASE = "/laundry/pengaturan/durasi";

export default function Form() {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(createDurasi, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <FormField
          id="nama_durasi"
          label="Nama Durasi Layanan"
          icon={IdentificationIcon}
          placeholder="Masukkan nama durasi layanan"
          errors={state.errors?.nama_durasi}
        />
        <FormField
          id="lama_durasi"
          label="Lama Durasi (Jam)"
          icon={ClockIcon}
          type="number"
          placeholder="Masukkan angka lama durasi dalam jam"
          errors={state.errors?.lama_durasi}
        />
      </div>
      <FormFooter
        cancelHref={BASE}
        submitLabel="Tambah Durasi"
        message={state.message}
      />
    </form>
  );
}

