'use client';
import { useState } from 'react';

export default function LogoutButton({ lang }: { lang: string }) {
  const [busy, setBusy] = useState(false);

  async function onClick() {
    try {
      setBusy(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = `/${lang}/login`;
    } catch {
      setBusy(false);
      alert('Logout failed. Please try again.');
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="ghost"
      style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #1f2937' }}
      aria-label="Log out"
    >
      {busy ? '…' : 'Logout'}
    </button>
  );
}