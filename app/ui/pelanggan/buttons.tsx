"use client";

import {
  CreateButton,
  UpdateButton,
  DeleteButton,
} from "@/app/ui/shared/buttons";
import { deletePelanggan } from "@/app/lib/actions";

const BASE = "/laundry/pelanggan";

export function CreatePelanggan() {
  return <CreateButton href={`${BASE}/create`} label="Tambah Pelanggan" />;
}

export function UpdatePelanggan({ id }: { id: string }) {
  return <UpdateButton href={`${BASE}/${id}/edit`} />;
}

export function DeletePelanggan({
  id,
  onDeleteAction,
}: {
  id: string;
  onDeleteAction?: (id: string) => void;
}) {
  return (
    <DeleteButton
      action={deletePelanggan}
      id={id}
      onDeleteAction={onDeleteAction}
    />
  );
}
