"use client";

import { useState, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAccount } from "@/app/lib/actions";
import type { State } from "@/app/lib/actions";
import RegisterFields from "./register-form-fields";
import { AutoSignInOnSuccess } from "./register-form-auto";

const initialRegisterState: State = { message: "" };

/**
 * Form pendaftaran akun baru + toko pertama.
 * - password diisi ulang (reconfirm).
 * - Sekaligus mendaftarkan satu toko baru (nama, alamat, telephone).
 * - Setelah submit sukses: user otomatis login (peran Account_Owner
 *   pada toko baru) lalu diarahkan ke beranda dengan toko terpilih.
 */
export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [isAutoSigningIn, startAutoSignIn] = useTransition();
  const [state, formAction, isPending] = useActionState(
    registerAccount,
    initialRegisterState,
  );

  const inputCls =
    "peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500";
  const errCls = (field?: string[]) =>
    field ? "text-xs text-red-600" : undefined;

  return (
    <div className="flex w-full flex-col gap-4">
      <RegisterFields
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        passwordConfirm={passwordConfirm}
        setPasswordConfirm={setPasswordConfirm}
        inputCls={inputCls}
        errCls={errCls}
        state={state}
        formAction={formAction}
        isPending={isPending}
        isAutoSigningIn={isAutoSigningIn}
      />

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
