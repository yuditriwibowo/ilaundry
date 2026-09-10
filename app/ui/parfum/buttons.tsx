"use client";

import { deleteParfum } from "@/app/lib/actions";
import { CreateButton, UpdateButton, DeleteButton } from "@/app/ui/shared/buttons";

const BASE = "/laundry/pengaturan/parfum";

export function CreateParfum() {
  return <CreateButton href={`${BASE}/create`} label="Tambah Parfum" />;
}

export function UpdateParfum({ id }: { id: string }) {
  return <UpdateButton href={`${BASE}/${id}/edit`} />;
}

export function DeleteParfum({
  id,
  onDeleteAction,
}: {
  id: string;
  onDeleteAction?: (id: string) => void;
}) {
  return (
    <DeleteButton
      id={id}
      action={deleteParfum}
      onDeleteAction={onDeleteAction}
    />
  );
}

