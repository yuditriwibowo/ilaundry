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

  try {
    await sql`
      INSERT INTO toko (nama_toko, alamat_toko, telephone)
      VALUES (${nama_toko}, ${alamat_toko}, ${telephone})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah toko.",
    };
  }
  revalidatePath("/laundry/pengaturan/toko");
  redirect("/laundry/pengaturan/toko");
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

  try {
    await sql`
      UPDATE toko
      SET nama_toko = ${nama_toko}, alamat_toko = ${alamat_toko}, telephone = ${telephone}
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

import { fetchFilteredPelanggan, fetchFilteredToko } from "./data";

export async function fetchMorePelanggan(query: string, page: number) {
  return await fetchFilteredPelanggan(query, page);
}

export async function fetchMoreToko(query: string, page: number) {
  return await fetchFilteredToko(query, page);
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

