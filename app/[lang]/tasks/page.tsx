'use client';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';
import TaskModal from '@/components/modals/TaskModal';
import ProjectModal from '@/components/modals/ProjectModal';

const fetcher=(u:string)=>fetch(u).then(r=>r.json());

export default function TasksPage({ params }:{ params:{ lang: Locale }}) {
  const lang = params.lang;
  const { data: projects = [], mutate: refetchProjects } = useSWR('/api/projects', fetcher);
  const { data: tasks = [], mutate: refetchTasks } = useSWR('/api/tasks', fetcher);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskModal, setTaskModal] = useState<{ open: boolean, mode: 'create' | 'edit', id?: string, projectId?: string }>({ open: false, mode: 'create' });
  const [projectModal, setProjectModal] = useState<{ open: boolean, mode: 'create' | 'edit', id?: string }>({ open: false, mode: 'create' });

  const taskProject = selectedTask ? projects.find((p:any) => p.id === selectedTask.projectId) : null;

  return (
    <div className="chrome">
      <Sidebar lang={lang}/>
      <div className="columns" style={{ padding: 20 }}>
        <div className="column">
          <div className="col-label">{t(lang,'tasks')}</div>
          <div className="card">
            <ul>
              {tasks.map((t:any)=>(
                <li key={t.id} className={`clickable ${selectedTask?.id === t.id ? 'active' : ''}`} onClick={()=>setSelectedTask(t)}>
                  {t.title}
                </li>
              ))}
            </ul>
            <button onClick={() => setTaskModal({ open: true, mode: 'create' })}>{t(lang,'addTask')}</button>
          </div>
        </div>
        {selectedTask && (
          <>
            <div className="column">
              <div className="col-label">Task Details</div>
              <div className="card">
                <h2>{selectedTask.title}</h2>
                <p>{selectedTask.description}</p>
                <p>Status: {selectedTask.status}</p>
                <p>Due Date: {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : '–'}</p>
                <button onClick={() => setTaskModal({ open: true, mode: 'edit', id: selectedTask.id })}>Edit Task</button>
              </div>
            </div>
            {taskProject && (
              <div className="column">
                <div className="col-label">Project</div>
                <div className="card clickable" onClick={() => setProjectModal({ open: true, mode: 'edit', id: taskProject.id })}>
                  <h2>{taskProject.name}</h2>
                  <p>{taskProject.description}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <TaskModal
        open={taskModal.open}
        mode={taskModal.mode}
        id={taskModal.id}
        projectId={taskModal.projectId}
        onClose={()=>setTaskModal({ open: false, mode: 'create' })}
        onSaved={()=>{refetchTasks(); if(selectedTask) setSelectedTask(tasks.find(t => t.id === selectedTask.id))}}
        onCreated={()=>refetchTasks()}
      />
      <ProjectModal
        open={projectModal.open}
        mode={projectModal.mode}
        id={projectModal.id}
        onClose={()=>setProjectModal({ open: false, mode: 'create' })}
        onSaved={()=>refetchProjects()}
      />
    </div>
  );
}