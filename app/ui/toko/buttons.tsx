"use client";

import {
  CreateButton,
  UpdateButton,
  DeleteButton,
} from "@/app/ui/shared/buttons";
import { deleteToko } from "@/app/lib/actions";

const BASE = "/laundry/pengaturan/toko";

export function CreateToko() {
  return <CreateButton href={`${BASE}/create`} label="Tambah Toko" />;
}

export function UpdateToko({ id }: { id: string }) {
  return <UpdateButton href={`${BASE}/${id}/edit`} />;
}

export function DeleteToko({
  id,
  onDeleteAction,
}: {
  id: string;
  onDeleteAction?: (id: string) => void;
}) {
  return (
    <DeleteButton
      action={deleteToko}
      id={id}
      onDeleteAction={onDeleteAction}
    />
  );
}
