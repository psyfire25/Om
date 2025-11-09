'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import useMe from '@/components/useMe';
import { getJson, patchJson } from '@/lib/clientFetch';

export default function TaskModal({ open, id, onClose, onSaved }: { open:boolean; id:string|null; onClose:()=>void; onSaved?:()=>void; }) {
  const { me } = useMe();
  const canEdit = me?.role === 'SUPER';
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ if(!open||!id) return;
    setLoading(true);
    getJson(`/api/tasks/${id}`).then(setTask).finally(()=>setLoading(false));
  },[open,id]);

  async function save(){
    if(!id) return;
    const body = {
      title: task.title,
      description: task.description,
      status: task.status,
      assigneeId: task.assigneeId || null,
      projectId: task.projectId || null,
      startDate: task.startDate || null,
      endDate: task.endDate || null,
      dueDate: task.dueDate || null,
    };
    const updated = await patchJson(`/api/tasks/${id}`, body);
    setTask(updated); onSaved?.();
  }

  return (
    <Modal open={open} onClose={onClose} title={task?.title ? `Task – ${task.title}` : 'Task'}>
      {loading && <div className="badge">Loading…</div>}
      {task && (
        <div className="grid" style={{ gap: 10 }}>
          <label>Title{canEdit ? <input value={task.title||''} onChange={e=>setTask({...task, title:e.target.value})}/> : <div>{task.title}</div>}</label>
          <label>Description{canEdit ? <textarea value={task.description||''} onChange={e=>setTask({...task, description:e.target.value})}/> : <div>{task.description||'—'}</div>}</label>
          <label>Status{canEdit ? (
            <select value={task.status||'PENDING'} onChange={e=>setTask({...task, status:e.target.value})}>
              <option>PENDING</option><option>IN_PROGRESS</option><option>BLOCKED</option><option>DONE</option>
            </select>
          ) : <div>{task.status}</div>}</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <label>Start{canEdit ? <input type="date" value={task.startDate?.slice(0,10)||''} onChange={e=>setTask({...task, startDate:e.target.value||null})}/> : <div>{task.startDate?.slice(0,10)||'—'}</div>}</label>
            <label>End{canEdit ? <input type="date" value={task.endDate?.slice(0,10)||''} onChange={e=>setTask({...task, endDate:e.target.value||null})}/> : <div>{task.endDate?.slice(0,10)||'—'}</div>}</label>
          </div>
          <label>Due{canEdit ? <input type="date" value={task.dueDate?.slice(0,10)||''} onChange={e=>setTask({...task, dueDate:e.target.value||null})}/> : <div>{task.dueDate?.slice(0,10)||'—'}</div>}</label>

          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
            <button className="ghost" onClick={onClose}>Close</button>
            {canEdit && <button className="primary" onClick={save}>Save</button>}
          </div>
        </div>
      )}
    </Modal>
  );
}