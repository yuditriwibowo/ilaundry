"use client";

import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { UpdateUserToko, DeleteUserToko } from "@/app/ui/usertoko/buttons";
import { TabelUserToko } from "@/app/lib/definitions";

export default function UserTokoTableRow({ userToko }: { userToko: TabelUserToko }) {
  const router = useRouter();
  const itemId = userToko.id || userToko.name;

  return (
    <tr
      onClick={() => router.push(`/laundry/pengaturan/usertoko/${itemId}/detail`)}
      className="w-full border-b py-3 text-sm last-of-type:border-none cursor-pointer transition-colors hover:bg-primary-50/40 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
    >
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
            <Users className="h-4 w-4 text-white" />
          </div>
          <p className="font-medium">{userToko.name}</p>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {userToko.nama_toko}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {userToko.peran}
      </td>
      <td
        className="whitespace-nowrap py-3 pl-6 pr-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end gap-2">
          <UpdateUserToko id={itemId} />
          <DeleteUserToko id={itemId} />
        </div>
      </td>
    </tr>
  );
}
