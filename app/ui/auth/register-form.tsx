"use client";

import { useRef, useState, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAccount } from "@/app/lib/actions";
import type { State } from "@/app/lib/actions";
import RegisterFields from "./register-form-fields";
import { AutoSignInOnSuccess } from "./register-form-auto";
import MfaVerifyFields, { type HasilVerifikasi } from "./mfa-verify-fields";

const initialRegisterState: State = { message: "" };

/**
 * Form pendaftaran akun baru + toko pertama dengan MFA kode unik email.
 * - Submit "Daftar & Buat Toko" TIDAK langsung memproses pendaftaran:
 *   dulu validasi native, lalu kirim kode via POST /api/send.
 * - Saat menunggu kode: field disembunyikan (form tetap mounted agar
 *   FormData bisa dibaca), tampil panel verifikasi MFA (6 kotak input
 *   + kirim ulang dengan countdown 60 detik).
 * - 6 digit terisi penuh -> verifikasi via POST /api/mfa/verify ->
 *   benar: lanjut registerAccount (re-verifikasi kode server-side) ->
 *   user otomatis login lalu diarahkan ke beranda.
 * - Kirim ulang: kode random BARU menggantikan kode lama (upsert).
 */
export default function RegisterForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  // "form": isi formulir; "mfa": menunggu & verifikasi kode unik email.
  const [step, setStep] = useState<"form" | "mfa">("form");
  const [isSendingCode, startSendingCode] = useTransition();
  const [isAutoSigningIn, startAutoSignIn] = useTransition();

  // Wrapper server action registrasi: jika hasilnya gagal (mis. email
  // sudah terdaftar / verifikasi MFA invalid), kembalikan step ke "form"
  // agar user bisa memperbaiki data & mengulang proses MFA.
  async function registerDenganMfa(
    prevState: State,
    formData: FormData,
  ): Promise<State> {
    const result = await registerAccount(prevState, formData);
    if (!result.success && result.message) {
      setStep("form");
    }
    return result;
  }

  const [state, formAction, isPending] = useActionState(
    registerDenganMfa,
    initialRegisterState,
  );

  const inputCls =
    "peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500";
  const errCls = (field?: string[]) =>
    field ? "text-xs text-red-600" : undefined;

  // Klik "Daftar & Buat Toko": validasi native HTML5 lalu kirim kode
  // verifikasi ke email. Pendaftaran BELUM diproses di sini.
  function handleSubmitClick() {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;
    setMessage("");
    startSendingCode(async () => {
      const nama =
        (form.elements.namedItem("name") as HTMLInputElement | null)?.value ??
        "";
      try {
        const res = await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, nama }),
        });
        const data = (await res.json().catch(() => null)) as
          | { ok?: boolean; message?: string }
          | null;
        if (!res.ok || !data?.ok) {
          setMessage(
            data?.message ?? "Gagal mengirim kode verifikasi. Coba lagi.",
          );
          return;
        }
        setStep("mfa");
      } catch {
        // Kegagalan jaringan-level fetch.
        setMessage("Gagal mengirim kode verifikasi. Periksa koneksi anda.");
      }
    });
  }

  // Verifikasi 6 digit (dipanggil otomatis oleh panel MFA).
  async function verifyKode(kode: string): Promise<HasilVerifikasi> {
    let ok = false;
    let gagal = false;
    try {
      const res = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, kode }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean }
        | null;
      ok = res.ok && data?.ok === true;
      gagal = !res.ok;
    } catch {
      gagal = true; // kegagalan jaringan-level fetch
    }
    if (!ok) return gagal ? "error" : "salah";
    // Kode benar -> lanjutkan proses pendaftaran (server action).
    // registerAccount re-verifikasi kode di server (defense in depth).
    const form = formRef.current;
    if (!form) return "error";
    const formData = new FormData(form);
    formData.set("mfa_kode", kode);
    formAction(formData);
    return "benar";
  }

  // Kirim ulang kode: kode random BARU menggantikan kode lama (upsert).
  async function kirimUlangKode(): Promise<{
    ok: boolean;
    message?: string;
    retryAfter?: number;
  }> {
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string; retryAfter?: number }
        | null;
      if (!res.ok || !data?.ok) {
        return {
          ok: false,
          message: data?.message ?? "Gagal mengirim ulang kode. Coba lagi.",
          retryAfter: data?.retryAfter,
        };
      }
      return { ok: true };
    } catch {
      return {
        ok: false,
        message: "Gagal mengirim ulang kode. Periksa koneksi anda.",
      };
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <RegisterFields
        formRef={formRef}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        passwordConfirm={passwordConfirm}
        setPasswordConfirm={setPasswordConfirm}
        inputCls={inputCls}
        errCls={errCls}
        state={state}
        onSubmitClick={handleSubmitClick}
        mfaAktif={step === "mfa"}
        isPending={isPending || isSendingCode}
        isAutoSigningIn={isAutoSigningIn}
      />

      {/* Panel verifikasi MFA: pesan + 6 kotak kode + kirim ulang */}
      {step === "mfa" && (
        <>
          <MfaVerifyFields
            onComplete={verifyKode}
            onResend={kirimUlangKode}
          />
          <button
            type="button"
            onClick={() => {
              setStep("form");
              setMessage("");
            }}
            className="self-start text-xs text-gray-500 underline hover:text-gray-700"
          >
            Ubah data pendaftaran
          </button>
        </>
      )}

      {(message || (state.message && !state.success)) && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {message || state.message}
        </p>
      )}
      {state.success && (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.message}
        </p>
      )}

      <p className="text-sm text-gray-600">
        Sudah punya akun?{" "}
        <Link href="/" className="font-medium text-blue-600 hover:underline">
          Masuk
        </Link>
      </p>

      <AutoSignInOnSuccess
        state={state}
        email={email}
        password={password}
        setMessage={setMessage}
        router={router}
        startAutoSignIn={startAutoSignIn}
      />
    </div>
  );
}
