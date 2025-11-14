'use client';
import { useCallback, useMemo, useRef } from 'react';
import useSWR from 'swr';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Tooltip } from 'react-tooltip';

type Variant = 'mini' | 'full' | 'admin';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function Calendar({
  scope = 'mine',
  variant = 'full',
  months = 1,
  initialDate,
  lang = 'en',
}: {
  scope?: 'mine' | 'all';
  variant?: Variant;
  months?: number;
  initialDate?: string;
  lang?: string;
}) {
  const calendarRef = useRef<any>(null);

  const viewRange = useMemo(() => {
    const today = initialDate ? new Date(initialDate) : new Date();
    const from = new Date(today); from.setMonth(today.getMonth() - 1);
    const to = new Date(today); to.setMonth(today.getMonth() + (months > 1 ? months : 1));
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    return { from: iso(from), to: iso(to) };
  }, [initialDate, months]);

  const { data: events = [], mutate } = useSWR(
    `/api/events`,
    fetcher,
  );

  const patchMove = useCallback(async (id: string, start?: Date | null, end?: Date | null) => {
    await fetch('/api/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, start, end }),
    });
    mutate();
  }, [mutate]);

  const onEventDrop = useCallback(async (info: any) => {
    const { id, start, end } = info.event;
    await patchMove(id, start, end);
  }, [patchMove]);

  const onEventResize = useCallback(async (info: any) => {
    const { id, start, end } = info.event;
    await patchMove(id, start, end);
  }, [patchMove]);

  const fcProps = useMemo(() => {
    if (variant === 'mini') {
      return {
        headerToolbar: false as any,
        height: 'auto',
        contentHeight: 'auto',
        aspectRatio: 1.35,
        fixedWeekCount: false,
        dayMaxEvents: false,
        navLinks: false,
      };
    }
    if (variant === 'admin') {
      return {
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
        editable: true,
        selectable: true,
        dayMaxEvents: true,
        navLinks: true,
      };
    }
    return {
      headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' },
      editable: true,
      dayMaxEvents: true,
      navLinks: true,
    };
  }, [variant]);

  const renderEventContent = (eventInfo: any) => (
    <>
      <div data-tooltip-id="event-tooltip" data-tooltip-content={`${eventInfo.event.title}\n${eventInfo.event.extendedProps.description || ''}`}>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </div>
    </>
  );

  if (variant === 'mini' && months > 1) {
    const items = Array.from({ length: months }).map((_, i) => {
      const d = new Date(initialDate ?? new Date());
      d.setMonth(d.getMonth() + i);
      return (
        <div key={i} className="card" style={{ overflow: 'hidden' }}>
          <FullCalendar
            ref={i === 0 ? calendarRef : undefined}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={d}
            locale={lang}
            events={events}
            editable={false}
            droppable={false}
            eventDisplay="block"
            height="auto"
            eventContent={renderEventContent}
            {...fcProps}
          />
        </div>
      );
    });
    return <div className="columns" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>{items}</div>;
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <Tooltip id="event-tooltip" />
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={variant === 'full' ? 'dayGridMonth' : 'timeGridWeek'}
        initialDate={initialDate}
        locale={lang}
        events={events}
        editable={variant !== 'mini'}
        droppable={false}
        eventDisplay="block"
        eventDrop={variant !== 'mini' ? onEventDrop : undefined}
        eventResize={variant !== 'mini' ? onEventResize : undefined}
        eventContent={renderEventContent}
        {...fcProps}
      />
    </div>
  );
}