'use client';
import { useEffect, useState } from 'react';

export default function EventDrawer({ eventId, onClose, lang }:{ eventId: string|null; onClose: ()=>void; lang: string }){
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    (async()=>{
      if(!eventId) return;
      setLoading(true);
      const [kind,id] = eventId.split(':');
      const url = kind==='task' ? `/api/tasks/${id}` : `/api/projects/${id}`;
      const r = await fetch(url);
      setData(r.ok ? await r.json() : null);
      setLoading(false);
    })();
  },[eventId]);

  if(!eventId) return null;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex: 1000 }}>
      <aside style={{ position:'absolute', right:0, top:0, bottom:0, width:'min(560px, 90vw)', background:'var(--panel)', borderLeft:'1px solid #1f2937', padding:16, overflow:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h3 style={{ margin:0 }}>{data?.title || data?.name || 'Event'}</h3>
          <button className="ghost" onClick={onClose}>Close</button>
        </div>
        {loading ? <p>Loading…</p> : data ? (
          <div className="grid" style={{ gap:12 }}>
            {'status' in data && <p>Status: <b>{data.status}</b></p>}
            {'projectId' in data && <p>Project: {data.projectId || '—'}</p>}
            {'assigneeId' in data && <p>Assignee: {data.assigneeId || '—'}</p>}
            <p>Start: {data.startDate ? new Date(data.startDate).toLocaleString() : '—'}</p>
            <p>End: {data.endDate ? new Date(data.endDate).toLocaleString() : '—'}</p>

            {'title' in data && (
              <form onSubmit={async (e)=>{
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const patch:any = {
                  title: String(fd.get('title')||data.title),
                  status: String(fd.get('status')||data.status),
                  startDate: fd.get('startDate') || data.startDate,
                  endDate: fd.get('endDate') || data.endDate,
                };
                const [kind,id] = (eventId!).split(':');
                const res = await fetch(`/api/${kind}s/${id}`, {
                  method:'PATCH',
                  headers:{'Content-Type':'application/json'},
                  body: JSON.stringify(patch),
                });
                if (res.ok) {
                  const updated = await res.json();
                  setData(updated);
                }
              }} className="grid" style={{ gap:8 }}>
                <input name="title" defaultValue={data.title} />
                <label>Status
                  <select name="status" defaultValue={data.status}>
                    <option>PENDING</option><option>IN_PROGRESS</option><option>BLOCKED</option><option>DONE</option>
                  </select>
                </label>
                <label>Start <input type="datetime-local" name="startDate" /></label>
                <label>End <input type="datetime-local" name="endDate" /></label>
                <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                  <button className="primary" type="submit">Save</button>
                </div>
              </form>
            )}
          </div>
        ) : <p>Not found.</p>}
      </aside>
    </div>
  );
}
