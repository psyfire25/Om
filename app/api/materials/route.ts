
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { materials } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const rows = await db.select().from(materials).orderBy(desc(materials.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json().catch(()=>null);
  const id = crypto.randomUUID();
  await db.insert(materials).values({
    id,
    name: String(body?.name||'').trim(),
    sku: body?.sku||null,
    quantity: Number(body?.quantity ?? 0),
    unit: body?.unit||'pcs',
    location: body?.location||null,
    notes: body?.notes||null,
  });
  return NextResponse.json({ ok: true, id });
}
