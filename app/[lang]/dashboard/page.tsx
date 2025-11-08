'use client';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import { t, type Locale } from '@/lib/i18n';

const fetcher = (u:string)=>fetch(u).then(r=>r.json());

export default function Dashboard({ params }:{ params:{ lang: Locale } }){
  const lang = params.lang;
  const { data: projects = [] } = useSWR('/api/projects', fetcher);
  const { data: tasks = [] } = useSWR('/api/tasks', fetcher);
  const { data: materials = [] } = useSWR('/api/materials', fetcher);
  const { data: logs = [] } = useSWR('/api/logs', fetcher);

  const dueSoon = (tasks||[]).filter((x:any)=>x.dueDate && new Date(x.dueDate) <= new Date(Date.now()+7*86400000));

  return (
    <div className="chrome">
      <Sidebar lang={lang} />
      <div className="columns">
        <div className="column">
          <div className="col-label">{t(lang,'overview')}</div>
          <div className="masonry">
            <div className="card masonry-item">
              <h3>Counts</h3>
              <p>Projects: <b>{projects.length}</b></p>
              <p>Tasks: <b>{tasks.length}</b></p>
              <p>Materials: <b>{materials.length}</b></p>
              <p>Logs: <b>{logs.length}</b></p>
            </div>
            <div className="card masonry-item">
              <h3>{t(lang,'dueSoon')}</h3>
              <ul>
                {dueSoon.slice(0,8).map((tq:any)=>(
                  <li key={tq.id}><span className="badge">{tq.status}</span> {tq.title} — {tq.dueDate?new Date(tq.dueDate).toLocaleDateString():'—'}</li>
                ))}
                {dueSoon.length===0 && <li>Nothing due in 7 days.</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="col-label">{t(lang,'projectsCol')}</div>
          <div className="masonry">
            <div className="card masonry-item">
              <h3>Active projects</h3>
              <ul>{projects.filter((p:any)=>p.status!=='DONE').slice(0,10).map((p:any)=>(<li key={p.id}>{p.name} <span className="badge">{p.status}</span></li>))}</ul>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="col-label">{t(lang,'logsCol')}</div>
          <div className="masonry">
            <div className="card masonry-item">
              <h3>Latest log entries</h3>
              <ul>{logs.slice(0,8).map((l:any)=>(<li key={l.id}><b>{l.author||'—'}</b>: {l.text}</li>))}</ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
