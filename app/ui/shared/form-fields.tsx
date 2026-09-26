"use client";

import { useState } from "react";
import Image from "next/image";
import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import SelectPopup, { type OpsiSelect } from "@/app/ui/shared/select-popup";
import KalenderTanggal from "@/app/ui/shared/kalender-tanggal";
import { formatTanggal } from "@/app/ui/shared/kalender-utils";

/**
 * Field form generik untuk create/edit master data.
 * Menyatukan markup yang sebelumnya diduplikasi di semua form per domain:
 * label + input/select dengan ikon + error Zod dari useActionState.
 * Select memakai pola popup dengan pencarian (SelectPopup) yang sama
 * dengan SelectPelanggan.
 */

type BaseFieldProps = {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  placeholder?: string;
  errors?: string[];
};

export function FormField({
  id,
  label,
  icon: Icon,
  placeholder,
  errors,
  type = "text",
  defaultValue,
  required,
}: BaseFieldProps & {
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          aria-describedby={`${id}-error`}
        />
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
        )}
      </div>
      <div id={`${id}-error`} aria-live="polite" aria-atomic="true">
        {errors?.map((error: string) => (
          <p className="mt-2 text-sm text-red-500" key={error}>
            {error}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * Field upload file gambar (mis. Info & Iklan).
 * File dikirim ke server action via FormData lalu disimpan ke
 * /public/carousel/ (lihat saveUploadedImage di app/lib/actions).
 * Preview menampilkan gambar saat ini (dari DB) dan otomatis berpindah
 * ke file yang baru dipilih (blob URL, memakai unoptimized).
 */
export function FormFile({
  id,
  label,
  errors,
  accept = "image/*",
  previewUrl,
  hint,
}: BaseFieldProps & {
  accept?: string;
  previewUrl?: string;
  hint?: string;
}) {
  const [preview, setPreview] = useState<string | null>(previewUrl ?? null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {preview && (
          <Image
            src={preview}
            alt={`Pratinjau ${label}`}
            width={96}
            height={96}
            unoptimized
            className="h-24 w-24 shrink-0 rounded-lg border border-gray-200 object-cover"
          />
        )}
        <input
          id={id}
          name={id}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="block w-full cursor-pointer rounded-md border border-gray-200 text-sm text-gray-900 file:mr-3 file:cursor-pointer file:rounded-l-md file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary-500"
          aria-describedby={`${id}-error`}
        />
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      <div id={`${id}-error`} aria-live="polite" aria-atomic="true">
        {errors?.map((error: string) => (
          <p className="mt-2 text-sm text-red-500" key={error}>
            {error}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * Field pilih tanggal — DatePicker custom KalenderTanggal (sama dengan
 * yang dipakai menu Laporan/pilih-periode-popup), bukan <input type="date">
 * native agar tampilannya mengikuti Mode Display aplikasi di semua platform.
 * Hanya memilih TANGGAL; bagian waktu ditentukan server action
 * (mis. mulai 00:00, selesai akhir hari). Nilai dikirim ke formData
 * sebagai ISO "YYYY-MM-DD" lewat hidden input.
 */
export function FormDatePicker({
  id,
  label,
  errors,
  defaultValue,
  minDate = "",
  maxDate = "",
  hint,
}: BaseFieldProps & {
  // Tanggal terpilih awal (ISO "YYYY-MM-DD"); kosong = belum dipilih.
  defaultValue?: string;
  // Batas pilihan (inklusif, ISO); kosong = tanpa batas.
  minDate?: string;
  maxDate?: string;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>(defaultValue ?? "");

  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-md border border-gray-200 py-2 pl-3 pr-3 text-sm text-gray-900 transition-colors hover:bg-gray-50"
      >
        <span>{formatTanggal(value) || "Pilih tanggal"}</span>
        <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
      </button>
      {/* Hidden input: nilai terkirim ke server action sebagai "YYYY-MM-DD" */}
      <input type="hidden" name={id} value={value} />
      {open && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <KalenderTanggal
            value={value}
            minDate={minDate}
            maxDate={maxDate}
            onSelectAction={(iso) => {
              setValue(iso);
              setOpen(false);
            }}
            judul={`Pilih ${label}`}
          />
        </div>
      )}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      <div id={`${id}-error`} aria-live="polite" aria-atomic="true">
        {errors?.map((error: string) => (
          <p className="mt-2 text-sm text-red-500" key={error}>
            {error}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * Field textarea untuk teks panjang (mis. deskripsi Info & Iklan).
 * Markup sama dengan FormField: label + error Zod dari useActionState.
 */
export function FormTextarea({
  id,
  label,
  placeholder,
  errors,
  defaultValue,
  rows = 3,
}: BaseFieldProps & {
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
        aria-describedby={`${id}-error`}
      />
      <div id={`${id}-error`} aria-live="polite" aria-atomic="true">
        {errors?.map((error: string) => (
          <p className="mt-2 text-sm text-red-500" key={error}>
            {error}
          </p>
        ))}
      </div>
    </div>
  );
}

export function SelectField({
  id,
  label,
  icon: Icon,
  errors,
  defaultValue,
  placeholder,
  dialogTitle,
  searchPlaceholder,
  emptyMessage,
  resultLabel,
  options,
  children,
}: BaseFieldProps & {
  defaultValue?: string;
  placeholder?: string;
  dialogTitle?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  resultLabel?: string;
  options?: OpsiSelect[];
  children?: ReactNode;
}) {
  // Opsi bisa lewat prop `options` (bentuk {id,label,description}) atau
  // `children` berisi <option> (dipetakan ke OpsiSelect agar tetap satu pola).
  const resolvedOptions: OpsiSelect[] =
    options ??
    (Array.isArray(children)
      ? (children as { props: { value?: string; children?: unknown } }[])
          .filter((child) => child?.props?.value !== undefined)
          .map((child) => ({
            id: String(child.props.value),
            label: renderLabel(child.props.children),
          }))
      : []);

  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <SelectPopup
          id={id}
          name={id}
          defaultValue={defaultValue}
          placeholder={placeholder ?? `Pilih ${label}`}
          dialogTitle={dialogTitle ?? `Pilih ${label}`}
          searchPlaceholder={searchPlaceholder ?? "Cari..."}
          emptyMessage={emptyMessage ?? "Tidak ditemukan"}
          resultLabel={resultLabel ?? "hasil ditemukan"}
          icon={Icon}
          options={resolvedOptions}
        />
      </div>
      <div id={`${id}-error`} aria-live="polite" aria-atomic="true">
        {errors?.map((error: string) => (
          <p className="mt-2 text-sm text-red-500" key={error}>
            {error}
          </p>
        ))}
      </div>
    </div>
  );
}

// Ambil teks label dari children <option> (bisa string atau nested).
function renderLabel(children: unknown): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(renderLabel).join("");
  }
  return "";
}

/**
 * Footer form: tombol Batal (link kembali) + submit + pesan error umum.
 */
export function FormFooter({
  cancelHref,
  submitLabel,
  message,
}: {
  cancelHref: string;
  submitLabel: string;
  message?: string;
}) {
  return (
    <>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href={cancelHref}
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Batal
        </Link>
        <Button type="submit">{submitLabel}</Button>
      </div>

      {/* General Form Message */}
      <div className="mt-4 text-center">
        {message && <p className="text-sm text-red-500">{message}</p>}
      </div>
    </>
  );
}
