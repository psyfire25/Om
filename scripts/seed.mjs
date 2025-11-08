import { db } from '../lib/db.ts';
import bcrypt from 'bcryptjs';

const now = new Date().toISOString();
if (!db.data.users.find(u=>u.role==='SUPER')) {
  const passwordHash = await bcrypt.hash('change-me', 10);
  db.data.users.push({ id: 'super-1', name: 'Super Admin', email: 'super@example.com', role: 'SUPER', passwordHash, active: true, createdAt: now, updatedAt: now });
}
db.update(({ projects, tasks, materials, logs }) => {
  projects.unshift({ id: 'p1', name: 'Roof', description: 'South slope beams', status: 'ACTIVE', startDate: now, createdAt: now, updatedAt: now });
  tasks.unshift({ id: 't1', projectId: 'p1', title: 'Order chestnut beams', status: 'PENDING', createdAt: now, updatedAt: now });
  materials.unshift({ id: 'm1', name: 'Lime mortar', quantity: 12, unit: 'bags', createdAt: now, updatedAt: now });
  logs.unshift({ id: 'l1', date: now, author: 'Pierre', text: 'Cleared access path', projectId: 'p1', createdAt: now, updatedAt: now });
});
console.log('Seeded.');
