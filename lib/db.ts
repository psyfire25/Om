import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL!;
export const client = neon(connectionString);
export const db = drizzle(client);