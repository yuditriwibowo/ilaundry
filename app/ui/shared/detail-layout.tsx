"use client";

import type { ComponentType, ReactNode } from "react";

/**
 * Layout detail-view generik untuk master data pengaturan:
 * header card (ikon + judul + "Terakhir diubah" + tombol aksi)
 * dan fieldset informasi (grid label:value).
 */
export default function DetailLayout({
  icon: Icon,
  title,
  lastUpdate,
  actions,
  sectionTitle,
  fields,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  lastUpdate?: ReactNode;
  actions: ReactNode;
  sectionTitle: string;
  fields: { label: string; value: ReactNode }[];
}) {
  return (
    <div className="w-full pb-10">
      {/* Header card */}
      <div className="mt-4 w-full rounded-lg bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-2 text-sm">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-base font-medium text-gray-900">
                {title}
              </p>
              {lastUpdate && (
                <p className="truncate text-gray-500 text-xs">
                  Terakhir diubah : {lastUpdate}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">{actions}</div>
        </div>
      </div>

      {/* Informasi */}
      <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          {sectionTitle}
        </legend>
        <div className="grid grid-cols-1 gap-x-8 text-xs text-gray-700 md:grid-cols-2 md:gap-y-1">
          {fields.map((field) => (
            <div
              key={field.label}
              className="flex items-center justify-between gap-3 border-b border-gray-100 py-2"
            >
              <span className="flex items-center gap-1.5 text-gray-500">
                <Icon className="h-4 w-4" />
                {field.label}
              </span>
              <span className="font-medium text-gray-900 text-right">
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
