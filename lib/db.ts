import { JSONFileSyncPreset } from 'lowdb/node';
import { nanoid } from 'nanoid';

type ID = string;
export type Role = 'SUPER' | 'ADMIN' | 'STAFF' | 'GUARD';

export type User = { id: ID; name: string; email: string; role: Role; passwordHash: string; active: boolean; createdAt: string; updatedAt: string; };
export type Invite = { token: string; role: Role; email?: string; createdBy?: string; createdAt: string; expiresAt: string; usedAt?: string; usedBy?: string; };

export type Project = { id: ID; name: string; description?: string; status: 'PLANNING'|'ACTIVE'|'ON_HOLD'|'DONE'; startDate?: string; endDate?: string; createdAt: string; updatedAt: string; };
export type Task = { id: ID; projectId?: ID; title: string; description?: string; assignee?: string; status: 'PENDING'|'IN_PROGRESS'|'BLOCKED'|'DONE'; dueDate?: string; createdAt: string; updatedAt: string; };
export type Material = { id: ID; name: string; quantity: number; unit?: string; location?: string; notes?: string; createdAt: string; updatedAt: string; };
export type LogEntry = { id: ID; date: string; author?: string; weather?: string; text: string; projectId?: ID; photos?: string[]; createdAt: string; updatedAt: string; };

type DBShape = { users: User[]; invites: Invite[]; projects: Project[]; tasks: Task[]; materials: Material[]; logs: LogEntry[]; };
const defaults: DBShape = { users: [], invites: [], projects: [], tasks: [], materials: [], logs: [] };
export const db = JSONFileSyncPreset<DBShape>('data/db.json', defaults);

// naive write lock
let writing = false; const queue: (()=>void)[] = [];
function lock(): Promise<() => void> {
  return new Promise(resolve => {
    const tryAcquire = () => {
      if (!writing) { writing = true; resolve(() => { writing = false; const next = queue.shift(); if (next) next(); }); }
      else queue.push(tryAcquire);
    }; tryAcquire();
  });
}

export async function create<T extends keyof DBShape>(table: T, item: Omit<DBShape[T][number], 'id'|'createdAt'|'updatedAt'>) {
  const unlock = await lock();
  try {
    const now = new Date().toISOString();
    // @ts-ignore
    const withMeta = { id: nanoid(), createdAt: now, updatedAt: now, ...item };
    // @ts-ignore
    db.data[table].unshift(withMeta);
    db.write();
    return withMeta;
  } finally { unlock(); }
}
export async function update<T extends keyof DBShape>(table: T, id: string, patch: Partial<DBShape[T][number]>) {
  const unlock = await lock();
  try {
    // @ts-ignore
    const arr = db.data[table];
    const idx = arr.findIndex((x:any)=>x.id===id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    arr[idx] = { ...arr[idx], ...patch, updatedAt: now }; db.write(); return arr[idx];
  } finally { unlock(); }
}
export async function remove<T extends keyof DBShape>(table: T, id: string) {
  const unlock = await lock();
  try {
    // @ts-ignore
    const arr = db.data[table];
    const idx = arr.findIndex((x:any)=>x.id===id);
    if (idx === -1) return false;
    arr.splice(idx,1); db.write(); return true;
  } finally { unlock(); }
}
