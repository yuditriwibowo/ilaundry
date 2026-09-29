"use client";

import { useFormStatus } from "react-dom";
import { PowerIcon } from "@heroicons/react/24/outline";
import { signOutAction } from "@/app/lib/actions";

/**
 * Tombol Sign Out (semua peran) — ditampilkan di halaman Pengaturan.
 * Memanggil server action signOutAction (NextAuth) yang redirect ke "/".
 */
function SignOutButtonInner() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-[38px] w-auto shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center self-center rounded-full bg-red-500">
        <PowerIcon className="h-4 w-4 shrink-0 text-white" />
      </div>
      <span className="truncate">{pending ? "Keluar..." : "Sign Out"}</span>
    </button>
  );
}

export default function SignOutButton() {
  return (
    <form action={signOutAction} className="shrink-0">
      <SignOutButtonInner />
    </form>
  );
}
