"use client";

import { deleteInfoIklan } from "@/app/lib/actions";
import { CreateButton, UpdateButton, DeleteButton } from "@/app/ui/shared/buttons";

const BASE = "/laundry/pengaturan/info-iklan";

export function CreateInfoIklan() {
  return <CreateButton href={`${BASE}/create`} label="Tambah Info & Iklan" />;
}

export function UpdateInfoIklan({ id }: { id: string }) {
  return <UpdateButton href={`${BASE}/${id}/edit`} />;
}

export function DeleteInfoIklan({
  id,
  onDeleteAction,
}: {
  id: string;
  onDeleteAction?: (id: string) => void;
}) {
  return (
    <DeleteButton
      id={id}
      action={deleteInfoIklan}
      onDeleteAction={onDeleteAction}
      confirmMessage="Apakah Anda yakin akan menghapus info/iklan ini?"
    />
  );
}