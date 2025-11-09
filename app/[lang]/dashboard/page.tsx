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

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Dashboard({ params }: { params: { lang: Locale } }) {
  const lang = params.lang;

  // data
  const { data: projects = [], mutate: refetchProjects } = useSWR('/api/projects', fetcher);
  const { data: tasks = [], mutate: refetchTasks } = useSWR('/api/tasks', fetcher);
  const { data: materials = [], mutate: refetchMaterials } = useSWR('/api/materials', fetcher);
  const { data: logs = [], mutate: refetchLogs } = useSWR('/api/logs', fetcher);

  const dueSoon = (tasks || []).filter(
    (x: any) => x.dueDate && new Date(x.dueDate) <= new Date(Date.now() + 7 * 86400000)
  );

  // modal state
  const [projectId, setProjectId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [materialId, setMaterialId] = useState<string | null>(null);
  const [logId, setLogId] = useState<string | null>(null);

  return (
    <div className="chrome">
      <Sidebar lang={lang} />

      <div className="columns">
        <div className="column">
          <div className="col-label">{t(lang, 'overview')}</div>
          <div className="masonry">
            <div className="card masonry-item">
              <h3>Counts</h3>
              <p>Projects: <b>{projects.length}</b></p>
              <p>Tasks: <b>{tasks.length}</b></p>
              <p>Materials: <b>{materials.length}</b></p>
              <p>Logs: <b>{logs.length}</b></p>
            </div>

            <div className="card masonry-item">
              <Calendar variant="mini" scope="mine" months={3} lang={params.lang} />
            </div>

            <div className="card masonry-item">
              <h3>{t(lang, 'dueSoon')}</h3>
              <ul>
                {dueSoon.slice(0, 8).map((tq: any) => (
                  <li
                    key={tq.id}
                    className="clickable"
                    onClick={() => setTaskId(tq.id)}
                    title="Open task"
                  >
                    <span className="badge">{tq.status}</span>{' '}
                    {tq.title} — {tq.dueDate ? new Date(tq.dueDate).toLocaleDateString() : '—'}
                  </li>
                ))}
                {dueSoon.length === 0 && <li>Nothing due in 7 days.</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="col-label">{t(lang, 'projectsCol')}</div>
          <div className="masonry">
            <div className="card masonry-item">
              <h3>Active projects</h3>
              <ul>
                {projects
                  .filter((p: any) => p.status !== 'DONE')
                  .slice(0, 10)
                  .map((p: any) => (
                    <li
                      key={p.id}
                      className="clickable"
                      onClick={() => setProjectId(p.id)}
                      title="Open project"
                    >
                      {p.name} <span className="badge">{p.status}</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="card masonry-item">
              <h3>Materials (latest)</h3>
              <ul>
                {materials.slice(0, 10).map((m: any) => (
                  <li
                    key={m.id}
                    className="clickable"
                    onClick={() => setMaterialId(m.id)}
                    title="Open material"
                  >
                    {m.name} — {m.quantity} {m.unit || ''}
                  </li>
                ))}
                {materials.length === 0 && <li>—</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="col-label">{t(lang, 'logsCol')}</div>
          <div className="masonry">
            <div className="card masonry-item">
              <h3>Latest log entries</h3>
              <ul>
                {logs.slice(0, 8).map((l: any) => (
                  <li
                    key={l.id}
                    className="clickable"
                    onClick={() => setLogId(l.id)}
                    title="Open log"
                  >
                    <b>{l.author || '—'}</b>: {l.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Detail modals */}
      <ProjectModal
        open={!!projectId}
        id={projectId}
        onClose={() => setProjectId(null)}
        onSaved={() => refetchProjects()}
      />
      <TaskModal
        open={!!taskId}
        id={taskId}
        onClose={() => setTaskId(null)}
        onSaved={() => refetchTasks()}
      />
      <MaterialModal
        open={!!materialId}
        id={materialId}
        onClose={() => setMaterialId(null)}
        onSaved={() => refetchMaterials()}
      />
      <LogModal
        open={!!logId}
        id={logId}
        onClose={() => setLogId(null)}
        onSaved={() => refetchLogs()}
      />
    </div>
  );
}