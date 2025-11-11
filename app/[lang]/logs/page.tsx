'use client';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import { t, type Locale } from '@/lib/i18n';
import { useState } from 'react';
import LogModal from '@/components/modals/LogModal';
import { Log, Project } from '@/lib/schema';

const fetcher=(u:string)=>fetch(u).then(r=>r.json());

export default function LogsPage({ params }:{ params:{ lang: Locale }}) {
  const lang = params.lang;
  const { data: projects = [] } = useSWR<Project[]>('/api/projects', fetcher);
  const { data: logs = [], mutate: refetch } = useSWR<Log[]>('/api/logs', fetcher);
  const [selectedLog, setSelectedLog] = useState<Log|null>(null);
  const [logModal, setLogModal] = useState<{ open: boolean, mode: 'create' | 'edit', id?: string }>({ open: false, mode: 'create' });

  return (
    <div className="chrome">
      <Sidebar lang={lang}/>
      <div className="main-content">
        <div className="columns" style={{ padding: 20 }}>
          <div className="column">
            <div className="col-label">{t(lang,'logsJournal')}</div>
            <div className="card">
              <ul>
                {logs.map((l:Log)=>(
                  <li key={l.id} className={`clickable ${selectedLog?.id === l.id ? 'active' : ''}`} onClick={()=>setSelectedLog(l)}>
                    {new Date(l.createdAt).toLocaleDateString()} – {l.text.slice(0, 50)}...
                  </li>
                ))}
              </ul>
              <button onClick={() => setLogModal({ open: true, mode: 'create' })}>Add Log</button>
            </div>
          </div>
          {selectedLog && (
            <div className="column">
              <div className="col-label">Log Details</div>
              <div className="card">
                <p><b>Date:</b> {new Date(selectedLog.createdAt).toLocaleString()}</p>
                <p><b>Author:</b> {selectedLog.author || '–'}</p>
                <p><b>Project:</b> {projects.find((p:Project) => p.id === selectedLog.projectId)?.name || '–'}</p>
                <p><b>Weather:</b> {selectedLog.weather || '–'}</p>
                <p>{selectedLog.text}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <LogModal
        open={logModal.open}
        mode={logModal.mode}
        id={logModal.id}
        onClose={()=>setLogModal({ open: false, mode: 'create' })}
        onSaved={()=>{refetch(); if(selectedLog) setSelectedLog(logs.find(l => l.id === selectedLog.id) || null)}}
        onCreated={()=>refetch()}
      />
    </div>
  );
}