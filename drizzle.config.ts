import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/schema.ts',        // or './src/lib/schema.ts' if you use /src
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;