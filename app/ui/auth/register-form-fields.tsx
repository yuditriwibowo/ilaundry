// ===== Bagian bawah register-form: fields, submit, dan auto sign-in =====
// (dipecah dari RegisterForm agar file tetap kecil & mudah dibaca)

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import type { State } from "@/app/lib/actions";
import { setSelectedTokoAction } from "@/app/lib/actions";

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
      {/* Dua kolom di desktop: akun (kiri) & toko (kanan); satu kolom di mobile */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
        {/* ===== Kolom 1: Data akun ===== */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Akun
          </p>
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
        </div>

        {/* ===== Kolom 2: Toko pertama ===== */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Toko Pertama Anda
          </p>
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
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || isAutoSigningIn}
        className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 text-sm font-bold transition-all hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 disabled:opacity-60"
      >
        <span>
          {isPending || isAutoSigningIn ? "Memproses..." : "Daftar & Buat Toko"}
        </span>
      </button>
    </form>
  );
}
