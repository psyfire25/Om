'use client';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import Accordion from '@/components/Accordion';
import { type Locale, t } from '@/lib/i18n';

const fetcher = (u:string)=>fetch(u).then(r=>r.json());

export default function Super({ params }:{ params:{ lang: Locale } }){
  const lang = params.lang;
  const { data: me } = useSWR('/api/users/me', fetcher);
  const { data: users = [] } = useSWR(me?.role==='SUPER'?'/api/users':null, fetcher);
  const { data: invites = [], mutate: refetchInv } = useSWR(me?.role==='SUPER'?'/api/invites':null, fetcher);

  async function createInvite(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/invites',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      email: fd.get('email') || undefined,
      role: fd.get('role') || 'STAFF',
      expiresDays: Number(fd.get('expiresDays') || 7),
      lang
    })});
    const data = await res.json();
    alert('Invite: ' + data.url);
    refetchInv();
  }

  return (
    <div className="chrome">
      <Sidebar lang={lang} />
      <div className="columns">
        <div className="column">
          <Accordion title={t(lang,'usersInvites')} defaultOpen>
            {me?.role!=='SUPER' ? <p>Forbidden</p> : (<>
              <form onSubmit={createInvite} className="grid">
                <input name="email" type="email" placeholder="Email (optional)" />
                <label>{t(lang,'role')}
                  <select name="role" defaultValue="STAFF"><option>STAFF</option><option>GUARD</option><option>ADMIN</option></select>
                </label>
                <label>Expires (days) <input type="number" name="expiresDays" defaultValue={7} min={1} /></label>
                <button className="primary" type="submit">{t(lang,'generateInvite')}</button>
              </form>
              <table><thead><tr><th>Email</th><th>Role</th><th>Expires</th><th>Used</th></tr></thead><tbody>
                {invites.map((i:any)=>(<tr key={i.token}><td>{i.email||'—'}</td><td>{i.role}</td><td>{new Date(i.expiresAt).toLocaleString()}</td><td>{i.usedAt?'Yes':'No'}</td></tr>))}
              </tbody></table>
            </>)}
          </Accordion>
        </div>
        <div className="column">
          <Accordion title="Users" defaultOpen>
            {me?.role!=='SUPER' ? <p>—</p> : (
              <table><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>
                {users.map((u:any)=>(<tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>))}
              </tbody></table>
            )}
          </Accordion>
        </div>
        <div className="column">
          <div className="card"><p>Copy the generated link and send it to the user. They’ll confirm details and set a password.</p></div>
        </div>
      </div>
    </div>
  );
}
