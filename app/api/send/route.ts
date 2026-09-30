// Route handler pengiriman kode verifikasi MFA: POST /api/send.
//
// Alur: validasi email -> cek cooldown kirim ulang (60 detik,
// server-side, selaras countdown UI) -> generate kode 6 digit -> simpan
// per (email, tipe 'registrasi') di tabel mfa_kode (expired 3 menit,
// kirim ulang = upsert sehingga hanya kode terakhir yang berlaku) ->
// kirim email via Resend.
//
// Guardrail Resend: pola { data, error } TANPA try/catch untuk error SDK
// (SDK mengembalikan error, bukan throw); API key dari env
// RESEND_API_KEY; parameter camelCase; idempotencyKey unik per request.

import { z } from "zod";
import { generateKode, simpanKode, waktuKirimTerakhir } from "@/app/lib/mfa";
import { kirimKodeEmail } from "@/app/lib/email";

const SendSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email wajib diisi." })
    .email({ message: "Email tidak valid." }),
  nama: z.string().optional(),
});

// Cooldown kirim ulang kode: 60 detik (selaras countdown UI).
const COOLDOWN_MS = 60 * 1000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, message: "Request tidak valid." },
      { status: 400 },
    );
  }

  const parsed = SendSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        message:
          parsed.error.flatten().fieldErrors.email?.[0] ?? "Email tidak valid.",
      },
      { status: 400 },
    );
  }
  const { email, nama } = parsed.data;

  // Cooldown server-side: tolak kirim ulang < 60 detik sejak kode
  // terakhir (mencegah abuse endpoint & spam email; kirim PERTAMA
  // selalu diizinkan karena belum ada baris kode).
  const terakhir = await waktuKirimTerakhir(email, "registrasi");
  if (terakhir) {
    const selisih = Date.now() - new Date(terakhir).getTime();
    if (selisih >= 0 && selisih < COOLDOWN_MS) {
      return Response.json(
        {
          ok: false,
          message: "Tunggu sebentar sebelum meminta kode baru.",
          retryAfter: Math.ceil((COOLDOWN_MS - selisih) / 1000),
        },
        { status: 429 },
      );
    }
  }

  const kode = generateKode();
  try {
    await simpanKode(email, kode, "registrasi");
  } catch (error) {
    console.error("Database Error (/api/send):", error);
    return Response.json(
      {
        ok: false,
        message: "Database Error: Gagal menyimpan kode. Coba lagi.",
      },
      { status: 500 },
    );
  }

  // try/catch hanya untuk kegagalan network-level (guardrail Resend);
  // error SDK ditangani via { data, error } di dalam kirimKodeEmail.
  let sent = false;
  try {
    sent = await kirimKodeEmail({ to: email, kode, nama });
  } catch (error) {
    console.error("Network Error (/api/send):", error);
  }

  if (!sent) {
    return Response.json(
      { ok: false, message: "Gagal mengirim email. Coba lagi." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}