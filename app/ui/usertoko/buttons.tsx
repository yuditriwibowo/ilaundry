"use client";

import {
  CreateButton,
  UpdateButton,
  DeleteButton,
} from "@/app/ui/shared/buttons";
import { deleteUserToko } from "@/app/lib/actions";

const BASE = "/laundry/pengaturan/usertoko";

export function CreateUserToko() {
  return <CreateButton href={`${BASE}/create`} label="Tambah User Toko" />;
}

export function UpdateUserToko({ id }: { id: string }) {
  return <UpdateButton href={`${BASE}/${id}/edit`} />;
}

export function DeleteUserToko({
  id,
  onDeleteAction,
}: {
  id: string;
  onDeleteAction?: (id: string) => void;
}) {
  return (
    <DeleteButton
      action={deleteUserToko}
      id={id}
      onDeleteAction={onDeleteAction}
    />
  );
}
