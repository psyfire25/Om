'use client';
import { useEffect, useMemo, useState } from 'react';
import Drawer from '@/components/Drawer';
import { getJson, patchJson } from '@/lib/clientFetch';

export default function InviteModal({
  open,
  token,
  lang = 'en',
  onClose,
  onSaved,
}: {
  open: boolean;
  token: string | null;
  lang?: string;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [row, setRow] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !token) return;
    setLoading(true);
    getJson(`/api/invites/${token}`)
      .then(setRow)
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, [open, token]);

  const inviteUrl = useMemo(() => {
    const base =
      (process.env.NEXT_PUBLIC_BASE_URL as string) ||
      (typeof window !== 'undefined' ? window.location.origin : '');
    return token ? `${base}/${lang}/invite/${token}` : '';
  }, [token, lang]);

  async function save() {
    if (!token) return;
    const body: any = {
      email: row.email ?? null,
      role: row.role ?? 'STAFF',
      // use extendDays to recompute expiry (optional control)
      ...(row.extendDays ? { extendDays: Number(row.extendDays) } : {}),
    };
    const updated = await patchJson(`/api/invites/${token}`, body);
    setRow(updated);
    onSaved?.();
  }

  async function revoke() {
    if (!token) return;
    if (!confirm('Revoke this invite?')) return;
    const res = await fetch(`/api/invites/${token}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Failed to revoke: ' + (await res.text()));
      return;
    }
    onSaved?.();
    onClose();
  }

  async function copy() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      alert('Copied: ' + inviteUrl);
    } catch {
      alert(inviteUrl);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title={row ? `Invite – ${row.token.slice(0, 6)}…` : 'Invite'} width={540}>
      {loading && <div className="badge">Loading…</div>}
      {err && (
        <div className="badge" style={{ borderColor: '#f87171', color: '#fca5a5' }}>
          {err}
        </div>
      )}
      {row && (
        <div className="grid" style={{ gap: 10 }}>
          <div>
            <strong>Token</strong>
            <div style={{ wordBreak: 'break-all' }}>{row.token}</div>
          </div>

          <label>
            Email
            <input
              value={row.email || ''}
              onChange={(e) => setRow({ ...row, email: e.target.value })}
              placeholder="Optional"
            />
          </label>

          <label>
            Role
            <select value={row.role} onChange={(e) => setRow({ ...row, role: e.target.value })}>
              <option>STAFF</option>
              <option>ADMIN</option>
              <option>SUPER</option>
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <strong>Created</strong>
              <div>{row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</div>
            </div>
            <div>
              <strong>Expires</strong>
              <div>{row.expiresAt ? new Date(row.expiresAt).toLocaleString() : '—'}</div>
            </div>
          </div>

          <label>
            Extend (days)
            <input
              type="number"
              min={1}
              placeholder="e.g., 7"
              value={row.extendDays || ''}
              onChange={(e) => setRow({ ...row, extendDays: e.target.value })}
            />
          </label>

          <div>
            <strong>Used</strong>
            <div>{row.usedAt ? `Yes (${new Date(row.usedAt).toLocaleString()})` : 'No'}</div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ghost" onClick={copy}>Copy link</button>
              {!row.usedAt && <button onClick={revoke}>Revoke</button>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ghost" onClick={onClose}>Close</button>
              <button className="primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}