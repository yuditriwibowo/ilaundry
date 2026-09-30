// Klien Resend + helper kirim email kode verifikasi MFA.
//
// Guardrail (wajib diikuti):
// - API key dari environment RESEND_API_KEY — jangan pernah hardcode.
// - import { Resend } dari package "resend".
// - emails.send() selalu di-await; pola hasil { data, error } — TIDAK
//   memakai try/catch untuk error SDK (SDK mengembalikan error, bukan
//   throw; try/catch hanya untuk kegagalan network-level di pemanggil).
// - Parameter camelCase (idempotencyKey, replyTo, scheduledAt).
//
// Testing (sekarang):
// - from: onboarding@resend.dev — khusus testing (domain belum
//   diverifikasi; penerima harus terdaftar di akun Resend).
// - to: MFA_EMAIL_TO (yuditriwibowo@gmail.com) — SEMUA email MFA
//   terkirim ke alamat ini selama testing.
// Produksi (nanti):
// - Set RESEND_FROM_EMAIL ke alamat domain terverifikasi
//   (https://resend.com/domains) dan KOSONGKAN MFA_EMAIL_TO agar email
//   terkirim ke email pendaftar yang sebenarnya.

import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

// from address: "onboarding@resend.dev" hanya untuk TESTING — di
// produksi wajib set RESEND_FROM_EMAIL ke domain terverifikasi.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

// Tujuan pengiriman saat testing: MFA_EMAIL_TO meng-override email
// penerima. Jika tidak di-set (produksi), email terkirim ke email asli.
function tujuanEmail(emailPenerima: string): string {
  return process.env.MFA_EMAIL_TO || emailPenerima;
}

// Kirim email kode verifikasi 6 digit. Mengembalikan true jika terkirim.
// Detail error hanya di-log (response ke klien dibuat generik).
export async function kirimKodeEmail({
  to,
  kode,
  nama,
}: {
  to: string;
  kode: string;
  nama?: string;
}): Promise<boolean> {
  const { data, error } = await resend.emails.send(
    {
      from: FROM_EMAIL,
      to: [tujuanEmail(to)],
      subject: "Kode Verifikasi yLaundry",
      react: EmailTemplate({ firstName: nama || "Pengguna", kode }),
    },
    // Argumen kedua (options): idempotency key unik per request (pola
    // <event-type>/<entity-id>, kadaluarsa 24 jam) — dikirim SDK sebagai
    // header `Idempotency-Key`, mencegah email duplikat saat retry.
    { idempotencyKey: `mfa-kode/${crypto.randomUUID()}` },
  );

  if (error) {
    console.error("Resend Error (kirimKodeEmail):", error);
    return false;
  }
  console.log("Email kode verifikasi terkirim:", data?.id);
  return true;
}