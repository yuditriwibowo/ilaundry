"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { verifyCredentials, setSelectedTokoAction } from "@/app/lib/actions";
import type { TokoAssignment } from "@/app/lib/definitions";

/**
 * Form login di halaman depan:
 * 1. User mengisi email + password, klik "Masuk".
 * 2. Kredensial diverifikasi (server action verifyCredentials) —
 *    jika benar, pilihan toko di-enable berisi [nama_toko - peran].
 * 3. User memilih toko → signIn NextAuth (credentials + tokoId) →
 *    cookie selected_toko di-set → redirect ke beranda.
 * Jika kredensial salah: pesan "email/password salah".
 */
export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [tokos, setTokos] = useState<TokoAssignment[] | null>(null);
  const [selectedToko, setSelectedToko] = useState("");
  const [isPending, startTransition] = useTransition();

  const authenticated = tokos !== null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    startTransition(async () => {
      const res = await verifyCredentials(email, password);
      if (!res.success) {
        setTokos(null);
        setMessage(res.message || "email/password salah");
        return;
      }
      const tokoList = res.tokos ?? [];
      setTokos(tokoList);

      if (tokoList.length === 0) {
        setMessage("User belum mempunyai toko & peran.");
      } else if (tokoList.length === 1) {
        // Auto-select single toko and proceed directly
        const toko = tokoList[0];
        setSelectedToko(toko.tokoId);
        const signInRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
          tokoId: toko.tokoId,
        });
        if (signInRes?.error) {
          setTokos(null);
          setSelectedToko("");
          setMessage("email/password salah");
          return;
        }
        await setSelectedTokoAction(toko.tokoId);
        router.push("/laundry");
        router.refresh();
      }
      // If > 1 toko, show select dropdown (existing behavior)
    });
  };

  const handleSelectToko = (tokoId: string) => {
    setSelectedToko(tokoId);
    if (!tokoId) return;
    setMessage("");
    startTransition(async () => {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        tokoId,
      });
      if (res?.error) {
        setTokos(null);
        setSelectedToko("");
        setMessage("email/password salah");
        return;
      }
      await setSelectedTokoAction(tokoId);
      router.push("/laundry");
      router.refresh();
    });
  };

  const inputCls =
    "peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500";

  return (
    <div className="flex w-full flex-col gap-4">
      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Masukkan email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 text-sm font-bold transition-all hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 disabled:opacity-60"
        >
          <span>{isPending ? "Memproses..." : "Masuk"}</span>
          {!isPending && <ArrowRightIcon className="w-5 md:w-6" />}
        </button>
      </form>

      {message && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {message}
        </p>
      )}

      {authenticated && tokos && tokos.length > 1 && (
        <div>
          <label htmlFor="toko" className="mb-1 block text-sm font-medium text-gray-700">
            Toko
          </label>
          <select
            id="toko"
            name="toko"
            disabled={isPending}
            value={selectedToko}
            onChange={(e) => handleSelectToko(e.target.value)}
            className={`${inputCls} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400`}
          >
            <option value="">Pilih toko</option>
            {tokos.map((toko) => (
              <option key={toko.tokoId} value={toko.tokoId}>
                {`${toko.namaToko} - ${toko.peran ?? "belum ada peran"}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
