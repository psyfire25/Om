import { db } from '@/lib/db';
import { hashPassword, signSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const inv = db.data.invites.find(i=>i.token===params.token);
  if (!inv) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  if (inv.usedAt) return NextResponse.json({ error: 'Invite already used' }, { status: 400 });
  if (new Date(inv.expiresAt) < new Date()) return NextResponse.json({ error: 'Invite expired' }, { status: 400 });
  return NextResponse.json({ role: inv.role, email: inv.email });
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const inv = db.data.invites.find(i=>i.token===params.token);
  if (!inv) return new NextResponse('Invite not found', { status: 404 });
  if (inv.usedAt) return new NextResponse('Invite already used', { status: 400 });
  if (new Date(inv.expiresAt) < new Date()) return new NextResponse('Invite expired', { status: 400 });

  const body = await req.json().catch(()=>null);
  if (!body?.name || !body?.email || !body?.password) return new NextResponse('Missing fields', { status: 400 });
  if (db.data.users.find(u=>u.email.toLowerCase()===String(body.email).toLowerCase())) return new NextResponse('Email already in use', { status: 400 });

  const now = new Date().toISOString();
  const passwordHash = await hashPassword(body.password);
  const user = { id: crypto.randomUUID(), name: body.name, email: String(body.email).toLowerCase(), role: inv.role, passwordHash, active: true, createdAt: now, updatedAt: now };
  db.data.users.push(user as any);
  inv.usedAt = now; inv.usedBy = user.id; db.write();

  const token = await signSession(user as any);
  const res = NextResponse.json({ ok: true });
  res.cookies.set('session', token, { httpOnly: true, sameSite: 'lax', path: '/' });
  return res;
}
