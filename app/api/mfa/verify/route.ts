// Route handler verifikasi kode MFA: POST /api/mfa/verify.
// Dipanggil otomatis oleh form pendaftaran saat 6 digit selesai diisi
// untuk umpan balik instan. Verifikasi FINAL tetap dilakukan ulang di
// server action registerAccount (defense in depth).
//
// Cek: kode harus cocok dengan kode TERAKHIR untuk (email, tipe
// 'registrasi') dan belum melewati expired_at (3 menit). Kode salah ->
// 200 { ok: false } (klien menampilkan pesan & mengosongkan kotak).

import { z } from "zod";
import { cekKode } from "@/app/lib/mfa";

const VerifySchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email wajib diisi." })
    .email({ message: "Email tidak valid." }),
  kode: z
    .string()
    .regex(/^\d{6}$/, { message: "Kode harus 6 digit angka." }),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const parsed = VerifySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false }, { status: 400 });
  }

  try {
    const valid = await cekKode(
      parsed.data.email,
      parsed.data.kode,
      "registrasi",
    );
    return Response.json({ ok: valid });
  } catch (error) {
    console.error("Database Error (/api/mfa/verify):", error);
    return Response.json(
      { ok: false, message: "Database Error: Gagal memeriksa kode." },
      { status: 500 },
    );
  }
}