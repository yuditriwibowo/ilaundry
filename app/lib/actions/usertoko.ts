"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "../db";
import { getCurrentUser } from "../auth";
import { fetchFilteredUserToko } from "../data/usertoko";
import type { State } from "./types";

const UserSchema = z.object({
  name: z.string().min(1, { message: "Nama wajib diisi." }),
  email: z.string().email({ message: "Email tidak valid." }).min(1, { message: "Email wajib diisi." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
});

const CreateUserTokoSchema = z.object({
  name: z.string().min(1, { message: "Nama wajib diisi." }),
  email: z.string().email({ message: "Email tidak valid." }).min(1, { message: "Email wajib diisi." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
  peran: z.enum(['Administrator', 'Manager', 'Kasir'], {
    message: "Peran wajib dipilih.",
  }),
});

const ConfirmExistingUserTokoSchema = z.object({
  existing_user_id: z.string().uuid({ message: "User tidak valid." }),
  peran: z.enum(['Administrator', 'Manager', 'Kasir'], {
    message: "Peran wajib dipilih.",
  }),
});

function getPostgresUniqueConstraint(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }
  const postgresError = error as {
    code?: string;
    constraint?: string;
    constraint_name?: string;
  };
  if (postgresError.code !== "23505") {
    return undefined;
  }
  return postgresError.constraint_name || postgresError.constraint || "unique_violation";
}

async function getTokoName(tokoId: string) {
  const toko = await sql<{ nama_toko: string }[]>`
    SELECT nama_toko FROM toko WHERE id = ${tokoId}
  `;
  return toko[0]?.nama_toko || tokoId;
}

async function getUserByEmail(email: string) {
  const users = await sql<{ id: string; name: string; email: string }[]>`
    SELECT id, name, email FROM users WHERE email = ${email}
  `;
  return users[0] ?? null;
}

async function isUserRegisteredAtToko(userId: string, tokoId: string) {
  const existing = await sql<{ id: string }[]>`
    SELECT id FROM user_toko WHERE user_id = ${userId} AND toko_id = ${tokoId}
  `;
  return existing.length > 0;
}

async function handleExistingUserConflict(
  email: string,
  tokoId: string,
  peran: string,
): Promise<State> {
  const existingUser = await getUserByEmail(email);
  const tokoName = await getTokoName(tokoId);

  if (!existingUser) {
    return {
      message: "Database Error: Gagal menambah user toko.",
    };
  }

  const alreadyRegistered = await isUserRegisteredAtToko(existingUser.id, tokoId);

  if (alreadyRegistered) {
    return {
      message: `User [${existingUser.name} - ${existingUser.email}] sudah terdaftar di toko [${tokoName}] untuk mengubah peran bisa dilakukan dengan memilih tombol edit.`,
      conflict: "existing_user_toko",
      existingUser,
      tokoName,
      peran,
    };
  }

  return {
    message: `User [${existingUser.name} - ${existingUser.email}] sudah terdaftar. Apakah anda ingin mendaftarkan di toko [${tokoName}]?`,
    conflict: "existing_user" as const,
    existingUser,
    tokoName,
    peran,
  };
}

async function insertUserTokoForExistingUser(
  userId: string,
  tokoId: string,
  peran: string,
  operatorId: string | null,
) {
  const now = new Date().toISOString();
  const newUserTokoId = crypto.randomUUID();

  await sql`
    INSERT INTO user_toko (id, user_id, toko_id, peran, created_at, last_update, update_by)
    VALUES (${newUserTokoId}, ${userId}, ${tokoId}, ${peran}, ${now}, ${now}, ${operatorId})
  `;
}

export async function createUserToko(prevState: State, formData: FormData): Promise<State> {
  await getCurrentUser();
  const cookieStore = await cookies();
  const userId_operator = cookieStore.get("user_id")?.value || null;
  const tokoId = cookieStore.get("selected_toko")?.value || null;
  const now = new Date().toISOString();
  const intent = formData.get("intent");

  if (!tokoId) {
    return {
      message: "Toko belum dipilih. Silakan pilih toko terlebih dahulu.",
    };
  }

  if (intent === "confirm_existing") {
    const validatedFields = ConfirmExistingUserTokoSchema.safeParse({
      existing_user_id: formData.get("existing_user_id"),
      peran: formData.get("peran"),
    });

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      return {
        errors: {
          peran: fieldErrors.peran,
        },
        message: "Beberapa field tidak valid. Gagal menambah user toko.",
        conflict: "existing_user" as const,
        existingUser: prevState.existingUser,
        tokoName: prevState.tokoName,
        peran: String(formData.get("peran") || prevState.peran || ""),
      };
    }

    const { existing_user_id, peran } = validatedFields.data;

    try {
      await insertUserTokoForExistingUser(
        existing_user_id,
        tokoId,
        peran,
        userId_operator,
      );
    } catch (error) {
      console.error("Database Error:", error);
      const constraint = getPostgresUniqueConstraint(error);
      const existingUser =
        prevState.existingUser ??
        (await sql<{ id: string; name: string; email: string }[]>`
          SELECT id, name, email FROM users WHERE id = ${existing_user_id}
        `)[0] ??
        undefined;
      const tokoName = prevState.tokoName || (await getTokoName(tokoId));

      if (constraint === "user_toko_unique_user_toko" && existingUser) {
        return {
          message: `User [${existingUser.name} - ${existingUser.email}] sudah terdaftar di toko [${tokoName}] untuk mengubah peran bisa dilakukan dengan memilih tombol edit.`,
          conflict: "existing_user_toko" as const,
          existingUser,
          tokoName,
          peran,
        };
      }

      return {
        message: "Database Error: Gagal menambah user toko.",
        conflict: "existing_user" as const,
        existingUser,
        tokoName,
        peran,
      };
    }

    revalidatePath("/laundry/pengaturan/usertoko");
    redirect("/laundry/pengaturan/usertoko");
  }

  const validatedFields = CreateUserTokoSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    peran: formData.get("peran"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah user toko.",
    };
  }

  const { name, email, password, peran } = validatedFields.data;
  const newUserId = crypto.randomUUID();
  const newUserTokoId = crypto.randomUUID();

  try {
    await sql.begin(async (sql) => {
      await sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${newUserId}, ${name}, ${email}, ${password})
      `;
      await sql`
        INSERT INTO user_toko (id, user_id, toko_id, peran, created_at, last_update, update_by)
        VALUES (${newUserTokoId}, ${newUserId}, ${tokoId}, ${peran}, ${now}, ${now}, ${userId_operator})
      `;
    });
  } catch (error) {
    console.error("Database Error:", error);
    const constraint = getPostgresUniqueConstraint(error);

    if (
      constraint === "users_email_key" ||
      constraint === "user_toko_unique_user_toko" ||
      constraint === "unique_violation"
    ) {
      return handleExistingUserConflict(email, tokoId, peran);
    }

    return {
      message: "Database Error: Gagal menambah user toko. Email mungkin sudah terdaftar.",
    };
  }

  revalidatePath("/laundry/pengaturan/usertoko");
  redirect("/laundry/pengaturan/usertoko");
}

export async function updateUserToko(id: string, prevState: State, formData: FormData) {
  await getCurrentUser();
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  const validatedFields = z.object({
    id: z.string(),
    peran: z.enum(['Administrator', 'Manager', 'Kasir']),
  }).safeParse({
    id: id,
    peran: formData.get("peran"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui user toko.",
    };
  }

  const { peran } = validatedFields.data;

  try {
    await sql`
      UPDATE user_toko
      SET peran = ${peran}, last_update = ${now}, update_by = ${userId}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Database Error: Gagal memperbarui user toko.",
    };
  }

  revalidatePath("/laundry/pengaturan/usertoko");
  redirect("/laundry/pengaturan/usertoko");
}

export async function deleteUserToko(id: string) {
  await getCurrentUser();
  try {
    await sql`DELETE FROM user_toko WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete User Toko.");
  }
  revalidatePath("/laundry/pengaturan/usertoko");
}

export async function fetchMoreUserToko(query: string, page: number) {
  await getCurrentUser();
  return await fetchFilteredUserToko(query, page);
}
