// lib/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const connection = neon(process.env.DATABASE_URL);
export const db = drizzle(connection);

// Optional raw SQL access (if ever needed):
// export { connection as sql };
