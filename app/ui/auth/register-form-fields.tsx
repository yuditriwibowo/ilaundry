// ===== Bagian bawah register-form: fields, submit, dan auto sign-in =====
// (dipecah dari RegisterForm agar file tetap kecil & mudah dibaca)

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import type { State } from "@/app/lib/actions";
import { setSelectedTokoAction } from "@/app/lib/actions";

type FieldErrors = State["errors"];

export default function RegisterFields({
  email,
  setEmail,
  password,
  setPassword,
  passwordConfirm,
  setPasswordConfirm,
  inputCls,
  errCls,
  state,
  formAction,
  isPending,
  isAutoSigningIn,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  passwordConfirm: string;
  setPasswordConfirm: (v: string) => void;
  inputCls: string;
  errCls: (field?: string[]) => string | undefined;
  state: State;
  formAction: (payload: FormData) => void;
  isPending: boolean;
  isAutoSigningIn: boolean;
}) {
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
          Nama
        </label>
        <input id="name" name="name" required placeholder="Nama lengkap" className={inputCls} />
        <p className={errCls(state.errors?.name)}>{state.errors?.name?.[0]}</p>
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="email@contoh.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
        />
        <p className={errCls(state.errors?.email)}>{state.errors?.email?.[0]}</p>
      </div>
      <div>
        <label htmlFor="no_hp" className="mb-1 block text-sm font-medium text-gray-700">
          No. HP
        </label>
        <input id="no_hp" name="no_hp" required placeholder="08xxxxxxxxxx" className={inputCls} />
        <p className={errCls(state.errors?.no_hp)}>{state.errors?.no_hp?.[0]}</p>
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
        />
        <p className={errCls(state.errors?.password)}>
          {state.errors?.password?.[0]}
        </p>
      </div>
      <div>
        <label htmlFor="passwordConfirm" className="mb-1 block text-sm font-medium text-gray-700">
          Konfirmasi Password
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Ulangi password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className={inputCls}
        />
        <p className={errCls(state.errors?.passwordConfirm)}>
          {state.errors?.passwordConfirm?.[0]}
        </p>
      </div>

      <hr className="border-gray-200" />
      <p className="text-sm font-medium text-gray-700">Toko pertama Anda</p>

      <div>
        <label htmlFor="nama_toko" className="mb-1 block text-sm font-medium text-gray-700">
          Nama Toko
        </label>
        <input
          id="nama_toko"
          name="nama_toko"
          required
          placeholder="Contoh: yLaundry Cabang A"
          className={inputCls}
        />
        <p className={errCls(state.errors?.nama_toko)}>
          {state.errors?.nama_toko?.[0]}
        </p>
      </div>
      <div>
        <label htmlFor="alamat_toko" className="mb-1 block text-sm font-medium text-gray-700">
          Alamat Toko
        </label>
        <input
          id="alamat_toko"
          name="alamat_toko"
          placeholder="Alamat lengkap (opsional)"
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="telephone" className="mb-1 block text-sm font-medium text-gray-700">
          Telephone Toko
        </label>
        <input
          id="telephone"
          name="telephone"
          placeholder="Nomor telephone (opsional)"
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={isPending || isAutoSigningIn}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 text-blue-600 md:border-transparent md:bg-gradient-to-r md:from-blue-600 md:to-indigo-600 md:text-white px-4 text-sm font-bold transition-all hover:bg-blue-50 md:hover:from-blue-700 md:hover:to-indigo-700 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 disabled:opacity-60"
      >
        <span>
          {isPending || isAutoSigningIn ? "Memproses..." : "Daftar & Buat Toko"}
        </span>
      </button>
    </form>
  );
}
