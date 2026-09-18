import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth-nextauth";
import { sql } from "./db";
import type { Peran, TokoAssignment } from "./definitions";

export type { Peran, TokoAssignment } from "./definitions";

/**
 * Data sesi user hasil login (dari JWT NextAuth).
 * - peran : peran efektif pada toko terpilih (dipakai untuk otorisasi)
 * - tokos : daftar toko yang di-assign ke user (tabel user_toko)
 */
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  peran: Peran | null;
  tokoId: string | null;
  tokos: TokoAssignment[];
};

/**
 * Context sesi + toko aktif untuk satu request.
 * - selectedTokoId : cookie selected_toko, TELAH divalidasi membership
 *   (non-Administrator hanya boleh toko miliknya → menutup celah
 *   tenant-hopping via cookie).
 * - peran          : peran efektif pada toko terpilih.
 */
export type SessionContext = {
  user: SessionUser;
  peran: Peran | null;
  isAdmin: boolean;
  selectedTokoId: string;
};

/** Sesi NextAuth (tanpa redirect). null = belum login. Di-cache per request. */
export const getSessionUser = cache(
  async (): Promise<SessionUser | null> => {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }
    return {
      id: session.user.id,
      name: session.user.name ?? "",
      email: session.user.email ?? "",
      peran: session.user.peran ?? null,
      tokoId: session.user.tokoId,
      tokos: session.user.tokoList ?? [],
    };
  },
);

/**
 * Auth guard untuk semua server action & halaman.
 * Jika sesi tidak ada, user dialihkan ke halaman depan (form login).
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/");
  }
  return user;
}

/** Context lengkap (user + peran + toko aktif tervalidasi). Di-cache per request. */
export const getSessionContext = cache(
  async (): Promise<SessionContext> => {
    const user = await getCurrentUser();
    const isAdmin = user.peran === "Administrator";

    const cookieStore = await cookies();
    let selectedTokoId = cookieStore.get("selected_toko")?.value ?? "";
    const assigned = selectedTokoId
      ? user.tokos.find((t) => t.tokoId === selectedTokoId)
      : undefined;

    if (!isAdmin) {
      // Non-Administrator: cookie harus toko miliknya sendiri.
      if (!assigned) {
        selectedTokoId =
          user.tokoId && user.tokos.some((t) => t.tokoId === user.tokoId)
            ? user.tokoId
            : (user.tokos[0]?.tokoId ?? "");
      }
    } else if (selectedTokoId) {
      // Administrator boleh toko mana pun, tapi tetap verifikasi keberadaan.
      const exists = await sql<{ id: string }[]>`
        SELECT id FROM toko WHERE id = ${selectedTokoId}
      `;
      if (exists.length === 0) {
        selectedTokoId = user.tokoId ?? user.tokos[0]?.tokoId ?? "";
      }
    } else {
      selectedTokoId = user.tokoId ?? user.tokos[0]?.tokoId ?? "";
    }

    // Peran efektif pada toko aktif:
    // - Administrator selalu 'Administrator' (berlaku global);
    // - selain itu peran assignment toko terpilih, fallback peran sesi.
    const peran: Peran | null = isAdmin
      ? "Administrator"
      : (assigned?.peran ?? user.peran ?? null);

    return { user, peran, isAdmin, selectedTokoId };
  },
);

// ===================== Otorisasi granular =====================
// Semua peran BOLEH MELIHAT menu/halaman pengaturan (tidak disembunyikan).
// Yang dibatasi adalah FUNGSI di dalamnya, diverifikasi di sisi server.

const MANAGE_MASTER_PERANS: Peran[] = [
  "Administrator",
  "Account_Owner",
  "Manager",
];

/** CRUD master data (durasi, layanan, parfum, diskon, antar-jemput, toko). */
export function canManageMasterData(peran: Peran | null): boolean {
  return peran !== null && MANAGE_MASTER_PERANS.includes(peran);
}

/**
 * Membuat toko baru: hanya Administrator, atau user yang memiliki
 * assignment Account_Owner di toko mana pun.
 */
export function canCreateToko(ctx: SessionContext): boolean {
  if (ctx.isAdmin) return true;
  return ctx.user.tokos.some((t) => t.peran === "Account_Owner");
}

/** Kelola user-toko (assign/edit/hapus user pada toko aktif). */
export function canManageUserToko(ctx: SessionContext): boolean {
  if (ctx.isAdmin) return true;
  return ctx.peran === "Administrator" || ctx.peran === "Account_Owner";
}
