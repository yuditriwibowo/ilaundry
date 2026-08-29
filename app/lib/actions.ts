"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string({ invalid_type_error: "Please select a customer." }).min(1, {
    message: "Please select a customer."
  }),
  amount: z.coerce
  .number()
  .gt(0, { message: "Please enter an amount greater than $0." }),
  date: z.string(),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
});
const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
    nama?: string[];
    no_hp?: string[];
    email?: string[];
    alamat?: string[];
    nama_toko?: string[];
    telephone?: string[];
    alamat_toko?: string[];
    nama_durasi?: string[];
    lama_durasi?: string[];
    nama_diskon?: string[];
    tipe_diskon?: string[];
    nilai_diskon?: string[];
    nama_layanan?: string[];

  harga?: string[];
  tipe_id?: string[];
  durasi_id?: string[];
  toko_id?: string[];

  };
  message: string;
};

export async function createInvoice(prevState: State,formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }
  revalidatePath("/laundry/pesanan");
  redirect("/laundry/pesanan");
}

const UpdateInvoice = InvoiceSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Failed to Update Invoice.",
    };
  }

  revalidatePath("/laundry/pesanan");
  redirect("/laundry/pesanan");
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Invoice.");
  }
 revalidatePath("/laundry/pesanan");
}

export async function deleteToko(id: string) {
  try {
    await sql`DELETE FROM toko WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Toko.");
  }
  revalidatePath("/laundry/pengaturan/toko");
}

export async function deleteDurasi(id: string) {
  try {
    await sql`DELETE FROM durasi WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Durasi.");
  }
  revalidatePath("/laundry/pengaturan/durasi");
}

export async function deleteParfum(id: string) {
  try {
    await sql`DELETE FROM parfum WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Parfum.");
  }
  revalidatePath("/laundry/pengaturan/parfum");
}

export async function deleteDiskon(id: string) {
  try {
    await sql`DELETE FROM diskon WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Diskon.");
  }
  revalidatePath("/laundry/pengaturan/diskon");
}

