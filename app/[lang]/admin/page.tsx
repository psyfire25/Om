'use client';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import Accordion from '@/components/Accordion';
import { t, type Locale } from '@/lib/i18n';

// Safer fetcher: never throws, never returns non-array for list endpoints
const fetcher = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('fetcher error', { url, status: res.status, text });
      return [];
    }
    const data = await res.json().catch(() => null);
    // if it's already an array, keep it; otherwise fallback to []
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('network error in fetcher', url, e);
    return [];
  }
};

export default function Admin({ params }: { params: { lang: Locale } }) {
  const lang = params.lang;

  const {
    data: projects = [],
    mutate: refetchProjects,
  } = useSWR('/api/projects', fetcher);
  const {
    data: tasks = [],
    mutate: refetchTasks,
  } = useSWR('/api/tasks', fetcher);
  const {
    data: materials = [],
    mutate: refetchMaterials,
  } = useSWR('/api/materials', fetcher);
  const {
    data: logs = [],
    mutate: refetchLogs,
  } = useSWR('/api/logs', fetcher);

  async function post(path: string, obj: any) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('POST error', { path, status: res.status, text });
      throw new Error(text || `Request failed: ${res.status}`);
    }
  }

  return (
    <div className="chrome">
      <Sidebar lang={lang} />

      <div className="columns">
        <div className="column">
          <Accordion title={t(lang, 'projects')} defaultOpen>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const fd = new FormData(form);
                await post('/api/projects', {
                  name: fd.get('name'),
                  description: fd.get('description'),
                  status: fd.get('status'),
                  startDate: fd.get('startDate'),
                  endDate: fd.get('endDate'),
                }).catch((err) => {
                  console.error('create project failed', err);
                  alert(err.message || 'Failed to create project');
                });
                form.reset();
                refetchProjects();
              }}
              className="grid"
            >
              <input name="name" placeholder="Name" required />
              <textarea name="description" placeholder="Description" />
              <label>
                Status
                <select name="status" defaultValue="PLANNING">
                  <option>PLANNING</option>
                  <option>ACTIVE</option>
                  <option>ON_HOLD</option>
                  <option>DONE</option>
                </select>
              </label>
              <label>
                Start <input type="date" name="startDate" />
              </label>
              <label>
                End <input type="date" name="endDate" />
              </label>
              <button className="primary" type="submit">
                {t(lang, 'createProject')}
              </button>
            </form>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Dates</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: any) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.status}</td>
                    <td>
                      {p.startDate
                        ? new Date(p.startDate).toLocaleDateString()
                        : ''}
                      {p.endDate
                        ? ' – ' + new Date(p.endDate).toLocaleDateString()
                        : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Accordion>

          <Accordion title={t(lang, 'materialsInventory')}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const fd = new FormData(form);
                await post('/api/materials', {
                  name: fd.get('name'),
                  quantity: Number(fd.get('quantity') || 0),
                  unit: fd.get('unit'),
                  location: fd.get('location'),
                  notes: fd.get('notes'),
                }).catch((err) => {
                  console.error('create material failed', err);
                  alert(err.message || 'Failed to add material');
                });
                form.reset();
                refetchMaterials();
              }}
              className="grid"
            >
              <input name="name" placeholder="Name" required />
              <label>
                Qty <input type="number" name="quantity" defaultValue={0} />
              </label>
              <input name="unit" placeholder="Unit" />
              <input name="location" placeholder="Location" />
              <textarea name="notes" placeholder="Notes" />
              <button className="primary" type="submit">
                Add
              </button>
            </form>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m: any) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.quantity}</td>
                    <td>{m.unit || '—'}</td>
                    <td>{m.location || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Accordion>
        </div>

        <div className="column" id="tasks">
          <Accordion title={t(lang, 'tasks')} defaultOpen>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const fd = new FormData(form);
                await post('/api/tasks', {
                  title: fd.get('title'),
                  description: fd.get('description'),
                  assignee: fd.get('assignee'),
                  projectId: fd.get('projectId') || undefined,
                  status: fd.get('status'),
                  dueDate: fd.get('dueDate') || undefined,
                }).catch((err) => {
                  console.error('create task failed', err);
                  alert(err.message || 'Failed to add task');
                });
                form.reset();
                refetchTasks();
              }}
              className="grid"
            >
              <input name="title" placeholder="Title" required />
              <textarea name="description" placeholder="Description" />
              <label>
                Assignee <input name="assignee" placeholder="e.g., Pierre" />
              </label>
              <label>
                Project
                <select name="projectId" defaultValue="">
                  <option value="">Unassigned</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select name="status" defaultValue="PENDING">
                  <option>PENDING</option>
                  <option>IN_PROGRESS</option>
                  <option>BLOCKED</option>
                  <option>DONE</option>
                </select>
              </label>
              <label>
                Due <input type="date" name="dueDate" />
              </label>
              <button className="primary" type="submit">
                {t(lang, 'addTask')}
              </button>
            </form>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Assignee</th>
                  <th>Status</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t: any) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td>{t.assignee || '—'}</td>
                    <td>{t.status}</td>
                    <td>
                      {t.dueDate
                        ? new Date(t.dueDate).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Accordion>
        </div>

        <div className="column" id="logs">
          <Accordion title={t(lang, 'logsJournal')} defaultOpen>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const fd = new FormData(form);
                await post('/api/logs', {
                  date: fd.get('date') || undefined,
                  author: fd.get('author'),
                  weather: fd.get('weather'),
                  text: fd.get('text'),
                  projectId: fd.get('projectId') || undefined,
                }).catch((err) => {
                  console.error('create log failed', err);
                  alert(err.message || 'Failed to add log entry');
                });
                form.reset();
                refetchLogs();
              }}
              className="grid"
            >
              <label>
                Date <input type="date" name="date" />
              </label>
              <input name="author" placeholder="Author" />
              <input name="weather" placeholder="Weather" />
              <label>
                Project
                <select name="projectId" defaultValue="">
                  <option value="">General</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <textarea name="text" placeholder="What happened?" required />
              <button className="primary" type="submit">
                Add
              </button>
            </form>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Author</th>
                  <th>Project</th>
                  <th>Entry</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l: any) => {
                  const proj = l.projectId
                    ? projects.find((p: any) => p.id === l.projectId)?.name
                    : '—';
                  const d = l.date
                    ? new Date(l.date).toLocaleDateString()
                    : '—';
                  return (
                    <tr key={l.id}>
                      <td>{d}</td>
                      <td>{l.author || '—'}</td>
                      <td>{proj || '—'}</td>
                      <td>{l.text}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Accordion>
        </div>
      </div>
    </div>
  );
}