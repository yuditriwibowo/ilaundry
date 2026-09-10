"use client";

import { useRouter } from "next/navigation";
import type { ComponentType, ReactNode } from "react";

/**
 * Kartu item mobile untuk InfiniteList generik + baris tabel desktop.
 * Menyatukan markup yang sebelumnya diduplikasi di table-row.tsx dan
 * infinite-list.tsx per domain.
 */

/**
 * Baris tabel desktop yang bisa diklik menuju detail.
 * `actions` dibungkus td dengan stopPropagation agar klik tombol
 * edit/hapus tidak memicu navigasi baris.
 */
export function EntityTableRow({
  detailHref,
  children,
  actions,
}: {
  detailHref: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(detailHref)}
      className="w-full border-b py-3 text-sm last-of-type:border-none cursor-pointer transition-colors hover:bg-primary-50/40 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
    >
      {children}
      <td
        className="whitespace-nowrap py-3 pl-6 pr-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end gap-2">{actions}</div>
      </td>
    </tr>
  );
}

/**
 * Sel pertama baris: ikon dalam kotak primary + nama entitas.
 */
export function EntityNameCell({
  icon: Icon,
  name,
}: {
  icon: ComponentType<{ className?: string }>;
  name: ReactNode;
}) {
  return (
    <td className="whitespace-nowrap py-3 pl-6 pr-3">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <p className="font-medium">{name}</p>
      </div>
    </td>
  );
}

/**
 * Kartu mobile yang bisa diklik (tap / Enter / Space) menuju detail.
 * `actions` dibungkus div dengan stopPropagation.
 */
export function EntityCard({
  detailHref,
  ariaLabel,
  icon: Icon,
  title,
  subtitle,
  actions,
}: {
  detailHref: string;
  ariaLabel: string;
  icon: ComponentType<{ className?: string }>;
  title: ReactNode;
  subtitle?: ReactNode;
  actions: ReactNode;
}) {
  const router = useRouter();

  return (
    <div
      role="button"
      aria-label={ariaLabel}
      tabIndex={0}
      onClick={() => router.push(detailHref)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          router.push(detailHref);
        }
      }}
      className="mb-2 w-full rounded-lg bg-white p-4 shadow-sm cursor-pointer transition-colors hover:bg-gray-50 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2 text-sm">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-base font-medium text-gray-900">
              {title}
            </p>
            {subtitle && <p className="truncate text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <div
          className="flex shrink-0 gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      </div>
    </div>
  );
}
