"use server";

import { cookies } from "next/headers";
import { getSessionContext } from "../auth";

/**
 * Simpan/ubah toko aktif di cookie selected_toko.
 * Divalidasi: user hanya boleh memilih toko yang di-assign ke dirinya
 * (tabel user_toko). Administrator boleh memilih toko mana pun.
 */
export async function setSelectedTokoAction(tokoId: string) {
  const ctx = await getSessionContext();
  const allowed =
    ctx.isAdmin || ctx.user.tokos.some((t) => t.tokoId === tokoId);

  if (tokoId && allowed) {
    const cookieStore = await cookies();
    cookieStore.set("selected_toko", tokoId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });
  } else if (!tokoId) {
    const cookieStore = await cookies();
    cookieStore.delete("selected_toko");
  }
}
