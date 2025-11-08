import { db, update, remove } from '@/lib/db';
import { json } from '../../_util';
export async function GET(_:Request,{params}:{params:{id:string}}){const p=db.data.projects.find(x=>x.id===params.id); return p?json(p):json({error:'Not found'},404)}
export async function PATCH(req:Request,{params}:{params:{id:string}}){const patch=await req.json(); const updated=await update('projects',params.id,patch); return updated?json(updated):json({error:'Not found'},404)}
export async function DELETE(_:Request,{params}:{params:{id:string}}){const ok=await remove('projects',params.id); return ok?json({ok:true}):json({error:'Not found'},404)}
