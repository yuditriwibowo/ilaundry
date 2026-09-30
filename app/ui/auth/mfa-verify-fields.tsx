// Panel verifikasi MFA pendaftaran: pesan "periksa email", 6 kotak input
// angka (hanya digit, auto-advance fokus, backspace mundur, auto-submit
// saat 6 digit terisi penuh), pesan salah + reset kotak, dan tombol
// kirim ulang kode yang dimulai disabled dengan countdown 60 detik.
//
// CATAT: file ini sengaja TANPA direktif "use client" — hanya diimpor
// dari register-form.tsx ("use client") sehingga otomatis bagian dari
// client graph (hooks tetap jalan). Tanpa direktif, file ini bukan
// "client entry", jadi props fungsi (onComplete/onResend) tidak kena
// pemeriksaan serializable props ts(71007). Pola sama dengan
// register-form-fields.tsx & register-form-auto.tsx.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

// Hasil verifikasi dari parent:
// - "benar": kode benar — proses pendaftaran dilanjutkan parent.
// - "salah": kode salah — tampil "Kode yang anda masukkan salah." + reset.
// - "error": gagal jaringan/DB — tampil pesan umum, kotak TIDAK direset
//   (kode masih berlaku, user bisa ulangi kode yang sama).
export type HasilVerifikasi = "benar" | "salah" | "error";

export default function MfaVerifyFields({
  onComplete,
  onResend,
}: {
  onComplete: (kode: string) => Promise<HasilVerifikasi>;
  onResend: () => Promise<{
    ok: boolean;
    message?: string;
    retryAfter?: number;
  }>;
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [terverifikasi, setTerverifikasi] = useState(false);
  const [codeError, setCodeError] = useState("");
  // Tombol kirim ulang diawali disabled + countdown turun 60 detik.
  const [cooldown, setCooldown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Guard agar kode yang sama tidak diverifikasi dua kali.
  const checkedKodeRef = useRef<string | null>(null);
  // Guard agar auto-submit hanya dipicu sekali per pengisian penuh.
  const verifyingRef = useRef(false);

  // Countdown 60 detik untuk tombol kirim ulang.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const verifyKode = useCallback(
    async (kode: string) => {
      setIsVerifying(true);
      try {
        const hasil = await onComplete(kode);
        if (hasil === "benar") {
          setTerverifikasi(true);
          return; // proses pendaftaran lanjut (di-handle parent)
        }
        if (hasil === "salah") {
          setCodeError("Kode yang anda masukkan salah.");
          resetKotak();
        } else {
          setCodeError("Gagal memeriksa kode. Coba lagi.");
        }
      } finally {
        setIsVerifying(false);
        verifyingRef.current = false;
      }
    },
    [onComplete],
  );

  // Verifikasi otomatis saat 6 digit sudah diinput penuh.
  useEffect(() => {
    const kode = digits.join("");
    if (
      digits.every((d) => d !== "") &&
      checkedKodeRef.current !== kode &&
      !verifyingRef.current
    ) {
      verifyingRef.current = true;
      checkedKodeRef.current = kode;
      void verifyKode(kode);
    }
  }, [digits, verifyKode]);

  function resetKotak() {
    checkedKodeRef.current = null;
    setDigits(Array(6).fill(""));
    inputRefs.current[0]?.focus();
  }

  function handleChange(i: number, v: string) {
    const val = v.replace(/\D/g, ""); // hanya angka
    if (!val) {
      setDigits((d) => d.map((x, idx) => (idx === i ? "" : x)));
      return;
    }
    // Mendukung ketik satu digit & paste multi-digit sekaligus.
    setDigits((d) => {
      const next = [...d];
      for (let k = 0; k < val.length && i + k < 6; k++) next[i + k] = val[k];
      return next;
    });
    inputRefs.current[Math.min(i + val.length, 5)]?.focus();
  }

  function handleKeyDown(
    i: number,
    e: ReactKeyboardEvent<HTMLInputElement>,
  ) {
    // Backspace di kotak kosong: mundur ke kotak sebelumnya.
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  }

  async function handleResend() {
    if (cooldown > 0 || isVerifying || terverifikasi) return;
    setCodeError("");
    const res = await onResend();
    if (res.ok) {
      setCooldown(60); // countdown restart setelah kirim ulang
      resetKotak();
      return;
    }
    setCodeError(res.message ?? "Gagal mengirim ulang kode. Coba lagi.");
    if (typeof res.retryAfter === "number") setCooldown(res.retryAfter);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
        Periksa email anda dan masukkan kode unik yang telah dikirim ke email
        anda.
      </p>

      {/* 6 kotak input kode angka */}
      <div className="flex justify-between gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isVerifying || terverifikasi}
            aria-label={`Kode digit ${i + 1}`}
            className="h-12 w-full rounded-md border border-gray-200 text-center text-lg font-bold text-gray-900 outline-2 focus:border-blue-500 focus:outline-blue-500 disabled:opacity-60"
          />
        ))}
      </div>

      {codeError && <p className="text-xs text-red-600">{codeError}</p>}
      {terverifikasi && (
        <p className="text-xs text-green-600">
          Kode terverifikasi. Memproses pendaftaran...
        </p>
      )}
      {isVerifying && !terverifikasi && (
        <p className="text-xs text-gray-500">Memeriksa kode...</p>
      )}

      {/* Kirim ulang: diawali disabled, countdown turun 60 detik */}
      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0 || isVerifying || terverifikasi}
        className="flex h-10 w-full items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-bold text-blue-600 transition-all hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 disabled:opacity-60"
      >
        {cooldown > 0
          ? `Kirim Ulang Kode (${cooldown} detik)`
          : "Kirim Ulang Kode"}
      </button>
    </div>
  );
}