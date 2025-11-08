import { update, remove, db } from '@/lib/db';
import { json } from '../../_util';
export async function GET(_:Request,{params}:{params:{id:string}}){const t=db.data.tasks.find(x=>x.id===params.id); return t?json(t):json({error:'Not found'},404)}
export async function PATCH(req:Request,{params}:{params:{id:string}}){const patch=await req.json(); const updated=await update('tasks',params.id,patch); return updated?json(updated):json({error:'Not found'},404)}
export async function DELETE(_:Request,{params}:{params:{id:string}}){const ok=await remove('tasks',params.id); return ok?json({ok:true}):json({error:'Not found'},404)}
