'use client';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import Accordion from '@/components/Accordion';
import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';
import LogModal from '@/components/modals/LogModal';

const fetcher=(u:string)=>fetch(u).then(r=>r.json());

export default function LogsPage({ params }:{ params:{ lang: Locale }}) {
  const lang = params.lang;
  const { data: projects = [] } = useSWR('/api/projects', fetcher);
  const { data: logs = [], mutate: refetch } = useSWR('/api/logs', fetcher);
  const [logId, setLogId] = useState<string|null>(null);

  async function post(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch('/api/logs',{ method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        date: fd.get('date')||undefined,
        author: fd.get('author'),
        weather: fd.get('weather'),
        text: fd.get('text'),
        projectId: fd.get('projectId')||undefined
      })
    });
    (e.currentTarget as HTMLFormElement).reset(); refetch();
  }

  return (
    <div className="chrome">
      <Sidebar lang={lang}/>
      <div className="columns">
        <div className="column">
          <Accordion title={t(lang,'logsJournal')} defaultOpen>
            <form onSubmit={post} className="grid">
              <label>Date <input type="date" name="date" /></label>
              <input name="author" placeholder="Author" />
              <input name="weather" placeholder="Weather" />
              <label>Project
                <select name="projectId" defaultValue="">
                  <option value="">General</option>
                  {projects.map((p:any)=>(<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
              </label>
              <textarea name="text" placeholder="What happened?" required />
              <button className="primary" type="submit">Add</button>
            </form>
            <table><thead><tr><th>Date</th><th>Author</th><th>Project</th><th>Entry</th></tr></thead><tbody>
              {logs.map((l:any)=> {
                const proj = l.projectId ? projects.find((p:any)=>p.id===l.projectId)?.name : '—';
                const d = l.createdAt || l.date;
                const ds = d ? new Date(d).toLocaleDateString() : '—';
                return (
                  <tr key={l.id} className="clickable" onClick={()=>setLogId(l.id)}>
                    <td>{ds}</td><td>{l.author||'—'}</td><td>{proj||'—'}</td><td>{l.text}</td>
                  </tr>
                );
              })}
            </tbody></table>
          </Accordion>
        </div>
      </div>
      <LogModal open={!!logId} id={logId} onClose={()=>setLogId(null)} onSaved={()=>refetch()} />
    </div>
  );
}