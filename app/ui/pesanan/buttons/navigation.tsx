"use client";

// Tombol navigasi sederhana (link) di modul pesanan.

import Link from "next/link";
import { EyeIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import { actionButtonClass } from "./shared";

export function CreatePesanan() {
  return (
    <Link
      href="/laundry/pesanan/create"
      className="flex h-10 items-center rounded-xl border border-gray-200 bg-gray-50 text-blue-600 md:border-transparent md:bg-gradient-to-r md:from-blue-600 md:to-indigo-600 md:text-white px-4 text-sm font-bold transition-all hover:bg-blue-50 md:hover:from-blue-700 md:hover:to-indigo-700 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Tambah Pesanan</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function ViewPesananDetail({ id }: { id: string }) {
  return (
    <Link
      href={`/laundry/pesanan/${id}/detail`}
      title="Lihat Detail"
      className={`${actionButtonClass} border-slate-200 bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`}
    >
      <span className="sr-only">Lihat Detail</span>
      <EyeIcon className="h-4 w-4" />
    </Link>
  );
}

export function UpdatePesanan({ id }: { id: string }) {
  return (
    <Link
      href={`/laundry/pesanan/${id}/edit`}
      title="Edit"
      className={`${actionButtonClass} border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`}
    >
      <span className="sr-only">Edit</span>
      <PencilIcon className="h-4 w-4" />
    </Link>
  );
}

export function CreateItemPesananButton({ pesananId }: { pesananId: string }) {
  return (
    <Link
      href={`/laundry/pesanan/${pesananId}/item/create`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-primary-600 bg-primary-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
    >
      <PlusIcon className="h-4 w-4" />
      <span>Tambah Item Pesanan</span>
    </Link>
  );
}
