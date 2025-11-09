// drizzle.config.ts
import 'dotenv/config';
import type { Config } from 'drizzle-kit';

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing POSTGRES_URL_NON_POOLING / POSTGRES_URL / DATABASE_URL');
}

export default {
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: connectionString },
  verbose: true,
  strict: true,
} satisfies Config;