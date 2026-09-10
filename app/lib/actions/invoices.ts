"use server";

// SISA TEMPLATE ACME (invoices) — tidak dipakai UI aplikasi laundry.
// TODO(step 4): hapus file ini bersama sisa template lainnya.
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "../db";
import { getCurrentUser } from "../auth";
import type { State } from "./types";

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

export async function createInvoice(prevState: State,formData: FormData) {
  await getCurrentUser();
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
  await getCurrentUser();
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
  await getCurrentUser();
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Invoice.");
  }
 revalidatePath("/laundry/pesanan");
}