export async function deleteLayanan(id: string) {
  try {
    await sql`DELETE FROM layanan WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Layanan.");
  }
  revalidatePath("/laundry/pengaturan/layanan");
}

export async function deletePelanggan(id: string) {
  await sql`DELETE FROM pelanggan WHERE id = ${id}`;
  revalidatePath("/laundry/pelanggan");
}

const TokoSchema = z.object({
  id: z.string(),
  nama_toko: z.string(),
  alamat_toko: z.string().nullable(),
  telephone: z.string().nullable(),
  update_by: z.string().nullable(),
  last_update: z.string(),
});

const CreateToko = TokoSchema.omit({
  id: true,
  update_by: true,
  last_update: true,
}).extend({
  nama_toko: z.string().min(1, { message: "Nama toko wajib diisi." }),
});

const UpdateToko = TokoSchema.omit({
  id: true,
  update_by: true,
  last_update: true,
}).extend({
  nama_toko: z.string().min(1, { message: "Nama toko wajib diisi." }),
});

const DurasiSchema = z.object({
  id: z.string(),
  nama_durasi: z.string().nullable(),
  lama_durasi: z.coerce.number(),
  toko_id: z.string().nullable(),
  update_by: z.string().nullable(),
  last_update: z.string(),
});

const CreateDurasi = DurasiSchema.omit({
  id: true,
  update_by: true,
  last_update: true,
}).extend({
  nama_durasi: z.string().min(1, { message: "Nama durasi wajib diisi." }),
  lama_durasi: z.coerce.number().gt(0, { message: "Lama durasi harus lebih dari 0." }),
});

const UpdateDurasi = DurasiSchema.omit({
  id: true,
  update_by: true,
  last_update: true,
}).extend({
  nama_durasi: z.string().min(1, { message: "Nama durasi wajib diisi." }),
  lama_durasi: z.coerce.number().gt(0, { message: "Lama durasi harus lebih dari 0." }),
});

const ParfumSchema = z.object({
  id: z.string(),
  nama_parfum: z.string(),
  toko_id: z.string(),
  created_at: z.string(),
  last_update: z.string().nullable(),
  update_by: z.string().nullable(),
});

const DiskonSchema = z.object({
  id: z.string(),
  nama_diskon: z.string(),
  tipe_diskon: z.enum(["Persentase", "Nominal"]),
  nilai_diskon: z.coerce.number(),
  toko_id: z.string().nullable(),
  created_at: z.string(),
  last_update: z.string().nullable(),
  update_by: z.string().nullable(),
});

const CreateDiskon = DiskonSchema.omit({
  id: true,
  created_at: true,
  last_update: true,
  update_by: true,
}).extend({
  nama_diskon: z.string().min(1, { message: "Nama diskon wajib diisi." }),
  tipe_diskon: z.enum(["Persentase", "Nominal"], {
    invalid_type_error: "Pilih tipe diskon yang valid.",
  }),
  nilai_diskon: z.coerce.number().gt(0, { message: "Nilai diskon harus lebih dari 0." }),
});

const UpdateDiskon = DiskonSchema.omit({
  id: true,
  created_at: true,
  last_update: true,
  update_by: true,
}).extend({
  nama_diskon: z.string().min(1, { message: "Nama diskon wajib diisi." }),
  tipe_diskon: z.enum(["Persentase", "Nominal"], {
    invalid_type_error: "Pilih tipe diskon yang valid.",
  }),
  nilai_diskon: z.coerce.number().gt(0, { message: "Nilai diskon harus lebih dari 0." }),
});

const CreateParfum = ParfumSchema.omit({
  id: true,
  created_at: true,
  last_update: true,
  update_by: true,
}).extend({
  nama_parfum: z.string().min(1, { message: "Nama parfum wajib diisi." }),
  toko_id: z.string().min(1, { message: "Pilih toko terlebih dahulu." }),
});

const UpdateParfum = ParfumSchema.omit({
  id: true,
  created_at: true,
  last_update: true,
  update_by: true,
}).extend({
  nama_parfum: z.string().min(1, { message: "Nama parfum wajib diisi." }),
  toko_id: z.string().min(1, { message: "Pilih toko terlebih dahulu." }),
});

export async function updateDurasi(id: string, prevState: State, formData: FormData) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = UpdateDurasi.safeParse({
    nama_durasi: formData.get("nama_durasi"),
    lama_durasi: formData.get("lama_durasi"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui durasi.",
    };
  }

  const { nama_durasi, lama_durasi, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      UPDATE durasi
      SET nama_durasi = ${nama_durasi}, lama_durasi = ${lama_durasi}, toko_id = ${toko_id}, last_update = ${now}, update_by = ${userId}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal memperbarui durasi.",
    };
  }

  revalidatePath("/laundry/pengaturan/durasi");
  redirect("/laundry/pengaturan/durasi");
}


export async function createToko(prevState: State, formData: FormData) {
  const validatedFields = CreateToko.safeParse({
    nama_toko: formData.get("nama_toko"),
    alamat_toko: formData.get("alamat_toko"),
    telephone: formData.get("telephone"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah toko.",
    };
  }

  const { nama_toko, alamat_toko, telephone } = validatedFields.data;
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO toko (nama_toko, alamat_toko, telephone, created_at, last_update, update_by)
      VALUES (${nama_toko}, ${alamat_toko}, ${telephone}, ${now}, ${now}, ${userId})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah toko.",
    };
  }
  revalidatePath("/laundry/pengaturan/toko");
  redirect("/laundry/pengaturan/toko");
}

export async function createDurasi(prevState: State, formData: FormData) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = CreateDurasi.safeParse({
    nama_durasi: formData.get("nama_durasi"),
    lama_durasi: formData.get("lama_durasi"),
    toko_id: selectedToko,
  });


  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah durasi.",
    };
  }

  const { nama_durasi, lama_durasi, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO durasi (nama_durasi, lama_durasi, toko_id, created_at, last_update, update_by)
      VALUES (${nama_durasi}, ${lama_durasi}, ${toko_id}, ${now}, ${now}, ${userId})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah durasi.",
    };
  }
  revalidatePath("/laundry/pengaturan/durasi");
  redirect("/laundry/pengaturan/durasi");
}

export async function updateParfum(id: string, prevState: State, formData: FormData) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = UpdateParfum.safeParse({
    nama_parfum: formData.get("nama_parfum"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui parfum.",
    };
  }

  const { nama_parfum, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      UPDATE parfum
      SET nama_parfum = ${nama_parfum}, toko_id = ${toko_id}, last_update = ${now}, update_by = ${userId}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal memperbarui parfum.",
    };
  }

  revalidatePath("/laundry/pengaturan/parfum");
  redirect("/laundry/pengaturan/parfum");
}

export async function createParfum(prevState: State, formData: FormData) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = CreateParfum.safeParse({
    nama_parfum: formData.get("nama_parfum"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah parfum.",
    };
  }

  const { nama_parfum, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO parfum (nama_parfum, toko_id, created_at, last_update, update_by)
      VALUES (${nama_parfum}, ${toko_id}, ${now}, ${now}, ${userId})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah parfum.",
    };
  }
  revalidatePath("/laundry/pengaturan/parfum");
  redirect("/laundry/pengaturan/parfum");
}

export async function createDiskon(prevState: State, formData: FormData) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = CreateDiskon.safeParse({
    nama_diskon: formData.get("nama_diskon"),
    tipe_diskon: formData.get("tipe_diskon"),
    nilai_diskon: formData.get("nilai_diskon"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah diskon.",
    };
  }

  const { nama_diskon, tipe_diskon, nilai_diskon, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO diskon (nama_diskon, tipe_diskon, nilai_diskon, toko_id, created_at, last_update, update_by)
      VALUES (${nama_diskon}, ${tipe_diskon}, ${nilai_diskon}, ${toko_id}, ${now}, ${now}, ${userId})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah diskon.",
    };
  }
  revalidatePath("/laundry/pengaturan/diskon");
  redirect("/laundry/pengaturan/diskon");
}

export async function updateDiskon(id: string, prevState: State, formData: FormData) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = UpdateDiskon.safeParse({
    nama_diskon: formData.get("nama_diskon"),
    tipe_diskon: formData.get("tipe_diskon"),
    nilai_diskon: formData.get("nilai_diskon"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui diskon.",
    };
  }

  const { nama_diskon, tipe_diskon, nilai_diskon, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      UPDATE diskon
      SET nama_diskon = ${nama_diskon}, tipe_diskon = ${tipe_diskon}, nilai_diskon = ${nilai_diskon}, toko_id = ${toko_id}, last_update = ${now}, update_by = ${userId}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal memperbarui diskon.",
    };
  }

  revalidatePath("/laundry/pengaturan/diskon");
  redirect("/laundry/pengaturan/diskon");
}

export async function updateToko(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateToko.safeParse({
    nama_toko: formData.get("nama_toko"),
    alamat_toko: formData.get("alamat_toko"),
    telephone: formData.get("telephone"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui toko.",
    };
  }

  const { nama_toko, alamat_toko, telephone } = validatedFields.data;
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      UPDATE toko
      SET nama_toko = ${nama_toko}, alamat_toko = ${alamat_toko}, telephone = ${telephone}, last_update = ${now}, update_by = ${userId}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal memperbarui toko.",
    };
  }

  revalidatePath("/laundry/pengaturan/toko");
  redirect("/laundry/pengaturan/toko");
}

const PelangganSchema = z.object({
  id: z.string(),
  nama: z.string(),
  no_hp: z.string(),
  alamat: z.string(),
  email: z.string(),
  image_url: z.string(),
  tgl_daftar: z.string(),
});

const LayananSchema = z.object({
  id: z.string(),
  tipe_id: z.string(),
  durasi_id: z.string(),
  nama_layanan: z.string(),
  harga: z.coerce.number(),
  toko_id: z.string().nullable(),
  update_by: z.string().nullable(),
  last_update: z.string(),
});

const CreateLayanan = LayananSchema.omit({
  id: true,
  update_by: true,
  last_update: true,
}).extend({
  nama_layanan: z.string().min(1, { message: "Nama layanan wajib diisi." }),
  harga: z.coerce.number().gt(0, { message: "Harga harus lebih dari 0." }),
  tipe_id: z.string().min(1, { message: "Tipe layanan wajib dipilih." }),
  durasi_id: z.string().min(1, { message: "Durasi layanan wajib dipilih." }),
});

const UpdateLayanan = LayananSchema.omit({
  id: true,
  update_by: true,
  last_update: true,
}).extend({
  nama_layanan: z.string().min(1, { message: "Nama layanan wajib diisi." }),
  harga: z.coerce.number().gt(0, { message: "Harga harus lebih dari 0." }),
  tipe_id: z.string().min(1, { message: "Tipe layanan wajib dipilih." }),
  durasi_id: z.string().min(1, { message: "Durasi layanan wajib dipilih." }),
});

export async function createLayanan(prevState: State, formData: FormData) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = CreateLayanan.safeParse({
    nama_layanan: formData.get("nama_layanan"),
    harga: formData.get("harga"),
    tipe_id: formData.get("tipe_id"),
    durasi_id: formData.get("durasi_id"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah layanan.",
    };
  }

  const { nama_layanan, harga, tipe_id, durasi_id, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO layanan (nama_layanan, harga, tipe_id, durasi_id, toko_id, created_at, last_update, update_by)
      VALUES (${nama_layanan}, ${harga}, ${tipe_id}, ${durasi_id}, ${toko_id}, ${now}, ${now}, ${userId})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah layanan.",
    };
  }
  revalidatePath("/laundry/pengaturan/layanan");
  redirect("/laundry/pengaturan/layanan");
}

export async function updateLayanan(id: string, prevState: State, formData: FormData) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = UpdateLayanan.safeParse({
    nama_layanan: formData.get("nama_layanan"),
    harga: formData.get("harga"),
    tipe_id: formData.get("tipe_id"),
    durasi_id: formData.get("durasi_id"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui layanan.",
    };
  }

  const { nama_layanan, harga, tipe_id, durasi_id, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      UPDATE layanan
      SET nama_layanan = ${nama_layanan}, harga = ${harga}, tipe_id = ${tipe_id}, durasi_id = ${durasi_id}, toko_id = ${toko_id}, last_update = ${now}, update_by = ${userId}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal memperbarui layanan.",
    };
  }

  revalidatePath("/laundry/pengaturan/layanan");
  redirect("/laundry/pengaturan/layanan");
}
const CreatePelanggan = PelangganSchema.omit({
  id: true,
  image_url: true,
  tgl_daftar: true,
}).extend({
  nama: z.string().min(1, { message: "Nama pelanggan wajib diisi." }),
  no_hp: z.string().min(1, { message: "Nomor HP wajib diisi." }),
});

export async function createPelanggan(prevState: State, formData: FormData) {
  const validatedFields = CreatePelanggan.safeParse({
    nama: formData.get("nama"),
    no_hp: formData.get("no_hp"),
    email: formData.get("email"),
    alamat: formData.get("alamat"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah pelanggan.",
    };
  }

  const { nama, no_hp, email, alamat } = validatedFields.data;
  const tgl_daftar = new Date().toISOString().split("T")[0];
  const image_url = "/pelanggan/avatar.png";

  try {
    await sql`
    INSERT INTO pelanggan (nama, no_hp, email, alamat, tgl_daftar, image_url)
    VALUES (${nama}, ${no_hp}, ${email}, ${alamat}, ${tgl_daftar}, ${image_url})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah pelanggan.",
    };
  }
  revalidatePath("/laundry/pelanggan");
  redirect("/laundry/pelanggan");
}

