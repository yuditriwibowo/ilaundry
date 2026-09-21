"use client";

/**
 * Form mutasi kas bersama untuk mode "tambah" (Penambahan Kas) dan
 * "kurang" (Pengurangan Kas). Style mengikuti form tambah pesanan:
 * wrapper bg-gray-50, label + ikon di kiri input, SelectPopup untuk tipe,
 * input jumlah terformat Rupiah, dan footer Batal + Button.
 */

import { useActionState, useState } from "react";
import {
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { SelectField, FormField, FormFooter } from "@/app/ui/shared/form-fields";
import { tambahKas, kurangiKas, State } from "@/app/lib/actions";
import { formatRupiah } from "@/app/lib/utils";

export type KasFormMode = "tambah" | "kurang";

const inputClass =
  "peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500";

function ErrorText({ errors }: { errors?: string[] }) {
  if (!errors) return null;
  return (
    <>
      {errors.map((error) => (
        <p className="mt-2 text-sm text-red-500" key={error}>
          {error}
        </p>
      ))}
    </>
  );
}

export default function KasForm({
  mode,
  saldo,
}: {
  mode: KasFormMode;
  saldo: { tunai: number; nonTunai: number };
}) {
  const isTambah = mode === "tambah";
  const initialState: State = { message: "", errors: {} };
  const [state, formAction] = useActionState(
    isTambah ? tambahKas : kurangiKas,
    initialState,
  );

  // Jumlah diketik sebagai angka polos (tanpa format) lalu ditampilkan
  // terformat Rupiah — pola sama dengan jumlah_bayar di form pesanan.
  const [jumlah, setJumlah] = useState("");

  return (
    <form action={formAction}>
      {/* jumlah dikirim sebagai angka polos (tanpa format) untuk server action */}
      <input type="hidden" name="jumlah" value={jumlah || "0"} />

      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 landscape:grid-cols-2 md:gap-6 short-screen:gap-3">
          {/* Kolom kiri: ringkasan Saldo Kas + Tipe Kas */}
          <div>
            {/* Ringkasan Saldo Kas saat ini */}
            <div className="mb-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-700">Saldo Kas</h2>
              <div className="divide-y divide-gray-100 rounded-md bg-white px-3 py-1 text-sm">
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2 text-gray-500">
                    <BanknotesIcon className="h-[18px] w-[18px] text-gray-500" />{" "}
                    Saldo Tunai
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatRupiah(saldo.tunai)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2 text-gray-500">
                    <CreditCardIcon className="h-[18px] w-[18px] text-gray-500" />{" "}
                    Saldo Non-Tunai
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatRupiah(saldo.nonTunai)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tipe Kas */}
            <SelectField
              id="tipe_transaksi"
              label="Tipe Kas"
              icon={BanknotesIcon}
              placeholder="Pilih tipe kas"
              errors={state.errors?.tipe_transaksi}
              options={[
                { id: "tunai", label: "Tunai" },
                { id: "non_tunai", label: "Non Tunai" },
              ]}
            />
          </div>

          {/* Kolom kanan: Jumlah + Keterangan */}
          <div>
            {/* Jumlah (format rupiah) */}
            <div className="mb-4">
              <label htmlFor="jumlah" className="mb-2 block text-sm font-medium">
                Jumlah
              </label>
              <div className="relative">
                <input
                  id="jumlah"
                  type="text"
                  inputMode="numeric"
                  value={jumlah === "" ? "" : formatRupiah(Number(jumlah))}
                  onChange={(e) => setJumlah(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Masukkan jumlah"
                  className={`${inputClass} pr-14`}
                  aria-describedby="jumlah-error"
                />
                <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
              <div id="jumlah-error" aria-live="polite" aria-atomic="true">
                <ErrorText errors={state.errors?.jumlah} />
              </div>
            </div>

            {/* Keterangan (opsional) */}
            <FormField
              id="keterangan"
              label="Keterangan (Opsional)"
              icon={ChatBubbleLeftRightIcon}
              placeholder="Masukkan keterangan"
              errors={state.errors?.keterangan}
            />
          </div>
        </div>
      </div>

      <FormFooter
        cancelHref="/laundry/laporan"
        submitLabel={isTambah ? "Tambahkan Kas" : "Kurangi Kas"}
        message={state.message}
      />
    </form>
  );
}