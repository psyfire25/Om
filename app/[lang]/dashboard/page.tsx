'use client';
import { useState } from 'react';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import { t, type Locale } from '@/lib/i18n';
import Calendar from '@/components/Calendar';

import ProjectModal from '@/components/modals/ProjectModal';
import TaskModal from '@/components/modals/TaskModal';
import MaterialModal from '@/components/modals/MaterialModal';
import LogModal from '@/components/modals/LogModal';

const fetcher = (u:string)=>fetch(u).then(r=>r.json());

export default function Dashboard({ params }:{ params:{ lang: Locale } }) {
  const lang = params.lang;

  const { data: projects = [], mutate: refetchProjects } = useSWR('/api/projects', fetcher);
  const { data: tasks = [], mutate: refetchTasks } = useSWR('/api/tasks', fetcher);
  const { data: materials = [], mutate: refetchMaterials } = useSWR('/api/materials', fetcher);
  const { data: logs = [], mutate: refetchLogs } = useSWR('/api/logs', fetcher);

  const dueSoon = (tasks||[]).filter((x:any)=>x.dueDate && new Date(x.dueDate) <= new Date(Date.now()+7*86400000));

  const [projectModal, setProjectModal] = useState<{ open: boolean, mode: 'create' | 'edit', id?: string }>({ open: false, mode: 'create' });
  const [taskModal, setTaskModal] = useState<{ open: boolean, mode: 'create' | 'edit', id?: string, projectId?: string }>({ open: false, mode: 'create' });
  const [materialModal, setMaterialModal] = useState<{ open: boolean, mode: 'create' | 'edit', id?: string }>({ open: false, mode: 'create' });
  const [logModal, setLogModal] = useState<{ open: boolean, mode: 'create' | 'edit', id?: string }>({ open: false, mode: 'create' });

  function onProjectCreated(newProject: any) {
    refetchProjects();
    setProjectModal({ open: false, mode: 'create' });
    setTaskModal({ open: true, mode: 'create', projectId: newProject.id });
  }

  function onTaskCreated() {
    refetchTasks();
    setTaskModal({ open: false, mode: 'create' });
  }

  function onMaterialCreated() {
    refetchMaterials();
    setMaterialModal({ open: false, mode: 'create' });
  }

  function onLogCreated() {
    refetchLogs();
    setLogModal({ open: false, mode: 'create' });
  }

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
              <button onClick={() => setProjectModal({ open: true, mode: 'create' })}>New Project</button>
              <button onClick={() => setTaskModal({ open: true, mode: 'create' })}>New Task</button>
              <button onClick={() => setMaterialModal({ open: true, mode: 'create' })}>New Material</button>
              <button onClick={() => setLogModal({ open: true, mode: 'create' })}>New Log</button>
            </div>
            <div className="card masonry-item">
              <Calendar variant="mini" scope="mine" months={3} lang={lang} />
            </div>
            <div className="card masonry-item">
              <h3>{t(lang,'dueSoon')}</h3>
              <ul>
                {dueSoon.slice(0,8).map((tq:any)=>(
                  <li key={tq.id} className="clickable" onClick={()=>setTaskModal({ open: true, mode: 'edit', id: tq.id })}>
                    <span className="badge">{tq.status}</span> {tq.title} — {tq.dueDate?new Date(tq.dueDate).toLocaleDateString():'—'}
                  </li>
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
              <ul>
                {projects.filter((p:any)=>p.status!=='DONE').slice(0,10).map((p:any)=>(
                  <li key={p.id} className="clickable" onClick={()=>setProjectModal({ open: true, mode: 'edit', id: p.id })}>
                    {p.name} <span className="badge">{p.status}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card masonry-item">
              <h3>Materials (latest)</h3>
              <ul>
                {materials.slice(0,10).map((m:any)=>(
                  <li key={m.id} className="clickable" onClick={()=>setMaterialModal({ open: true, mode: 'edit', id: m.id })}>
                    {m.name} — {m.quantity} {m.unit||''}
                  </li>
                ))}
                {materials.length===0 && <li>—</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="col-label">{t(lang,'logsCol')}</div>
          <div className="masonry">
            <div className="card masonry-item">
              <h3>Latest log entries</h3>
              <ul>
                {logs.slice(0,8).map((l:any)=>(
                  <li key={l.id} className="clickable" onClick={()=>setLogModal({ open: true, mode: 'edit', id: l.id })}>
                    <b>{l.author||'—'}</b>: {l.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ProjectModal
        open={projectModal.open}
        mode={projectModal.mode}
        id={projectModal.id}
        onClose={()=>setProjectModal({ open: false, mode: 'create' })}
        onSaved={()=>refetchProjects()}
        onCreated={onProjectCreated}
      />
      <TaskModal
        open={taskModal.open}
        mode={taskModal.mode}
        id={taskModal.id}
        projectId={taskModal.projectId}
        onClose={()=>setTaskModal({ open: false, mode: 'create' })}
        onSaved={()=>refetchTasks()}
        onCreated={onTaskCreated}
      />
      <MaterialModal
        open={materialModal.open}
        mode={materialModal.mode}
        id={materialModal.id}
        onClose={()=>setMaterialModal({ open: false, mode: 'create' })}
        onSaved={()=>refetchMaterials()}
        onCreated={onMaterialCreated}
      />
      <LogModal
        open={logModal.open}
        mode={logModal.mode}
        id={logModal.id}
        onClose={()=>setLogModal({ open: false, mode: 'create' })}
        onSaved={()=>refetchLogs()}
        onCreated={onLogCreated}
      />
    </div>
  );
}