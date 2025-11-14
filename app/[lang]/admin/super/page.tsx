'use client';
import { useState } from 'react';
import type React from 'react';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import Accordion from '@/components/Accordion';
import { type Locale, t } from '@/lib/i18n';
import InviteModal from '@/components/modals/InviteModal';

// Safer fetcher: never throws, logs errors, and lets us normalise per-call
const fetcher = async (u: string) => {
  try {
    const res = await fetch(u);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('fetcher error', { url: u, status: res.status, text });
      // Let the caller decide how to normalise (we'll treat non-array as [])
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    }
    return await res.json();
  } catch (e) {
    console.error('network error in fetcher', u, e);
    return null;
  }
};

export default function Super({ params }: { params: { lang: Locale } }) {
  const lang = params.lang;

  const { data: me } = useSWR('/api/users/me', fetcher);

  // only fetch when SUPER
  const { data: usersData } = useSWR(
    me?.role === 'SUPER' ? '/api/users' : null,
    fetcher,
  );
  const { data: invitesData, mutate: refetchInv } = useSWR(
    me?.role === 'SUPER' ? '/api/invites' : null,
    fetcher,
  );

  // 🔑 normalise so .map is always safe
  const users = Array.isArray(usersData) ? usersData : [];
  const invites = Array.isArray(invitesData) ? invitesData : [];

  // drawer state
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  async function createInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fd.get('email') || undefined,
        role: fd.get('role') || 'STAFF',
        expiresDays: Number(fd.get('expiresDays') || 7),
        lang,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      alert('Failed to create invite: ' + text);
      return;
    }

    const data = await res.json().catch(() => ({} as any));

    // try to copy link; still open the drawer for quick edits
    if (data?.url) {
      try {
        await navigator.clipboard.writeText(data.url);
      } catch {
        // ignore clipboard failures
      }
    }

    if (data?.token) {
      setInviteToken(data.token); // open the drawer to edit
    }

    e.currentTarget.reset();
    refetchInv();
  }

  return (
    <div className="chrome">
      <Sidebar lang={lang} />
      <div className="columns">
        <div className="column">
          <Accordion title={t(lang, 'usersInvites')} defaultOpen>
            {me?.role !== 'SUPER' ? (
              <p>Forbidden</p>
            ) : (
              <>
                <form onSubmit={createInvite} className="grid">
                  <input
                    name="email"
                    type="email"
                    placeholder="Email (optional)"
                  />
                  <label>
                    {t(lang, 'role')}
                    {/* Keep roles in sync with server Role union */}
                    <select name="role" defaultValue="STAFF">
                      <option>STAFF</option>
                      <option>ADMIN</option>
                      <option>SUPER</option>
                    </select>
                  </label>
                  <label>
                    Expires (days){' '}
                    <input
                      type="number"
                      name="expiresDays"
                      defaultValue={7}
                      min={1}
                    />
                  </label>
                  <button className="primary" type="submit">
                    {t(lang, 'generateInvite')}
                  </button>
                </form>

                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Expires</th>
                      <th>Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((i: any) => (
                      <tr
                        key={i.id || i.token || i.email} // prefer id; fall back if needed
                        className="clickable"
                        onClick={() => i.token && setInviteToken(i.token)} // only if token exists
                        title="Open invite"
                      >
                        <td>{i.email || '—'}</td>
                        <td>{i.role}</td>
                        <td>
                          {i.expiresAt
                            ? new Date(i.expiresAt).toLocaleString()
                            : '—'}
                        </td>
                        <td>{i.usedAt ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </Accordion>
        </div>

        <div className="column">
          <Accordion title="Users" defaultOpen>
            {me?.role !== 'SUPER' ? (
              <p>—</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Accordion>
        </div>

        <div className="column">
          <div className="card">
            <p>
              Generate an invite, then click a row to edit details, extend
              expiry, copy link, or revoke.
            </p>
          </div>
        </div>
      </div>

      {/* Slide-in drawer for editing invites */}
      <InviteModal
        open={!!inviteToken}
        token={inviteToken}
        lang={lang}
        onClose={() => setInviteToken(null)}
        onSaved={() => refetchInv()}
      />
    </div>
  );
}