'use client';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import GanttChart from '@/components/GanttChart';
import { t, type Locale } from '@/lib/i18n';

const fetcher = (u:string)=>fetch(u).then(r=>r.json());

export default function Schedule({ params }:{ params:{ lang: Locale } }) {
  const lang = params.lang;
  const { data: tasks = [] } = useSWR('/api/tasks', fetcher);
  const { data: projects = [] } = useSWR('/api/projects', fetcher);

  const tasksWithDates = (tasks||[]).map((x:any)=>{
    // try to borrow project dates if missing
    const p = x.projectId ? (projects||[]).find((pp:any)=>pp.id===x.projectId) : null;
    return { ...x, startDate: x.startDate || p?.startDate, endDate: x.endDate || p?.endDate };
  });

  return (
    <div className="chrome">
      <Sidebar lang={lang} />
      <div className="columns">
        <div className="column">
          <div className="col-label">{t(lang,'gantt')}</div>
          <div className="masonry">
            <div className="card masonry-item">
              <h3 style={{marginTop:0}}>{t(lang,'schedule')}</h3>
              <GanttChart tasks={tasksWithDates}/>
            </div>
          </div>
        </div>
        <div className="column">
          <div className="col-label">{t(lang,'projectsCol')}</div>
          <div className="card"><p>Hint: set <b>start/end dates</b> on projects or <b>due dates</b> on tasks to see bars.</p></div>
        </div>
        <div className="column">
          <div className="col-label">{t(lang,'tasksCol')}</div>
          <div className="card"><p>Status colors: <span className="badge">PENDING</span> grey • <span className="badge">IN_PROGRESS</span> blue • <span className="badge">BLOCKED</span> amber • <span className="badge">DONE</span> green.</p></div>
        </div>
      </div>
    </div>
  );
}
