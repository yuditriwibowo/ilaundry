"use client";

import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { deleteDurasi } from "@/app/lib/actions";

export function CreateDurasi() {
  return (
    <Link
      href="/laundry/pengaturan/durasi/create"
      className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 text-primary-600 md:border-primary-600 md:bg-primary-600 md:text-white px-4 text-sm font-medium transition-colors hover:bg-primary-50 md:hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
    >
      <span className="hidden md:block">Tambah Durasi</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

const actionButtonClass =
  "flex h-8 w-8 items-center justify-center rounded-full border p-2 transition-colors hover:bg-gray-100";

export function UpdateDurasi({ id }: { id: string }) {
  return (
    <Link
      href={`/laundry/pengaturan/durasi/${id}/edit`}
      title="Edit"
      className={`${actionButtonClass} border-gray-200 text-gray-600`}
    >
      <span className="sr-only">Edit</span>
      <PencilIcon className="h-4 w-4" />
    </Link>
  );
}

export function DeleteDurasi({ 
  id, 
  onDeleteAction 
}: { 
  id: string; 
  onDeleteAction?: (id: string) => void; 
}) {
  async function handleDelete() {
    await deleteDurasi(id);
    if (onDeleteAction) {
      onDeleteAction(id);
    }
  }

  return (
    <button
      onClick={async () => {
        await handleDelete();
      }}
      title="Hapus"
      className={`${actionButtonClass} border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600`}
    >
      <span className="sr-only">Hapus</span>
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