const UpdatePelanggan = PelangganSchema.omit({
  id: true,
  image_url: true,
  tgl_daftar: true,
}).extend({
  nama: z.string().min(1, { message: "Nama pelanggan wajib diisi." }),
  no_hp: z.string().min(1, { message: "Nomor HP wajib diisi." }),
});

export async function updatePelanggan(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdatePelanggan.safeParse({
    nama: formData.get("nama"),
    no_hp: formData.get("no_hp"),
    email: formData.get("email"),
    alamat: formData.get("alamat"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui pelanggan.",
    };
  }

  const { nama, no_hp, email, alamat } = validatedFields.data;

  try {
    await sql`
      UPDATE pelanggan
      SET nama = ${nama}, no_hp = ${no_hp}, email = ${email}, alamat = ${alamat}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal memperbarui pelanggan.",
    };
  }

  revalidatePath("/laundry/pelanggan");
  redirect("/laundry/pelanggan");
}

import { fetchFilteredPelanggan, fetchFilteredToko, fetchFilteredDurasi, fetchFilteredLayanan, fetchFilteredParfum, fetchFilteredDiskon } from "./data";

export async function fetchMorePelanggan(query: string, page: number) {
  return await fetchFilteredPelanggan(query, page);
}

export async function fetchMoreToko(query: string, page: number) {
  return await fetchFilteredToko(query, page);
}

export async function fetchMoreDurasi(query: string, page: number) {
  return await fetchFilteredDurasi(query, page);
}

export async function fetchMoreLayanan(query: string, page: number) {
  return await fetchFilteredLayanan(query, page);
}

export async function fetchMoreParfum(query: string, page: number) {
  return await fetchFilteredParfum(query, page);
}

export async function fetchMoreDiskon(query: string, page: number) {
  return await fetchFilteredDiskon(query, page);
}

export async function setSessionUserId() {
  const cookieStore = await cookies();
  cookieStore.set("user_id", "410544b2-4001-4271-9855-fec4b6a6442a", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true, 
    maxAge: 60 * 60 * 24 * 30, // 30 hari
  });
}

export async function setSelectedTokoAction(tokoId: string) {
  const cookieStore = await cookies();
  if (tokoId) {
    cookieStore.set("selected_toko", tokoId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });
  } else {
    cookieStore.delete("selected_toko");
  }
}

