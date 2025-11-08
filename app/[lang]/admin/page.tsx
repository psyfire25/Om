"use client";
import useSWR from "swr";
import Sidebar from "@/components/Sidebar";
import Accordion from "@/components/Accordion";
import { t, type Locale } from "@/lib/i18n";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Admin({ params }: { params: { lang: Locale } }) {
  const lang = params.lang;
  const { data: projects = [], mutate: refetchProjects } = useSWR(
    "/api/projects",
    fetcher
  );
  const { data: tasks = [], mutate: refetchTasks } = useSWR(
    "/api/tasks",
    fetcher
  );
  const { data: materials = [], mutate: refetchMaterials } = useSWR(
    "/api/materials",
    fetcher
  );
  const { data: logs = [], mutate: refetchLogs } = useSWR("/api/logs", fetcher);

  async function post(path: string, obj: any) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obj),
    });
    if (!res.ok)
      throw new Error(await res.text().catch(() => "Request failed"));
    return res.json().catch(() => ({}));
  }

  async function onCreateProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; // cache immediately
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      description: String(fd.get("description") || ""),
      status: String(fd.get("status") || "PLANNING"),
      startDate: fd.get("startDate") || null,
      endDate: fd.get("endDate") || null,
    };
    if (!payload.name) return;

    await post("/api/projects", payload);
    form.reset(); // use cached ref
    refetchProjects();
  }

  async function onCreateMaterial(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      quantity: Number(fd.get("quantity") || 0),
      unit: String(fd.get("unit") || "pcs"),
      location: String(fd.get("location") || ""),
      notes: String(fd.get("notes") || ""),
    };
    if (!payload.name) return;

    await post("/api/materials", payload);
    form.reset();
    refetchMaterials();
  }

  async function onCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      title: String(fd.get("title") || "").trim(),
      description: String(fd.get("description") || ""),
      assigneeId: String(fd.get("assignee") || ""), // your API expects assigneeId
      projectId: String(fd.get("projectId") || "") || null,
      status: String(fd.get("status") || "PENDING"),
      dueDate: fd.get("dueDate") || null,
    };
    if (!payload.title) return;

    await post("/api/tasks", payload);
    form.reset();
    refetchTasks();
  }

  async function onCreateLog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    // API only needs text (+ optional projectId). author comes from session.
    const payload = {
      text: String(fd.get("text") || "").trim(),
      projectId: String(fd.get("projectId") || "") || null,
    };
    if (!payload.text) return;

    await post("/api/logs", payload);
    form.reset();
    refetchLogs();
  }

  return (
    <div className="chrome">
      <Sidebar lang={lang} />

      <div className="columns">
        <div className="column">
          <Accordion title={t(lang, "projects")} defaultOpen>
            <form onSubmit={onCreateProject} className="grid">
              <input name="name" placeholder="Name" required />
              <textarea name="description" placeholder="Description" />
              <label>
                Status
                <select name="status" defaultValue="PLANNING">
                  <option>PLANNING</option>
                  <option>ACTIVE</option>
                  <option>BLOCKED</option>
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
                {t(lang, "createProject")}
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
                        : ""}
                      {p.endDate
                        ? " – " + new Date(p.endDate).toLocaleDateString()
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Accordion>

          <Accordion title={t(lang, "materialsInventory")}>
            <form onSubmit={onCreateMaterial} className="grid">
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
                    <td>{m.unit || "—"}</td>
                    <td>{m.location || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Accordion>
        </div>

        <div className="column" id="tasks">
          <Accordion title={t(lang, "tasks")} defaultOpen>
            <form onSubmit={onCreateTask} className="grid">
              <input name="title" placeholder="Title" required />
              <textarea name="description" placeholder="Description" />
              <label>
                Assignee <input name="assignee" placeholder="user id or name" />
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
                {t(lang, "addTask")}
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
                    <td>{t.assigneeId || "—"}</td>
                    <td>{t.status}</td>
                    <td>
                      {t.dueDate
                        ? new Date(t.dueDate).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Accordion>
        </div>

        <div className="column" id="logs">
          <Accordion title={t(lang, "logsJournal")} defaultOpen>
            <form onSubmit={onCreateLog} className="grid">
              {/* These extra fields are kept for UI, but API only uses text + projectId */}
              <label>
                Date <input type="date" name="date" />
              </label>
              <input name="author" placeholder="Author (optional)" />
              <input name="weather" placeholder="Weather (optional)" />
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
                    : "—";
                  const d = l.createdAt
                    ? new Date(l.createdAt).toLocaleDateString()
                    : "—";
                  return (
                    <tr key={l.id}>
                      <td>{d}</td>
                      <td>{l.authorId || "—"}</td>
                      <td>{proj || "—"}</td>
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
