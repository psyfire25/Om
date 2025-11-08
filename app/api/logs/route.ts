import { db, create } from '@/lib/db';
import { json, bad } from '..//_util';
export async function GET(){ return json(db.data.logs.sort((a,b)=> (a.date < b.date ? 1 : -1))) }
export async function POST(req:Request){ const body = await req.json().catch(()=>null); if(!body?.text) return bad('Missing text'); const entry = await create('logs',{ date: body.date || new Date().toISOString(), author: body.author || undefined, weather: body.weather || undefined, text: body.text, projectId: body.projectId || undefined, photos: body.photos || undefined }); return json(entry,201) }
