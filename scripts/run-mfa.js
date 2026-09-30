// Runner migrasi MFA (scripts/migrate-mfa.sql) — pola sama dengan
// run-indexes.js (psql tidak tersedia di lingkungan ini).
//
// Jalankan: node --env-file=.env scripts/run-mfa.js

import postgres from 'postgres';
import { readFile } from 'fs/promises';

async function runMigration() {
  const sql = postgres(process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL, {
    max: 1,
    idle_timeout: 10,
    connect_timeout: 30,
  });

  const migration = await readFile('scripts/migrate-mfa.sql', 'utf8');

  try {
    // Jalankan tiap statement terpisah untuk penanganan error yang lebih
    // baik. Baris komentar di-strip dari tiap chunk DULU — chunk yang
    // diawali komentar tapi berisi statement tidak boleh terbuang.
    const statements = migration
      .split(';')
      .map(s =>
        s
          .split('\n')
          .filter(l => !l.trim().startsWith('--'))
          .join('\n')
          .trim(),
      )
      .filter(s => s.length > 0);

    for (const statement of statements) {
      console.log('Menjalankan:', statement.replace(/\s+/g, ' ').substring(0, 70));
      await sql.unsafe(statement);
    }

    console.log('Migrasi MFA selesai!');
  } catch (error) {
    console.error('Migrasi gagal:', error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

runMigration().catch(console.error);