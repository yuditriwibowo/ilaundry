"use client";
import { IdentificationIcon, LinkIcon } from "@heroicons/react/24/outline";
import { createInfoIklan, State } from "@/app/lib/actions";
import { useActionState } from "react";
import {
  FormField,
  FormFooter,
  FormDatePicker,
  FormFile,
  FormTextarea,
} from "@/app/ui/shared/form-fields";

const BASE = "/laundry/pengaturan/info-iklan";

export default function Form() {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(createInfoIklan, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Landscape: 2 kolom (kiri: konten, kanan: link & masa berlaku).
            Portrait: tetap 1 kolom dengan urutan yang sama. */}
        <div className="grid grid-cols-1 landscape:grid-cols-2 gap-x-4">
          {/* Kolom kiri: konten info/iklan */}
          <div>
            <FormField
              id="title"
              label="Judul"
              icon={IdentificationIcon}
              placeholder="Masukkan judul info/iklan"
              errors={state.errors?.title}
              required
            />
            <FormTextarea
              id="description"
              label="Deskripsi"
              placeholder="Masukkan deskripsi info/iklan"
              errors={state.errors?.description}
            />
            <FormFile
              id="image_src"
              label="Gambar"
              errors={state.errors?.image_src}
              hint="Format: jpg, png, webp, gif, avif, atau svg. Maksimal 5 MB. (opsional)"
            />
          </div>

          {/* Kolom kanan: link & masa berlaku */}
          <div>
            <FormField
              id="link"
              label="Link Tujuan"
              icon={LinkIcon}
              placeholder="https://contoh.com atau /laundry/pesanan"
              errors={state.errors?.link}
            />
            <FormDatePicker
              id="start"
              label="Mulai Berlaku"
              errors={state.errors?.start}
            />
            <FormDatePicker
              id="end"
              label="Selesai Berlaku"
              errors={state.errors?.end}
            />
            <p className="text-xs text-gray-500">
              Kosongkan kolom Mulai Berlaku agar langsung berlaku sekarang,
              dan kosongkan kolom Selesai Berlaku agar berlaku tanpa batas
              waktu.
            </p>
          </div>
        </div>
      </div>
      <FormFooter
        cancelHref={BASE}
        submitLabel="Tambah Info & Iklan"
        message={state.message}
      />
    </form>
  );
}