'use client';
import { useState } from 'react';
import { t, type Locale } from '@/lib/i18n';

export default function Login({ params }:{ params:{ lang: Locale } }){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [err,setErr]=useState<string|null>(null);
  const lang = params.lang;
  async function submit(e:React.FormEvent){ e.preventDefault(); setErr(null);
    const res = await fetch('/api/auth/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })});
    if (res.ok) location.href = `/${lang}/admin`; else setErr(await res.text());
  }
  return (<div className="card" style={{maxWidth:480, margin:'40px auto'}}>
    <h2>{t(lang,'signIn')}</h2>
    <form onSubmit={submit} className="grid">
      <label>{t(lang,'email')} <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label>{t(lang,'password')} <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      <div><button className="primary" type="submit">{t(lang,'signIn')}</button> {err && <span style={{color:'salmon'}}>{err}</span>}</div>
    </form>
  </div>);
}
