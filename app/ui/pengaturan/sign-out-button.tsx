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
      className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-60 md:px-4 md:py-2 md:text-sm"
    >
      <PowerIcon className="h-4 w-4" />
      <span>{pending ? "Keluar..." : "Sign Out"}</span>
    </button>
  );
}

export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <SignOutButtonInner />
    </form>
  );
}
