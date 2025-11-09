'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import useMe from '@/components/useMe';
import { getJson, patchJson } from '@/lib/clientFetch';

type Props = { open:boolean; id:string|null; onClose:()=>void; onSaved?:()=>void; };

export default function ProjectModal({ open, id, onClose, onSaved }: Props) {
  const { me } = useMe();
  const canEdit = me?.role === 'SUPER';

  const [loading, setLoading] = useState(false);
  const [proj, setProj] = useState<any>(null);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    if (!open || !id) return;
    setLoading(true);
    getJson(`/api/projects/${id}`)
      .then(setProj)
      .catch(e => setErr(String(e)))
      .finally(()=>setLoading(false));
  }, [open, id]);

  async function save() {
    if (!id) return;
    const body = {
      name: proj.name,
      description: proj.description,
      status: proj.status,
      startDate: proj.startDate || null,
      endDate: proj.endDate || null,
    };
    const updated = await patchJson(`/api/projects/${id}`, body);
    setProj(updated);
    onSaved?.();
  }

  return (
    <Modal open={open} onClose={onClose} title={proj?.name ? `Project – ${proj.name}` : 'Project'}>
      {loading && <div className="badge">Loading…</div>}
      {err && <div className="badge" style={{ borderColor: '#f87171', color: '#fca5a5' }}>{err}</div>}
      {proj && (
        <div className="grid" style={{ gap: 10 }}>
          <label>Name{canEdit ? <input value={proj.name||''} onChange={e=>setProj({...proj, name:e.target.value})}/> : <div>{proj.name}</div>}</label>
          <label>Description{canEdit ? <textarea value={proj.description||''} onChange={e=>setProj({...proj, description:e.target.value})}/> : <div>{proj.description||'—'}</div>}</label>
          <label>Status{canEdit ? (
            <select value={proj.status||'PLANNING'} onChange={e=>setProj({...proj, status:e.target.value})}>
              <option>PLANNING</option><option>ACTIVE</option><option>ON_HOLD</option><option>DONE</option>
            </select>
          ) : <div>{proj.status}</div>}</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <label>Start{canEdit ? <input type="date" value={proj.startDate?.slice(0,10)||''} onChange={e=>setProj({...proj, startDate:e.target.value||null})}/> : <div>{proj.startDate?.slice(0,10)||'—'}</div>}</label>
            <label>End{canEdit ? <input type="date" value={proj.endDate?.slice(0,10)||''} onChange={e=>setProj({...proj, endDate:e.target.value||null})}/> : <div>{proj.endDate?.slice(0,10)||'—'}</div>}</label>
          </div>

          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
            <button className="ghost" onClick={onClose}>Close</button>
            {canEdit && <button className="primary" onClick={save}>Save</button>}
          </div>
        </div>
      )}
    </Modal>
  );
}