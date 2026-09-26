'use client';
import { IdentificationIcon, LinkIcon } from '@heroicons/react/24/outline';
import { updateInfoIklan, State } from '@/app/lib/actions';
import { InfoIklan } from '@/app/lib/definitions';
import { useActionState } from 'react';
import {
  FormField,
  FormFooter,
  FormDatePicker,
  FormFile,
  FormTextarea,
} from '@/app/ui/shared/form-fields';

const BASE = '/laundry/pengaturan/info-iklan';

// timestamptz ISO -> "YYYY-MM-DD" (tanggal lokal, untuk DatePicker).
function isoToTanggal(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

export default function EditInfoIklanForm({
  infoIklan,
}: {
  infoIklan: InfoIklan;
}) {
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(
    updateInfoIklan.bind(null, infoIklan.id),
    initialState,
  );

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
              defaultValue={infoIklan.title || ''}
              errors={state.errors?.title}
              required
            />
            <FormTextarea
              id="description"
              label="Deskripsi"
              placeholder="Masukkan deskripsi info/iklan"
              defaultValue={infoIklan.description || ''}
              errors={state.errors?.description}
            />
            <FormFile
              id="image_src"
              label="Gambar"
              previewUrl={infoIklan.image_src || undefined}
              errors={state.errors?.image_src}
              hint="Format: jpg, png, webp, gif, avif, atau svg. Maksimal 5 MB. Biarkan kosong bila tidak ingin mengganti."
            />
          </div>

          {/* Kolom kanan: link & masa berlaku */}
          <div>
            <FormField
              id="link"
              label="Link Tujuan"
              icon={LinkIcon}
              placeholder="https://contoh.com atau /laundry/pesanan"
              defaultValue={infoIklan.link || ''}
              errors={state.errors?.link}
            />
            <FormDatePicker
              id="start"
              label="Mulai Berlaku"
              defaultValue={isoToTanggal(infoIklan.start)}
              errors={state.errors?.start}
            />
            <FormDatePicker
              id="end"
              label="Selesai Berlaku"
              defaultValue={isoToTanggal(infoIklan.end)}
              errors={state.errors?.end}
            />
            <p className="text-xs text-gray-500">
              Kosongkan kolom Selesai Berlaku agar berlaku tanpa batas waktu.
            </p>
          </div>
        </div>
      </div>
      <FormFooter
        cancelHref={BASE}
        submitLabel="Update Info & Iklan"
        message={state.message}
      />
    </form>
  );
}