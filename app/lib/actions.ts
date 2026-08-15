"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  date: z.string(),
  status: z.enum(["pending", "paid"]),
});
const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    throw new Error("Database Error: Failed to Create Invoice.");
  }
  revalidatePath("/laundry/pesanan");
  redirect("/laundry/pesanan");
}

const UpdateInvoice = InvoiceSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    throw new Error("Database Error: Failed to Update Invoice.");
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
});

export async function createPelanggan(formData: FormData) {
  const rawFormData = {
    nama: formData.get("nama"),
    no_hp: formData.get("no_hp"),
    email: formData.get("email"),
    alamat: formData.get("alamat"),
  };
  const { nama, no_hp, email, alamat } = CreatePelanggan.parse(rawFormData);
  const tgl_daftar = new Date().toISOString().split("T")[0];
  const image_url = "/pelanggan/avatar.png";

  console.log({ nama, no_hp, email, alamat, tgl_daftar, image_url });
  await sql`
  INSERT INTO pelanggan (nama, no_hp, email, alamat, tgl_daftar, image_url)
  VALUES (${nama}, ${no_hp}, ${email}, ${alamat}, ${tgl_daftar}, ${image_url})
  `;
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
