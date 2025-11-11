'use client';
import { useEffect, useState } from 'react';
import Drawer from '@/components/Drawer';
import useMe from '@/components/useMe';
import { getJson, patchJson, postJson, deleteJson } from '@/lib/clientFetch';
import { Project } from '@/lib/schema';

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  id?: string | null;
  projects: Project[]; // Add projects prop
  onClose: () => void;
  onSaved?: () => void;
  onCreated?: (newMaterial: any) => void;
};

export default function MaterialModal({ open, mode, id, projects, onClose, onSaved, onCreated }: Props) {
  const { me } = useMe();
  const canEdit = me?.role === 'SUPER';
  const [m, setM] = useState<any>(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowDelete(false);
    if (mode === 'edit' && id) {
      getJson(`/api/materials/${id}`).then(setM).catch(() => {});
    } else {
      setM({ name: '', sku: '', quantity: 0, unit: 'pcs', location: '', notes: '', projectId: null });
    }
  }, [open, mode, id]);

  async function save() {
    const body = {
      name: m.name,
      sku: m.sku || null,
      quantity: Number(m.quantity ?? 0),
      unit: m.unit || 'pcs',
      location: m.location || null,
      notes: m.notes || null,
      projectId: m.projectId || null,
    };
    if (mode === 'edit' && id) {
      const updated = await patchJson(`/api/materials/${id}`, body);
      setM(updated);
      onSaved?.();
    } else {
      const newMaterial = await postJson('/api/materials', body);
      onCreated?.(newMaterial);
      onClose();
    }
  }

  async function del() {
    if (mode !== 'edit' || !id) return;
    await deleteJson(`/api/materials/${id}`);
    onSaved?.();
    onClose();
  }

  return (
    <Drawer open={open} onClose={onClose} title={mode === 'edit' && m?.name ? `Material – ${m.name}` : 'New Material'}>
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
          <label>Project{canEdit ? (
            <select value={m.projectId||''} onChange={e=>setM({...m, projectId:e.target.value||null})}>
              <option value="">— No Project —</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          ) : <div>{projects.find(p => p.id === m.projectId)?.name || '—'}</div>}</label>
          
          {mode === 'edit' && canEdit && showDelete && (
            <div className="card" style={{ background: '#374151', marginTop: 12 }}>
              <p>Are you sure you want to delete this material?</p>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
                <button className="ghost" onClick={()=>setShowDelete(false)}>Cancel</button>
                <button className="danger" onClick={del}>Delete Material</button>
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
            {mode === 'edit' && canEdit && !showDelete && <button className="danger" onClick={()=>setShowDelete(true)}>Delete</button>}
            <div className="grow" />
            <button className="ghost" onClick={onClose}>Close</button>
            {canEdit && <button className="primary" onClick={save}>Save</button>}
          </div>
        </div>
      )}
    </Drawer>
  );
}