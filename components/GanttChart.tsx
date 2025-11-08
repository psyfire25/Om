'use client';
import { useMemo } from 'react';

type Task = { id:string; title:string; startDate?:string; endDate?:string; dueDate?:string; status?:string; projectId?:string };

function daysBetween(a:Date,b:Date){ return Math.max(1, Math.ceil((b.getTime()-a.getTime())/86400000)); }

export default function GanttChart({ tasks }:{ tasks: Task[] }) {
  const rows = useMemo(()=>{
    // derive start/end; if only dueDate, show a 1-day bar ending there
    const norm = tasks.map(t=>{
      const start = t.startDate ? new Date(t.startDate) : (t.dueDate ? new Date(new Date(t.dueDate).getTime()-86400000) : new Date());
      const end = t.endDate ? new Date(t.endDate) : (t.dueDate ? new Date(t.dueDate) : start);
      return { ...t, start, end: end < start ? start : end };
    });
    const min = norm.reduce((m,r)=> r.start < m ? r.start : m, norm[0]?.start ?? new Date());
    const max = norm.reduce((m,r)=> r.end   > m ? r.end   : m, norm[0]?.end   ?? new Date());
    return { norm, min, max };
  }, [tasks]);

  const padDays = 2;
  const min = new Date(rows.min); min.setDate(min.getDate()-padDays);
  const max = new Date(rows.max); max.setDate(max.getDate()+padDays);

  const totalDays = Math.max(7, daysBetween(min, max));
  const pxPerDay = 22; const rowH = 28; const headerH = 36; const w = totalDays*pxPerDay + 160; const h = headerH + rows.norm.length*rowH + 20;

  function xFor(d:Date){ return 140 + Math.floor(daysBetween(min,d))*pxPerDay; }

  return (
    <div style={{ overflowX:'auto', border:'1px solid #1f2937', borderRadius:12, background:'#0b1220' }}>
      <svg width={w} height={h}>
        {/* grid background */}
        <rect x={0} y={0} width={w} height={h} fill="#0b1220" />
        {/* header dates */}
        {Array.from({length: totalDays+1}).map((_,i)=>{
          const dt = new Date(min); dt.setDate(min.getDate()+i);
          const x = 140 + i*pxPerDay;
          const isWeek = dt.getDay()===1; // Monday
          return (
            <g key={i}>
              <line x1={x} y1={headerH} x2={x} y2={h} stroke={isWeek?'#273449':'#1f2937'} strokeWidth={1}/>
              <text x={x+4} y={24} fill="#94a3b8" fontSize="11">{dt.toLocaleDateString(undefined,{month:'short', day:'2-digit'})}</text>
            </g>
          );
        })}
        {/* rows */}
        {rows.norm.map((t,idx)=>{
          const y = headerH + idx*rowH + 6;
          const x1 = xFor(t.start); const x2 = xFor(t.end); const barW = Math.max(8, x2 - x1);
          const status = (t.status||'PENDING');
          const fill = status==='DONE' ? '#16a34a' : status==='IN_PROGRESS' ? '#60a5fa' : status==='BLOCKED' ? '#f59e0b' : '#94a3b8';
          return (
            <g key={t.id}>
              <text x={8} y={y+10} fill="#e5e7eb" fontSize="12">{t.title}</text>
              <rect x={x1} y={y-8} width={barW} height={16} rx={4} ry={4} fill={fill} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
