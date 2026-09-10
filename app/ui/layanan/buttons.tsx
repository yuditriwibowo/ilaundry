"use client";

import {
  CreateButton,
  UpdateButton,
  DeleteButton,
} from "@/app/ui/shared/buttons";
import { deleteLayanan } from "@/app/lib/actions";

const BASE = "/laundry/pengaturan/layanan";

export function CreateLayanan() {
  return <CreateButton href={`${BASE}/create`} label="Tambah Layanan" />;
}

export function UpdateLayanan({ id }: { id: string }) {
  return <UpdateButton href={`${BASE}/${id}/edit`} />;
}

export function DeleteLayanan({
  id,
  onDeleteAction,
}: {
  id: string;
  onDeleteAction?: (id: string) => void;
}) {
  return (
    <DeleteButton
      action={deleteLayanan}
      id={id}
      onDeleteAction={onDeleteAction}
    />
  );
}
