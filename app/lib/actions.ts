"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  };
  message?: string | null;
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

export async function deletePelanggan(id: string) {
  await sql`DELETE FROM pelanggan WHERE id = ${id}`;
  revalidatePath("/laundry/pelanggan");
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
});

export async function updatePelanggan(id: string, formData: FormData) {
  const rawFormData = {
    nama: formData.get("nama"),
    no_hp: formData.get("no_hp"),
    email: formData.get("email"),
    alamat: formData.get("alamat"),
  };
  const { nama, no_hp, email, alamat } = UpdatePelanggan.parse(rawFormData);

  await sql`
    UPDATE pelanggan
    SET nama = ${nama}, no_hp = ${no_hp}, email = ${email}, alamat = ${alamat}
    WHERE id = ${id}
  `;

  revalidatePath("/laundry/pelanggan");
  redirect("/laundry/pelanggan");
}

import { fetchFilteredPelanggan } from "./data";

export async function fetchMorePelanggan(query: string, page: number) {
  return await fetchFilteredPelanggan(query, page);
}
