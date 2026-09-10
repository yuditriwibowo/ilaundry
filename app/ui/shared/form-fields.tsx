"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/app/ui/button";

/**
 * Field form generik untuk create/edit master data.
 * Menyatukan markup yang sebelumnya diduplikasi di semua form per domain:
 * label + input/select dengan ikon + error Zod dari useActionState.
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

export function SelectField({
  id,
  label,
  icon: Icon,
  errors,
  defaultValue,
  children,
}: BaseFieldProps & {
  defaultValue?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={id}
          defaultValue={defaultValue}
          className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          aria-describedby={`${id}-error`}
        >
          {children}
        </select>
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
