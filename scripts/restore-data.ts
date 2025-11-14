// scripts/restore-from-export.ts
import 'dotenv/config';
import fs from 'node:fs/promises';
import { db } from '@/lib/db';
import { projects, tasks, logs, materials } from '@/lib/schema';

function toDate(v: any) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  const raw = await fs.readFile('public/data.json', 'utf8');
  const data = JSON.parse(raw);

  // 👉 Adjust these selectors to match your actual JSON shape
  const oldProjects = Array.isArray(data.projects)
    ? data.projects
    : Array.isArray(data)
    ? (data.find((x: any) => x.table === 'projects')?.rows ?? [])
    : [];

  const oldTasks = Array.isArray(data.tasks)
    ? data.tasks
    : Array.isArray(data)
    ? (data.find((x: any) => x.table === 'tasks')?.rows ?? [])
    : [];

  const oldLogs = Array.isArray(data.logs)
    ? data.logs
    : Array.isArray(data)
    ? (data.find((x: any) => x.table === 'logs')?.rows ?? [])
    : [];

  const oldMaterials = Array.isArray(data.materials)
    ? data.materials
    : Array.isArray(data)
    ? (data.find((x: any) => x.table === 'materials')?.rows ?? [])
    : [];

  console.log(
    `Found ${oldProjects.length} projects, ${oldTasks.length} tasks, ${oldLogs.length} logs, ${oldMaterials.length} materials`,
  );

  // --- 1) Insert projects, build id map ---

  const projectIdMap = new Map<any, string>();

  for (const p of oldProjects) {
    const [row] = await db
      .insert(projects)
      .values({
        name: p.name,
        description: p.description ?? null,
        status: (p.status as any) || 'PLANNING',
        startDate: toDate(p.start_date ?? p.startDate),
        endDate: toDate(p.end_date ?? p.endDate),
      })
      .returning();

    // old id might be "id" or something like "project_id"
    projectIdMap.set(p.id ?? p.project_id, row.id);
  }

  // --- 2) Insert tasks, remapping project_id to new UUIDs ---

  for (const t of oldTasks) {
    const oldProjId = t.project_id ?? t.projectId;
    const newProjId = oldProjId != null ? projectIdMap.get(oldProjId) ?? null : null;

    await db.insert(tasks).values({
      title: t.title,
      description: t.description ?? null,
      status: (t.status as any) || 'PENDING',
      priority: (t.priority as any) || 'MEDIUM',
      projectId: newProjId,
      assigneeId: null, // you can remap users later if needed
      startDate: toDate(t.start_date ?? t.startDate),
      endDate: toDate(t.end_date ?? t.endDate),
      dueDate: toDate(t.due_date ?? t.dueDate),
      time: t.time ?? null,
    });
  }

  // --- 3) Insert materials (link to projects if present) ---

  for (const m of oldMaterials) {
    const oldProjId = m.project_id ?? m.projectId;
    const newProjId = oldProjId != null ? projectIdMap.get(oldProjId) ?? null : null;

    await db.insert(materials).values({
      name: m.name,
      sku: m.sku ?? null,
      unit: m.unit ?? null,
      quantity: m.quantity ?? 0,
      location: m.location ?? null,
      projectId: newProjId,
    });
  }

  // --- 4) Insert logs (optional; similar remap for project/task) ---

  for (const l of oldLogs) {
    const oldProjId = l.project_id ?? l.projectId;
    const oldTaskId = l.task_id ?? l.taskId;

    const newProjId = oldProjId != null ? projectIdMap.get(oldProjId) ?? null : null;

    // If you also want to remap tasks in logs, you'd build a taskIdMap while inserting tasks.
    // For now we can ignore or set taskId: null.

    await db.insert(logs).values({
      text: l.text ?? l.body ?? '',
      projectId: newProjId,
      taskId: null,
      authorId: null, // can be wired later / ignored for dev
    });
  }

  console.log('Restore complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});