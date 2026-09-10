"use client";
import {
  IdentificationIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { updateLayanan, State } from "@/app/lib/actions";
import { Layanan } from "@/app/lib/definitions";
import { useActionState } from "react";
import {
  FormField,
  SelectField,
  FormFooter,
} from "@/app/ui/shared/form-fields";

const BASE = "/laundry/pengaturan/layanan";

export default function EditLayananForm({
  layanan,
  optionsTipe,
  optionsDurasi,
}: {
  layanan: Layanan;
  optionsTipe: any[];
  optionsDurasi: any[];
}) {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(updateLayanan.bind(null, layanan.id), initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <SelectField
          id="tipe_id"
          label="Tipe Layanan"
          icon={BuildingStorefrontIcon}
          errors={state.errors?.tipe_id}
          defaultValue={layanan.tipe_id}
        >
          <option value="">Pilih Tipe Layanan</option>
          {optionsTipe.map((option) => (
            <option key={option.id} value={option.id}>
              {option.nama}
            </option>
          ))}
        </SelectField>

        <SelectField
          id="durasi_id"
          label="Durasi Layanan"
          icon={ClockIcon}
          errors={state.errors?.durasi_id}
          defaultValue={layanan.durasi_id}
        >
          <option value="">Pilih Durasi Layanan</option>
          {optionsDurasi.map((option) => (
            <option key={option.id} value={option.id}>
              {option.nama}{option.lama_durasi ? ` - ${option.lama_durasi} Jam` : ""}
            </option>
          ))}
        </SelectField>

        <FormField
          id="nama_layanan"
          label="Nama Layanan"
          icon={IdentificationIcon}
          placeholder="Masukkan nama layanan"
          errors={state.errors?.nama_layanan}
          defaultValue={layanan.nama_layanan}
        />

        <FormField
          id="harga"
          label="Harga Layanan"
          icon={CurrencyDollarIcon}
          type="number"
          placeholder="Masukkan harga layanan"
          errors={state.errors?.harga}
          defaultValue={layanan.harga}
        />
      </div>

      <FormFooter
        cancelHref={BASE}
        submitLabel="Update Layanan"
        message={state.message}
      />
    </form>
  );
}
