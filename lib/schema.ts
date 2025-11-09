import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

// USERS
export const users = pgTable('users', {
  id: text('id').primaryKey(),                     // uuid
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('STAFF'),   // SUPER | ADMIN | STAFF | GUARD
  passwordHash: text('password_hash').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// INVITES
export const invites = pgTable('invites', {
  token: text('token').primaryKey(),
  role: text('role').notNull().default('STAFF'),
  email: text('email'),
  createdBy: text('created_by').notNull(),         // users.id
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  usedBy: text('used_by'),
});

// PROJECTS
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('PLANNING'), // PLANNING | ACTIVE | BLOCKED | DONE
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// TASKS
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('PENDING'),  // PENDING | IN_PROGRESS | BLOCKED | DONE
  projectId: text('project_id'),
  assigneeId: text('assignee_id'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// MATERIALS
export const materials = pgTable('materials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sku: text('sku'),
  quantity: integer('quantity').notNull().default(0),
  unit: text('unit').default('pcs'),
  location: text('location'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// LOGS / JOURNAL
export const logs = pgTable('logs', {
  id: text('id').primaryKey(),
  text: text('text').notNull(),
  level: text('level').default('INFO'),
  authorId: text('author_id'),
  projectId: text('project_id'),
  taskId: text('task_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// PUSH SUBSCRIPTIONS (for Web Push)
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});