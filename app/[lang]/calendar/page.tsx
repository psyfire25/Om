'use client';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import { type Locale, t } from '@/lib/i18n';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { EventDropArg, EventResizeDoneArg } from '@fullcalendar/interaction';
import EventDrawer from '@/components/EventDrawer';

const fetcher = (u:string)=>fetch(u).then(r=>r.json());

export default function CalendarPage({ params }:{ params:{ lang: Locale } }) {
  const lang = params.lang;
  const [scope, setScope] = useState<'mine'|'all'>('mine');
  const [activeEventId, setActiveEventId] = useState<string|null>(null);

  const url = useMemo(()=>{
    const from = new Date(); from.setMonth(from.getMonth()-1);
    const to = new Date(); to.setMonth(to.getMonth()+4);
    const f = from.toISOString().slice(0,10);
    const t = to.toISOString().slice(0,10);
    return `/api/events?scope=${scope}&from=${f}&to=${t}`;
  }, [scope]);

  const { data: events = [], mutate } = useSWR(url, fetcher, { revalidateOnFocus: true });

  async function patchMove(id: string, start: Date, end?: Date|null) {
    await fetch('/api/events', {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ id, start, end: end ?? start }),
    });
    mutate();
  }

  async function onEventDrop(info: EventDropArg) {
    const { id, start, end } = info.event;
    if (!start) return;
    await patchMove(id, start, end);
  }
  async function onEventResize(info: EventResizeDoneArg) {
    const { id, start, end } = info.event;
    if (!start) return;
    await patchMove(id, start, end);
  }

  const headerToolbar = useMemo(()=>({ left:'prev,next today', center:'title', right:'dayGridMonth,timeGridWeek,timeGridDay' }), []);

  return (
    <div className="chrome">
      <Sidebar lang={lang} />
      <div className="columns">
        <div className="column">
          <div className="col-label">{t(lang,'schedule')}</div>
          <div className="card" style={{ marginBottom: 12, display:'flex', gap:8, alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', gap:8 }}>
              <button className={`ghost ${scope==='mine'?'active':''}`} onClick={()=>setScope('mine')}>My calendar</button>
              <button className={`ghost ${scope==='all'?'active':''}`} onClick={()=>setScope('all')}>Org calendar</button>
            </div>
            <span className="badge">{events.length} events</span>
          </div>
          <div className="card masonry-item">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={headerToolbar}
              height="auto"
              weekends
              nowIndicator
              editable
              eventDurationEditable
              eventStartEditable
              events={events}
              eventDrop={onEventDrop}
              eventResize={onEventResize}
              eventClick={(arg)=>setActiveEventId(arg.event.id)}
            />
          </div>
        </div>
      </div>
      <EventDrawer eventId={activeEventId} onClose={()=>setActiveEventId(null)} lang={lang} />
    </div>
  );
}
