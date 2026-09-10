// Barrel server actions.
// Semua konsumen tetap mengimpor dari "@/app/lib/actions" — path ini
// sekarang resolve ke folder ini (index.ts) setelah actions.ts lama dihapus.
//
// Named re-exports eksplisit (bukan `export *`) agar resolusi action ID
// oleh compiler tetap statis dan aman.
export type { State } from "./types";

export { setSessionUserId, setSelectedTokoAction } from "./session";
// TODO(step 4): hapus baris template invoice di bawah ini.
export { createInvoice, updateInvoice, deleteInvoice } from "./invoices";
export { createToko, updateToko, deleteToko, fetchMoreToko } from "./toko";
export { createDurasi, updateDurasi, deleteDurasi, fetchMoreDurasi } from "./durasi";
export { createParfum, updateParfum, deleteParfum, fetchMoreParfum } from "./parfum";
export { createDiskon, updateDiskon, deleteDiskon, fetchMoreDiskon } from "./diskon";
export { createAntarJemput, updateAntarJemput, deleteAntarJemput, fetchMoreAntarJemput } from "./antar-jemput";
export { createLayanan, updateLayanan, deleteLayanan, fetchMoreLayanan } from "./layanan";
export { createPelanggan, updatePelanggan, deletePelanggan, fetchMorePelanggan } from "./pelanggan";
export { createPesanan, deletePesanan, deleteItemPesanan, fetchMorePesanan, fetchMoreItemPesanan } from "./pesanan";
export { createUserToko, updateUserToko, deleteUserToko, fetchMoreUserToko } from "./usertoko";
