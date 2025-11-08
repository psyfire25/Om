import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { defaultLocale } from '@/lib/i18n';

export async function GET() {
  await requireRole('SUPER');
  return NextResponse.json(db.data.invites);
}

export async function POST(req: Request) {
  const me = await requireRole('SUPER');
  const body = await req.json().catch(()=>null);
  const role = body?.role || 'STAFF';
  const email = body?.email || undefined;
  const days = Number(body?.expiresDays || 7);
  const lang = (body?.lang || defaultLocale) as string;

  const token = crypto.randomUUID();
  const now = new Date();
  const invite = { token, role, email, createdBy: me.sub, createdAt: now.toISOString(), expiresAt: new Date(now.getTime()+days*86400000).toISOString() };
  db.data.invites.push(invite as any); db.write();

  const base = process.env.BASE_URL || 'http://localhost:3000';
  return NextResponse.json({ token, url: `${base}/${lang}/invite/${token}` });
}
