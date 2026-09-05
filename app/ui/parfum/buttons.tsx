"use client";

import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { deleteParfum } from "@/app/lib/actions";

export function CreateParfum() {
  return (
    <Link
      href="/laundry/pengaturan/parfum/create"
      className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 text-primary-600 md:border-primary-600 md:bg-primary-600 md:text-white px-4 text-sm font-medium transition-colors hover:bg-primary-50 md:hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
    >
      <span className="hidden md:block">Tambah Parfum</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateParfum({ id }: { id: string }) {
  return (
    <Link
      href={`/laundry/pengaturan/parfum/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteParfum({ 
  id, 
  onDeleteAction 
}: { 
  id: string; 
  onDeleteAction?: (id: string) => void; 
}) {
  async function handleDelete() {
    await deleteParfum(id);
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
