'use client';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import Accordion from '@/components/Accordion';
import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';
import TaskModal from '@/components/modals/TaskModal';

const fetcher=(u:string)=>fetch(u).then(r=>r.json());

export default function TasksPage({ params }:{ params:{ lang: Locale }}) {
  const lang = params.lang;
  const { data: projects = [] } = useSWR('/api/projects', fetcher);
  const { data: tasks = [], mutate: refetch } = useSWR('/api/tasks', fetcher);
  const [taskId, setTaskId] = useState<string|null>(null);

  async function post(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch('/api/tasks',{ method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        title: fd.get('title'),
        description: fd.get('description'),
        assignee: fd.get('assignee'),
        projectId: fd.get('projectId')||undefined,
        status: fd.get('status'),
        dueDate: fd.get('dueDate')||undefined
      })
    });
    (e.currentTarget as HTMLFormElement).reset(); refetch();
  }

  return (
    <div className="chrome">
      <Sidebar lang={lang}/>
      <div className="columns">
        <div className="column">
          <Accordion title={t(lang,'tasks')} defaultOpen>
            <form onSubmit={post} className="grid">
              <input name="title" placeholder="Title" required />
              <textarea name="description" placeholder="Description" />
              <label>Assignee <input name="assignee" placeholder="e.g., Pierre" /></label>
              <label>Project
                <select name="projectId" defaultValue=""><option value="">Unassigned</option>
                  {projects.map((p:any)=>(<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
              </label>
              <label>Status
                <select name="status" defaultValue="PENDING"><option>PENDING</option><option>IN_PROGRESS</option><option>BLOCKED</option><option>DONE</option></select>
              </label>
              <label>Due <input type="date" name="dueDate" /></label>
              <button className="primary" type="submit">{t(lang,'addTask')}</button>
            </form>
            <table><thead><tr><th>Title</th><th>Assignee</th><th>Status</th><th>Due</th></tr></thead><tbody>
              {tasks.map((t:any)=>(
                <tr key={t.id} className="clickable" onClick={()=>setTaskId(t.id)}>
                  <td>{t.title}</td><td>{t.assignee||'—'}</td><td>{t.status}</td><td>{t.dueDate?new Date(t.dueDate).toLocaleDateString():'—'}</td>
                </tr>
              ))}
            </tbody></table>
          </Accordion>
        </div>
      </div>
      <TaskModal open={!!taskId} id={taskId} onClose={()=>setTaskId(null)} onSaved={()=>refetch()} />
    </div>
  );
}