
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';

export async function GET() {
  const u = await currentUser();
  if (!u) return new NextResponse('Unauthorized', { status: 401 });
  return NextResponse.json({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    active: u.active,
  });
}
