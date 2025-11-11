'use client';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';
import ProjectModal from '@/components/modals/ProjectModal';
import TaskModal from '@/components/modals/TaskModal';

const fetcher=(u:string)=>fetch(u).then(r=>r.json());

export default function ProjectsPage({ params }:{ params: { lang: Locale } }) {
  const lang = params.lang;
  const { data: projects = [], mutate: refetchProjects } = useSWR('/api/projects', fetcher);
  const { data: tasks = [], mutate: refetchTasks } = useSWR('/api/tasks', fetcher);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectModal, setProjectModal] = useState<{ open: boolean, mode: 'create' | 'edit', id?: string }>({ open: false, mode: 'create' });
  const [taskModal, setTaskModal] = useState<{ open: boolean, mode: 'create' | 'edit', id?: string, projectId?: string }>({ open: false, mode: 'create' });

  const projectTasks = selectedProject ? tasks.filter((t:any) => t.projectId === selectedProject.id) : [];

  return (
    <div className="chrome">
      <Sidebar lang={lang}/>
      <div className="columns" style={{ padding: 20 }}>
        <div className="column">
          <div className="col-label">{t(lang,'projects')}</div>
          <div className="card">
            <ul>
              {projects.map((p:any)=>(
                <li key={p.id} className={`clickable ${selectedProject?.id === p.id ? 'active' : ''}`} onClick={()=>setSelectedProject(p)}>
                  {p.name}
                </li>
              ))}
            </ul>
            <button onClick={() => setProjectModal({ open: true, mode: 'create' })}>{t(lang,'createProject')}</button>
          </div>
        </div>
        {selectedProject && (
          <>
            <div className="column">
              <div className="col-label">Project Details</div>
              <div className="card">
                <h2>{selectedProject.name}</h2>
                <p>{selectedProject.description}</p>
                <p>Status: {selectedProject.status}</p>
                <p>Start Date: {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : '–'}</p>
                <p>End Date: {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : '–'}</p>
                <button onClick={() => setProjectModal({ open: true, mode: 'edit', id: selectedProject.id })}>Edit Project</button>
              </div>
            </div>
            <div className="column">
              <div className="col-label">Tasks</div>
              <div className="card">
                <ul>
                  {projectTasks.map((t:any) => (
                    <li key={t.id} className="clickable" onClick={() => setTaskModal({ open: true, mode: 'edit', id: t.id })}>
                      {t.title}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setTaskModal({ open: true, mode: 'create', projectId: selectedProject.id })}>New Task</button>
              </div>
            </div>
          </>
        )}
      </div>
      <ProjectModal
        open={projectModal.open}
        mode={projectModal.mode}
        id={projectModal.id}
        onClose={()=>setProjectModal({ open: false, mode: 'create' })}
        onSaved={()=>{refetchProjects(); if(selectedProject) setSelectedProject(projects.find(p => p.id === selectedProject.id))}}
        onCreated={() => {refetchProjects()}}
      />
      <TaskModal
        open={taskModal.open}
        mode={taskModal.mode}
        id={taskModal.id}
        projectId={taskModal.projectId}
        onClose={()=>setTaskModal({ open: false, mode: 'create' })}
        onSaved={()=>refetchTasks()}
        onCreated={()=>refetchTasks()}
      />
    </div>
  );
}