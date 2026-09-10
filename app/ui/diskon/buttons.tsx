"use client";

import { deleteDiskon } from "@/app/lib/actions";
import {
  CreateButton,
  UpdateButton,
  DeleteButton,
} from "@/app/ui/shared/buttons";

const BASE = "/laundry/pengaturan/diskon";

export function CreateDiskon() {
  return <CreateButton href={`${BASE}/create`} label="Tambah Diskon" />;
}

export function UpdateDiskon({ id }: { id: string }) {
  return <UpdateButton href={`${BASE}/${id}/edit`} />;
}

export function DeleteDiskon({
  id,
  onDeleteAction,
}: {
  id: string;
  onDeleteAction?: (id: string) => void;
}) {
  return (
    <DeleteButton
      action={deleteDiskon}
      id={id}
      onDeleteAction={onDeleteAction}
    />
  );
}
