// app/api/users/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { requireRole } from '@/lib/auth';
import { desc } from 'drizzle-orm';

export async function GET() {
  // Only SUPER can list all users (keep as in your previous logic)
  await requireRole('SUPER');

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return NextResponse.json(rows);
}