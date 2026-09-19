import postgres from 'postgres';
import { readFile } from 'fs/promises';

async function runMigration() {
  const sql = postgres(process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL, {
    max: 1,
    idle_timeout: 10,
    connect_timeout: 30,
  });

  const migration = await readFile('scripts/migrate-indexes.sql', 'utf8');

  try {
    // Run each CREATE INDEX statement separately for better error handling
    const statements = migration
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log('Creating index:', statement.match(/CREATE INDEX IF NOT EXISTS (\w+)/)?.[1] || statement.substring(0, 60));
      await sql.unsafe(statement);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error(error);
  } finally {
    await sql.end();
  }
}

runMigration().catch(console.error);