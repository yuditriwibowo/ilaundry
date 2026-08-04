"use server";

export async function createInvoice(formData: FormData) {
  const rawFormData = {
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  };

  console.log(rawFormData);
}

export async function createPelanggan(formData: FormData) {
  const rawFormData = {
    nama: formData.get("nama"),
    no_hp: formData.get("no_hp"),
    email: formData.get("email"),
    alamat: formData.get("alamat"),
  };

  console.log(rawFormData);
}

