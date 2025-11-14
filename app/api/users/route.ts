// app/api/users/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { readSession } from '@/lib/auth';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const me = await readSession();
    if (!me) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // If you want to restrict this to SUPER only, uncomment:
    // if (me.role !== 'SUPERADMIN' && me.role !== 'SUPER') {
    //   return new NextResponse('Forbidden', { status: 403 });
    // }

    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('GET /api/users error', err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 },
    );
  }
}