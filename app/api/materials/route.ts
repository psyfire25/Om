import { db, create } from '@/lib/db';
import { json, bad } from '..//_util';
export async function GET(){ return json(db.data.materials) }
export async function POST(req:Request){ const body = await req.json().catch(()=>null); if(!body?.name) return bad('Missing name'); const material = await create('materials',{ name: body.name, quantity: Number(body.quantity ?? 0), unit: body.unit || undefined, location: body.location || undefined, notes: body.notes || undefined }); return json(material,201) }
