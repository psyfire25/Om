'use client';
import { useEffect, useState } from 'react';
import Drawer from '@/components/Drawer';
import useMe from '@/components/useMe';
import { getJson, patchJson } from '@/lib/clientFetch';

export default function UserModal({ open, id, onClose, onSaved }: { open:boolean; id:string|null; onClose:()=>void; onSaved?:()=>void; }) {
  const { me } = useMe();
  const canEdit = me?.role === 'SUPER';
  const [u, setU] = useState<any>(null);

  useEffect(()=>{ if(!open||!id) return;
    getJson(`/api/users/${id}`).then(setU).catch(()=>{});
  },[open,id]);

  async function save(){
    if(!id) return;
    const body = canEdit ? { role: u.role, active: !!u.active, name: u.name } : {};
    const updated = await patchJson(`/api/users/${id}`, body);
    setU(updated); onSaved?.();
  }

  return (
    <Drawer open={open} onClose={onClose} title={u?.name ? `User – ${u.name}` : 'User'}>
      {!u ? <div className="badge">Loading…</div> : (
        <div className="grid" style={{ gap:10 }}>
          <div><strong>Email</strong><div>{u.email}</div></div>
          <label>Name{canEdit ? <input value={u.name||''} onChange={e=>setU({...u, name:e.target.value})}/> : <div>{u.name||'—'}</div>}</label>
          <label>Role{canEdit ? (
            <select value={u.role} onChange={e=>setU({...u, role:e.target.value})}>
              <option>STAFF</option><option>ADMIN</option><option>SUPER</option>
            </select>
          ) : <div>{u.role}</div>}</label>
          <label>Active{canEdit ? (
            <select value={u.active ? 'true' : 'false'} onChange={e=>setU({...u, active: e.target.value==='true'})}>
              <option value="true">true</option><option value="false">false</option>
            </select>
          ) : <div>{String(u.active)}</div>}</label>

          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
            <button className="ghost" onClick={onClose}>Close</button>
            {canEdit && <button className="primary" onClick={save}>Save</button>}
          </div>
        </div>
      )}
    </Drawer>
  );
}