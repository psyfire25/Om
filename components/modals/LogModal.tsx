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
  onCreated?: (newLog: any) => void;
};

export default function LogModal({ open, mode, id, onClose, onSaved, onCreated }: Props) {
  const { me } = useMe();
  const canEdit = me?.role === 'SUPER';
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setShowDelete(false);
    if (mode === 'edit' && id) {
      getJson(`/api/logs/${id}`)
        .then(setLog)
        .catch((e) => setErr(String(e)))
        .finally(() => setLoading(false));
    } else {
      setLog({ text: '', level: 'INFO', authorId: me?.id || null, projectId: null, taskId: null, createdAt: new Date() });
      setLoading(false);
    }
  }, [open, mode, id, me]);

  async function save() {
    const body = {
      text: log.text,
      level: log.level || 'INFO',
      authorId: log.authorId || null,
      projectId: log.projectId || null,
      taskId: log.taskId || null,
      createdAt: log.createdAt || null,
    };
    if (mode === 'edit' && id) {
      const updated = await patchJson(`/api/logs/${id}`, body);
      setLog(updated);
      onSaved?.();
    } else {
      const newLog = await postJson('/api/logs', body);
      onCreated?.(newLog);
      onClose();
    }
  }

  async function del() {
    if (mode !== 'edit' || !id) return;
    await deleteJson(`/api/logs/${id}`);
    onSaved?.();
    onClose();
  }

  return (
    <Drawer open={open} onClose={onClose} title={mode === 'edit' && log ? `Log – ${log.id.slice(0, 6)}…` : 'New Log'}>
      {loading && <div className="badge">Loading…</div>}
      {err && <div className="badge" style={{ borderColor: '#f87171', color: '#fca5a5' }}>{err}</div>}
      {log && (
        <div className="grid" style={{ gap: 10 }}>
          <label>
            Level
            {canEdit ? (
              <select value={log.level || 'INFO'} onChange={(e) => setLog({ ...log, level: e.target.value })}>
                <option>INFO</option>
                <option>WARN</option>
                <option>ERROR</option>
              </select>
            ) : (
              <div>{log.level}</div>
            )}
          </label>
          <label>
            Text
            {canEdit ? (
              <textarea value={log.text || ''} onChange={(e) => setLog({ ...log, text: e.target.value })} />
            ) : (
              <div>{log.text}</div>
            )}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <strong>Author</strong>
              <div>{log.authorId || '—'}</div>
            </div>
            <div>
              <strong>Project</strong>
              <div>{log.projectId || '—'}</div>
            </div>
          </div>
          <div>
            <strong>Date</strong>
            <div>{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</div>
          </div>

          {mode === 'edit' && canEdit && showDelete && (
            <div className="card" style={{ background: '#374151', marginTop: 12 }}>
              <p>Are you sure you want to delete this log?</p>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
                <button className="ghost" onClick={()=>setShowDelete(false)}>Cancel</button>
                <button className="danger" onClick={del}>Delete Log</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
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