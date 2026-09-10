// HALAMAN UJI SEMENTARA — hapus setelah verifikasi guard.
import { fetchMorePelanggan } from "@/app/lib/actions";

export const dynamic = "force-dynamic";

export default async function GuardTestPage() {
  const data = await fetchMorePelanggan("a", 1);
  return (
    <div>
      <h1>Guard OK</h1>
      <p>Jumlah pelanggan: {data.length}</p>
    </div>
  );
}
