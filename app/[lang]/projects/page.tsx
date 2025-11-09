'use client';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import Accordion from '@/components/Accordion';
import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';
import ProjectModal from '@/components/modals/ProjectModal';

const fetcher=(u:string)=>fetch(u).then(r=>r.json());

export default function ProjectsPage({ params }:{ params: { lang: Locale } }) {
  const lang = params.lang;
  const { data: projects = [], mutate: refetch } = useSWR('/api/projects', fetcher);
  const [projectId, setProjectId] = useState<string|null>(null);

  async function post(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch('/api/projects',{ method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        name: fd.get('name'),
        description: fd.get('description'),
        status: fd.get('status'),
        startDate: fd.get('startDate'),
        endDate: fd.get('endDate')
      })
    });
    (e.currentTarget as HTMLFormElement).reset();
    refetch();
  }

  return (
    <div className="chrome">
      <Sidebar lang={lang}/>
      <div className="columns">
        <div className="column">
          <Accordion title={t(lang,'projects')} defaultOpen>
            <form onSubmit={post} className="grid">
              <input name="name" placeholder="Name" required />
              <textarea name="description" placeholder="Description" />
              <label>Status
                <select name="status" defaultValue="PLANNING"><option>PLANNING</option><option>ACTIVE</option><option>ON_HOLD</option><option>DONE</option></select>
              </label>
              <label>Start <input type="date" name="startDate" /></label>
              <label>End <input type="date" name="endDate" /></label>
              <button className="primary" type="submit">{t(lang,'createProject')}</button>
            </form>
            <table><thead><tr><th>Name</th><th>Status</th><th>Dates</th></tr></thead><tbody>
              {projects.map((p:any)=>(
                <tr key={p.id} className="clickable" onClick={()=>setProjectId(p.id)}>
                  <td>{p.name}</td>
                  <td>{p.status}</td>
                  <td>{p.startDate?new Date(p.startDate).toLocaleDateString():''} {p.endDate?('– '+new Date(p.endDate).toLocaleDateString()):''}</td>
                </tr>
              ))}
            </tbody></table>
          </Accordion>
        </div>
      </div>
      <ProjectModal open={!!projectId} id={projectId} onClose={()=>setProjectId(null)} onSaved={()=>refetch()} />
    </div>
  );
}