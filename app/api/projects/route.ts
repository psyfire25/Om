import { db, create } from '@/lib/db';
import { json, bad } from '../_util';
export async function GET(){ return json(db.data.projects.sort((a,b)=>a.name.localeCompare(b.name))) }
export async function POST(req: Request){ const body = await req.json().catch(()=>null); if(!body?.name) return bad('Missing name'); const project = await create('projects',{ name: body.name, description: body.description || '', status: body.status || 'PLANNING', startDate: body.startDate || undefined, endDate: body.endDate || undefined }); return json(project,201) }
