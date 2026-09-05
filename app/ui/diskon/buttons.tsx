"use client";

import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { deleteDiskon } from "@/app/lib/actions";

export function CreateDiskon() {
  return (
    <Link
      href="/laundry/pengaturan/diskon/create"
      className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 text-primary-600 md:border-primary-600 md:bg-primary-600 md:text-white px-4 text-sm font-medium transition-colors hover:bg-primary-50 md:hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
    >
      <span className="hidden md:block">Tambah Diskon</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateDiskon({ id }: { id: string }) {
  return (
    <Link
      href={`/laundry/pengaturan/diskon/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteDiskon({ 
  id, 
  onDeleteAction 
}: { 
  id: string; 
  onDeleteAction?: (id: string) => void; 
}) {
  async function handleDelete() {
    await deleteDiskon(id);
    if (onDeleteAction) {
      onDeleteAction(id);
    }
  }

  return (
    <button 
      onClick={async () => {
        await handleDelete();
      }}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <span className="sr-only">Hapus</span>
      <TrashIcon className="w-5" />
    </button>
  );
}
