"use server";

import { cookies } from "next/headers";
import { getCurrentUser } from "../auth";

export async function setSessionUserId() {
  const cookieStore = await cookies();
  cookieStore.set("user_id", "410544b2-4001-4271-9855-fec4b6a6442a", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 30, // 30 hari
  });
}

export async function setSelectedTokoAction(tokoId: string) {
  await getCurrentUser();
  const cookieStore = await cookies();
  if (tokoId) {
    cookieStore.set("selected_toko", tokoId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });
  } else {
    cookieStore.delete("selected_toko");
  }
}
