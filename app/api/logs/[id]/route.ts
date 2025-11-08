import { update, remove, db } from '@/lib/db';
import { json } from '../../_util';
export async function GET(_:Request,{params}:{params:{id:string}}){const m=db.data.logs.find(x=>x.id===params.id); return m?json(m):json({error:'Not found'},404)}
export async function PATCH(req:Request,{params}:{params:{id:string}}){const patch=await req.json(); const updated=await update('logs',params.id,patch); return updated?json(updated):json({error:'Not found'},404)}
export async function DELETE(_:Request,{params}:{params:{id:string}}){const ok=await remove('logs',params.id); return ok?json({ok:true}):json({error:'Not found'},404)}
