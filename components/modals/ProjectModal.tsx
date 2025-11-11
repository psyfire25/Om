'use client';
import { useEffect, useState } from 'react';
import Drawer from '@/components/Drawer';
import useMe from '@/components/useMe';
import { getJson, patchJson, postJson, deleteJson } from '@/lib/clientFetch';

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  id?: string | null;
  onClose: () => void;
  onSaved?: () => void;
  onCreated?: (newProject: any) => void;
};

export default function ProjectModal({ open, mode, id, onClose, onSaved, onCreated }: Props) {
  const { me } = useMe();
  const canEdit = me?.role === 'SUPER';

  const [loading, setLoading] = useState(false);
  const [proj, setProj] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [confirm, setConfirm] = useState('');

  useEffect(() => {
    if (!open) return;
    setErr(null);
    setShowDelete(false);
    setConfirm('');

    if (mode === 'edit' && id) {
      setLoading(true);
      getJson(`/api/projects/${id}`)
        .then(setProj)
        .catch(e => setErr(String(e)))
        .finally(() => setLoading(false));
    } else {
      setProj({ name: '', description: '', status: 'PLANNING', startDate: null, endDate: null });
    }
  }, [open, mode, id]);

  async function save() {
    const body = {
      name: proj.name,
      description: proj.description,
      status: proj.status,
      startDate: proj.startDate || null,
      endDate: proj.endDate || null,
    };

    if (mode === 'edit' && id) {
      const updated = await patchJson(`/api/projects/${id}`, body);
      setProj(updated);
      onSaved?.();
    } else {
      const newProject = await postJson('/api/projects', body);
      onCreated?.(newProject);
      onClose();
    }
  }

  async function del() {
    if (mode !== 'edit' || !id || confirm !== proj.name) return;
    await deleteJson(`/api/projects/${id}`);
    onSaved?.();
    onClose();
  }

  return (
    <Drawer open={open} onClose={onClose} title={mode === 'edit' && proj?.name ? `Project – ${proj.name}` : 'New Project'}>
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

          {mode === 'edit' && canEdit && showDelete && (
            <div className="card" style={{ background: '#374151', marginTop: 12 }}>
              <p>Type the project name <b>{proj.name}</b> to confirm deletion.</p>
              <input type="text" value={confirm} onChange={e=>setConfirm(e.target.value)} />
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
                <button className="ghost" onClick={()=>setShowDelete(false)}>Cancel</button>
                <button className="danger" disabled={confirm!==proj.name} onClick={del}>Delete Project</button>
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