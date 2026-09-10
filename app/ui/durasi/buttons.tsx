"use client";

import { deleteDurasi } from "@/app/lib/actions";
import { CreateButton, UpdateButton, DeleteButton } from "@/app/ui/shared/buttons";

const BASE = "/laundry/pengaturan/durasi";

export function CreateDurasi() {
  return <CreateButton href={`${BASE}/create`} label="Tambah Durasi" />;
}

export function UpdateDurasi({ id }: { id: string }) {
  return <UpdateButton href={`${BASE}/${id}/edit`} />;
}

export function DeleteDurasi({
  id,
  onDeleteAction,
}: {
  id: string;
  onDeleteAction?: (id: string) => void;
}) {
  return (
    <DeleteButton
      id={id}
      action={deleteDurasi}
      onDeleteAction={onDeleteAction}
    />
  );
}

