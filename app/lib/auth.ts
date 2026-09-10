import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type SessionUser = {
  id: string;
};

/**
 * Auth guard (versi dev): membaca cookie `user_id` yang di-set lewat tombol
 * "Mulai" di halaman depan (setSessionUserId di app/lib/actions.ts).
 *
 * Setiap server action memanggil fungsi ini di baris pertama sebagai guard.
 * Jika sesi tidak ada, user dialihkan ke halaman depan untuk "login" dev.
 *
 * TODO(nanti): ganti isi fungsi ini dengan next-auth, contoh:
 *   const session = await auth();
 *   if (!session?.user?.id) redirect("/login");
 *   return { id: session.user.id };
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    redirect("/");
  }

  return { id: userId };
}
