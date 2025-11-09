'use client';
import { useEffect, useState } from 'react';
import Drawer from '@/components/Drawer';
import useMe from '@/components/useMe';
import { getJson, patchJson } from '@/lib/clientFetch';

export default function MaterialModal({ open, id, onClose, onSaved }: { open:boolean; id:string|null; onClose:()=>void; onSaved?:()=>void; }) {
  const { me } = useMe();
  const canEdit = me?.role === 'SUPER';
  const [m, setM] = useState<any>(null);

  useEffect(()=>{ if(!open||!id) return;
    getJson(`/api/materials/${id}`).then(setM).catch(()=>{}); 
  },[open,id]);

  async function save(){
    if(!id) return;
    const body = {
      name: m.name,
      sku: m.sku || null,
      quantity: Number(m.quantity ?? 0),
      unit: m.unit || 'pcs',
      location: m.location || null,
      notes: m.notes || null,
    };
    const updated = await patchJson(`/api/materials/${id}`, body);
    setM(updated); onSaved?.();
  }

  return (
    <Drawer open={open} onClose={onClose} title={m?.name ? `Material – ${m.name}` : 'Material'}>
      {!m ? <div className="badge">Loading…</div> : (
        <div className="grid" style={{ gap:10 }}>
          <label>Name{canEdit ? <input value={m.name||''} onChange={e=>setM({...m, name:e.target.value})}/> : <div>{m.name}</div>}</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            <label>Qty{canEdit ? <input type="number" value={m.quantity ?? 0} onChange={e=>setM({...m, quantity:e.target.value})}/> : <div>{m.quantity}</div>}</label>
            <label>Unit{canEdit ? <input value={m.unit||''} onChange={e=>setM({...m, unit:e.target.value})}/> : <div>{m.unit||'—'}</div>}</label>
            <label>SKU{canEdit ? <input value={m.sku||''} onChange={e=>setM({...m, sku:e.target.value})}/> : <div>{m.sku||'—'}</div>}</label>
          </div>
          <label>Location{canEdit ? <input value={m.location||''} onChange={e=>setM({...m, location:e.target.value})}/> : <div>{m.location||'—'}</div>}</label>
          <label>Notes{canEdit ? <textarea value={m.notes||''} onChange={e=>setM({...m, notes:e.target.value})}/> : <div>{m.notes||'—'}</div>}</label>
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
            <button className="ghost" onClick={onClose}>Close</button>
            {canEdit && <button className="primary" onClick={save}>Save</button>}
          </div>
        </div>
      )}
    </Drawer>
  );
}