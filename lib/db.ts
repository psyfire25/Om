// lib/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export const neonSql = neon(process.env.DATABASE_URL!);
export const db = drizzle(neonSql);
