// lib/schema.ts
import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
  date,
} from 'drizzle-orm/pg-core';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

// ---------- Users ----------
export const users = pgTable('users', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 16 }).notNull().default('STAFF'), // 'STAFF' | 'ADMIN' | 'SUPER'
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// ---------- Invites ----------
export const invites = pgTable('invites', {
  token: text('token').primaryKey(), // uuid string stored as text
  role: varchar('role', { length: 16 }).notNull().default('STAFF'),
  email: varchar('email', { length: 320 }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  usedAt: timestamp('used_at', { mode: 'date' }),
  usedBy: uuid('used_by').references(() => users.id, { onDelete: 'set null' }),
});

export type Invite = InferSelectModel<typeof invites>;
export type NewInvite = InferInsertModel<typeof invites>;

// ---------- Projects ----------
export const projects = pgTable('projects', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 16 }).notNull().default('PLANNING'), // PLANNING | ACTIVE | ON_HOLD | DONE
  startDate: date('start_date', { mode: 'date' }),
  endDate: date('end_date', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;

// ---------- Tasks ----------
export const tasks = pgTable('tasks', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startDate: date('start_date', { mode: 'date' }), // <— keep
  endDate: date('end_date', { mode: 'date' }),     // <— keep
  status: varchar('status', { length: 24 }).notNull().default('PENDING'), // PENDING | IN_PROGRESS | BLOCKED | DONE
  priority: varchar('priority', { length: 16 }).notNull().default('MEDIUM'), // 🔸 KEPT
  assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  dueDate: date('due_date', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;

// ---------- Materials ----------
export const materials = pgTable('materials', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 64 }),     // <— keep
  quantity: integer('quantity').notNull().default(0),
  unit: varchar('unit', { length: 32 }),
  location: varchar('location', { length: 255 }),
  notes: text('notes'),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export type Material = InferSelectModel<typeof materials>;
export type NewMaterial = InferInsertModel<typeof materials>;

// ---------- Logs ----------
export const logs = pgTable('logs', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  text: text('text').notNull(),
  author: varchar('author', { length: 120 }), // free-form author label
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  weather: varchar('weather', { length: 64 }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

export type Log = InferSelectModel<typeof logs>;
export type NewLog = InferInsertModel<typeof logs>;

// ---------- Events (calendar) ----------
export const events = pgTable('events', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  start: timestamp('start', { mode: 'date' }).notNull(),
  end: timestamp('end', { mode: 'date' }).notNull(),
  allDay: boolean('all_day').notNull().default(false),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export type Event = InferSelectModel<typeof events>;
export type NewEvent = InferInsertModel<typeof events>;

// ---------- Push Subscriptions (web push) ----------
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: text('id').primaryKey(), // can be nanoid() from client
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

export type PushSubscription = InferSelectModel<typeof pushSubscriptions>;
export type NewPushSubscription = InferInsertModel<typeof pushSubscriptions>;