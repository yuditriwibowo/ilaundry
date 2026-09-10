"use client";

import { deleteAntarJemput } from "@/app/lib/actions";
import {
  CreateButton,
  UpdateButton,
  DeleteButton,
} from "@/app/ui/shared/buttons";

const BASE = "/laundry/pengaturan/antar-jemput";

export function CreateAntarJemput() {
  return <CreateButton href={`${BASE}/create`} label="Tambah Antar-Jemput" />;
}

export function UpdateAntarJemput({ id }: { id: string }) {
  return <UpdateButton href={`${BASE}/${id}/edit`} />;
}

export function DeleteAntarJemput({
  id,
  onDeleteAction,
}: {
  id: string;
  onDeleteAction?: (id: string) => void;
}) {
  return (
    <DeleteButton
      action={deleteAntarJemput}
      id={id}
      onDeleteAction={onDeleteAction}
    />
  );
}
