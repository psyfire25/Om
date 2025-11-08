'use client';
import { useEffect, useState } from 'react';
import { type Locale, t } from '@/lib/i18n';

export default function Accept({ params }:{ params:{ lang: Locale, token: string } }){
  const lang = params.lang;
  const [info,setInfo]=useState<any>(null);
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [status,setStatus]=useState<string|null>(null);

  useEffect(()=>{ fetch('/api/invites/'+params.token).then(r=>r.json()).then(d=>{ setInfo(d); setEmail(d.email||'') }); },[params.token]);
  async function submit(e:React.FormEvent){ e.preventDefault(); setStatus('…');
    const res = await fetch('/api/invites/'+params.token,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password })});
    if (res.ok) location.href = `/${lang}/admin`; else setStatus(await res.text());
  }

  if (!info) return <div className="card" style={{maxWidth:600, margin:'40px auto'}}>Loading…</div>;
  if (info.error) return <div className="card" style={{maxWidth:600, margin:'40px auto', color:'salmon'}}>{info.error}</div>;

  return (<div className="card" style={{maxWidth:600, margin:'40px auto'}}>
    <h2>{t(lang,'inviteAccept')}</h2>
    <p>Role: <b>{info.role}</b></p>
    <form onSubmit={submit} className="grid">
      <label>{t(lang,'name')} <input value={name} onChange={e=>setName(e.target.value)} required /></label>
      <label>{t(lang,'email')} <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label>{t(lang,'password')} <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      <button className="primary" type="submit">Continue</button> {status && <span>{status}</span>}
    </form>
  </div>);
}
