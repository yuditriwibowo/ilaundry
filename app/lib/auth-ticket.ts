import crypto from "crypto";
import type { TokoAssignment } from "./definitions";

/**
 * Ticket login bertanda-tangan HMAC (Varian A — "tanpa query di fase 2").
 *
 * Dibuat oleh verifyCredentials SETELAH password terverifikasi, dan membawa
 * identitas + daftar toko user. Fase lanjutan (completeLogin) serta authorize()
 * di NextAuth cukup memverifikasi tanda tangan ticket ini — TANPA query DB
 * ulang dan tanpa bcrypt kedua.
 *
 * Format : <base64url(payload JSON)>.<base64url(HMAC-SHA256(payload))>
 * TTL    : 10 menit. Ticket hanya hidup di memori form login (state React),
 *          tidak pernah disimpan ke cookie/storage.
 * Keamanan: payload hanya ditandatangani (bukan dienkripsi) — sama amannya
 *          dengan ticket lama yang memuat email & userId secara polos.
 */
export type LoginTicketPayload = {
  purpose: "login";
  userId: string;
  name: string;
  email: string;
  tokos: TokoAssignment[];
  exp: number;
};

const TICKET_TTL_MS = 10 * 60 * 1000; // 10 menit

function hmac(data: string): string {
  const secret = process.env.AUTH_SECRET || "default_auth_secret";
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export function createLoginTicket(
  user: { id: string; name: string; email: string },
  tokos: TokoAssignment[],
): string {
  const payload: LoginTicketPayload = {
    purpose: "login",
    userId: user.id,
    name: user.name,
    email: user.email,
    tokos,
    exp: Date.now() + TICKET_TTL_MS,
  };
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${data}.${hmac(data)}`;
}

/**
 * Validasi ticket. Mengembalikan payload bila tanda tangan cocok, belum
 * kedaluwarsa, dan (bila expectedEmail diisi) email-nya cocok.
 * Selain itu mengembalikan null — pemanggil wajib menolak.
 */
export function verifyLoginTicket(
  ticket: string,
  expectedEmail?: string,
): LoginTicketPayload | null {
  try {
    const parts = ticket.split(".");
    if (parts.length !== 2) return null;
    const [data, sig] = parts;
    if (!data || !sig) return null;

    const expected = hmac(data);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8"),
    ) as LoginTicketPayload;
    if (payload.purpose !== "login") return null;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    if (!payload.userId || !payload.email || !Array.isArray(payload.tokos)) return null;
    if (
      expectedEmail &&
      payload.email.toLowerCase() !== expectedEmail.toLowerCase()
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}


