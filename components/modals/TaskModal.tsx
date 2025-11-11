'use client';
import { useEffect, useState } from 'react';
import Drawer from '@/components/Drawer';
import useMe from '@/components/useMe';
import { getJson, patchJson, postJson, deleteJson } from '@/lib/clientFetch';

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  id?: string | null;
  projectId?: string | null;
  onClose: () => void;
  onSaved?: () => void;
  onCreated?: (newProject: any) => void;
};

export default function TaskModal({ open, mode, id, projectId, onClose, onSaved, onCreated }: Props) {
  const { me } = useMe();
  const canEdit = me?.role === 'SUPER';
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setShowDelete(false);
    if (mode === 'edit' && id) {
      getJson(`/api/tasks/${id}`).then(setTask).finally(() => setLoading(false));
    } else {
      setTask({ title: '', description: '', status: 'PENDING', projectId: projectId, assigneeId: null, startDate: null, endDate: null, dueDate: null, time: null });
      setLoading(false);
    }
  }, [open, mode, id, projectId]);

  async function save() {
    const body = {
      title: task.title,
      description: task.description,
      status: task.status,
      assigneeId: task.assigneeId || null,
      projectId: task.projectId || null,
      startDate: task.startDate || null,
      endDate: task.endDate || null,
      dueDate: task.dueDate || null,
      time: task.time || null,
    };
    if (mode === 'edit' && id) {
      const updated = await patchJson(`/api/tasks/${id}`, body);
      setTask(updated);
      onSaved?.();
    } else {
      const newTask = await postJson('/api/tasks', body);
      onCreated?.(newTask);
      onClose();
    }
  }

  async function del() {
    if (mode !== 'edit' || !id) return;
    await deleteJson(`/api/tasks/${id}`);
    onSaved?.();
    onClose();
  }

  return (
    <Drawer open={open} onClose={onClose} title={mode === 'edit' && task?.title ? `Task – ${task.title}` : 'New Task'}>
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
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <label>Due Date{canEdit ? <input type="date" value={task.dueDate?.slice(0,10)||''} onChange={e=>setTask({...task, dueDate:e.target.value||null})}/> : <div>{task.dueDate?.slice(0,10)||'—'}</div>}</label>
            <label>Time{canEdit ? <input type="time" value={task.time||''} onChange={e=>setTask({...task, time:e.target.value||null})}/> : <div>{task.time||'—'}</div>}</label>
          </div>

          {mode === 'edit' && canEdit && showDelete && (
            <div className="card" style={{ background: '#374151', marginTop: 12 }}>
              <p>Are you sure you want to delete this task?</p>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
                <button className="ghost" onClick={()=>setShowDelete(false)}>Cancel</button>
                <button className="danger" onClick={del}>Delete Task</button>
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