"use client";

import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { deleteUserToko } from "@/app/lib/actions";

export function CreateUserToko() {
  return (
    <Link
      href="/laundry/pengaturan/usertoko/create"
      className="flex h-10 items-center rounded-lg bg-white text-primary-600 md:bg-primary-600 md:text-white px-4 text-sm font-medium transition-colors hover:bg-primary-50 md:hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
    >
      <span className="hidden md:block">Tambah User Toko</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateUserToko({ id }: { id: string }) {
  return (
    <Link
      href={`/laundry/pengaturan/usertoko/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteUserToko({ 
  id, 
  onDeleteAction 
}: { 
  id: string; 
  onDeleteAction?: (id: string) => void; 
}) {
  async function handleDelete() {
    await deleteUserToko(id);
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
      <span className="sr-only">Delete</span>
      <TrashIcon className="w-5" />
    </button>
  );
}
