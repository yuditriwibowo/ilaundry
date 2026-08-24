import postgres from "postgres";
import { cookies } from "next/headers";
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Pelanggan,
  Revenue,
  Toko,
  Durasi,
  Layanan,
  TabelLayanan,
} from "./definitions";
import { formatCurrency } from "./utils";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log("Fetching revenue data...");
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    console.log("Data fetch completed after 3 seconds.");

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? "0");
    const numberOfCustomers = Number(data[1][0].count ?? "0");
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? "0");
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? "0");

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;
    if (data.length === 0) {
      return null; // <--- Kembalikan null, jangan throw error
    }

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType[]>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}

export async function fetchFilteredPelanggan(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const pelanggan = await sql<Pelanggan[]>`
      SELECT
        id,
        nama,
        no_hp,
        alamat,
        email,
        image_url,
        tgl_daftar
      FROM pelanggan
      WHERE
        nama ILIKE ${`%${query}%`} OR
        no_hp ILIKE ${`%${query}%`} OR
        alamat ILIKE ${`%${query}%`} OR
        email ILIKE ${`%${query}%`}
      ORDER BY tgl_daftar DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return pelanggan;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch pelanggan.");
  }
}

export async function fetchPelangganById(id: string) {
  try {
    const data = await sql<Pelanggan[]>`
      SELECT * FROM pelanggan
      WHERE id = ${id};
    `;

    if (data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch pelanggan.");
  }
}

export async function fetchPelangganPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM pelanggan
    WHERE
      nama ILIKE ${`%${query}%`} OR
      no_hp ILIKE ${`%${query}%`} OR
      COALESCE(alamat, '') ILIKE ${`%${query}%`} OR
      COALESCE(email, '') ILIKE ${`%${query}%`} OR
      tgl_daftar::text ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman pelanggan.");
  }
}

export async function fetchToko() {
  try {
    const data = await sql<Toko[]>`SELECT * FROM toko ORDER BY nama_toko ASC`;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch stores.");
  }
}

export async function fetchFilteredToko(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const toko = await sql<Toko[]>`
      SELECT
        id,
        nama_toko,
        alamat_toko,
        telephone,
        update_by,
        last_update
      FROM toko
      WHERE
        nama_toko ILIKE ${`%${query}%`} OR
        alamat_toko ILIKE ${`%${query}%`} OR
        telephone ILIKE ${`%${query}%`}
      ORDER BY nama_toko ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return toko;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch toko.");
  }
}

export async function fetchTokoPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM toko
    WHERE
      nama_toko ILIKE ${`%${query}%`} OR
      alamat_toko ILIKE ${`%${query}%`} OR
      telephone ILIKE ${`%${query}%`}
  `;
 
    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman toko.");
  }
}

export async function fetchTokoById(id: string) {
  try {
    const data = await sql<Toko[]>`
      SELECT * FROM toko
      WHERE id = ${id};
    `;
  
    if (data.length === 0) {
      return null;
    }
  
    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch toko.");
  }
}

export async function fetchDurasi() {
  try {
    const data = await sql<Durasi[]>`SELECT * FROM durasi ORDER BY nama_durasi ASC`;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch durasi.");
  }
}

export async function fetchFilteredDurasi(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  try {
    const durasi = await sql<Durasi[]>`
      SELECT
        id,
        nama_durasi,
        lama_durasi,
        toko_id,
        update_by,
        last_update
      FROM durasi
      WHERE
        ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=1`} AND
        (nama_durasi ILIKE ${`%${query}%`} OR
        toko_id::text ILIKE ${`%${query}%`})
      ORDER BY nama_durasi ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return durasi;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch durasi.");
  }
}


export async function fetchDurasiPages(query: string) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;
  try {
    const data = await sql`SELECT COUNT(*)
    FROM durasi
    WHERE
      ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=1`} AND
      (nama_durasi ILIKE ${`%${query}%`} OR
      toko_id::text ILIKE ${`%${query}%`})
  `;
  
    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman durasi.");
  }
}

export async function fetchDurasiById(id: string) {
  try {
    const data = await sql<Durasi[]>`
      SELECT * FROM durasi
      WHERE id = ${id};
    `;
  
    if (data.length === 0) {
      return null;
    }
  
    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch durasi.");
  }
}

export async function fetchTipeLayanan() {
  try {
    const data = await sql`SELECT id, nama_tipe as nama FROM tipe_layanan ORDER BY nama_tipe ASC`;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch tipe layanan.");
  }
}

export async function fetchDurasiForFilter() {
  try {
    const data = await sql`SELECT id, nama_durasi as nama, lama_durasi FROM durasi ORDER BY nama_durasi ASC`;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch durasi for filter.");
  }
}

export async function fetchFilteredLayanan(
  query: string,
  currentPage: number,
  tipeId?: string,
  durasiNama?: string,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  try {
    const layanan = await sql<TabelLayanan[]>`
      SELECT 
        l.id, 
        l.nama_layanan, 
        l.harga, 
        tl.nama_tipe, 
        d.nama_durasi, 
        d.lama_durasi,
        t.nama_toko
      FROM layanan l
      JOIN tipe_layanan tl ON l.tipe_id = tl.id
      JOIN durasi d ON l.durasi_id = d.id
      LEFT JOIN toko t ON l.toko_id = t.id
      WHERE 
        ${selectedToko ? sql`l.toko_id = ${selectedToko}` : sql`1=1`} AND
        ${tipeId ? sql`l.tipe_id = ${tipeId}` : sql`1=1`} AND
        ${durasiNama ? sql`d.nama_durasi = ${durasiNama}` : sql`1=1`} AND
        (l.nama_layanan ILIKE ${`%${query}%`} OR tl.nama_tipe ILIKE ${`%${query}%`})
      ORDER BY l.nama_layanan ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return layanan;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch layanan.");
  }
}

export async function fetchLayananPages(query: string, tipeId?: string, durasiNama?: string) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM layanan l
      JOIN tipe_layanan tl ON l.tipe_id = tl.id
      JOIN durasi d ON l.durasi_id = d.id
      WHERE 
        ${selectedToko ? sql`l.toko_id = ${selectedToko}` : sql`1=1`} AND
        ${tipeId ? sql`l.tipe_id = ${tipeId}` : sql`1=1`} AND
        ${durasiNama ? sql`d.nama_durasi = ${durasiNama}` : sql`1=1`} AND
        (l.nama_layanan ILIKE ${`%${query}%`} OR tl.nama_tipe ILIKE ${`%${query}%`})
    `;
  
    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman layanan.");
  }
}

export async function fetchLayananById(id: string) {
  try {
    const data = await sql<Layanan[]>`
      SELECT * FROM layanan
      WHERE id = ${id};
    `;
  
    if (data.length === 0) {
      return null;
    }
  
    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch layanan.");
  }
}


