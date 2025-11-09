'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import useMe from '@/components/useMe';
import { getJson, patchJson } from '@/lib/clientFetch';

export default function LogModal({
  open,
  id,
  onClose,
  onSaved,
}: {
  open: boolean;
  id: string | null;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { me } = useMe();
  const canEdit = me?.role === 'SUPER';
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !id) return;
    setLoading(true);
    getJson(`/api/logs/${id}`)
      .then(setLog)
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, [open, id]);

  async function save() {
    if (!id) return;
    const body = {
      text: log.text,
      level: log.level || 'INFO',
      authorId: log.authorId || null,
      projectId: log.projectId || null,
      taskId: log.taskId || null,
      createdAt: log.createdAt || null,
    };
    const updated = await patchJson(`/api/logs/${id}`, body);
    setLog(updated);
    onSaved?.();
  }

  return (
    <Modal open={open} onClose={onClose} title={log ? `Log – ${log.id.slice(0, 6)}…` : 'Log'}>
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

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="ghost" onClick={onClose}>Close</button>
            {canEdit && <button className="primary" onClick={save}>Save</button>}
          </div>
        </div>
      )}
    </Modal>
  );
}