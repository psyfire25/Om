// lib/schema.ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------- Users ----------
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // 'SUPER' | 'ADMIN' | 'STAFF' | 'GUARD'
  passwordHash: text("password_hash").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
});

// ---------- Invites ----------
export const invites = pgTable("invites", {
  token: text("token").primaryKey(),
  role: text("role").notNull(), // role to assign on acceptance
  email: text("email"), // optional pre-filled email
  createdBy: text("created_by").notNull(), // user id who created it
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: false }),
  usedAt: timestamp("used_at", { withTimezone: false }),
  usedBy: text("used_by"), // user id who used it
});

// ---------- Projects ----------
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("PLANNING"), // 'PLANNING' | 'ACTIVE' | 'BLOCKED' | 'DONE'
  startDate: timestamp("start_date", { withTimezone: false }),
  endDate: timestamp("end_date", { withTimezone: false }),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
});

// ---------- Tasks ----------
export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("PENDING"), // 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE'
  projectId: text("project_id"), // FK to projects.id (soft)
  assigneeId: text("assignee_id"), // FK to users.id (soft)
  startDate: timestamp("start_date", { withTimezone: false }),
  endDate: timestamp("end_date", { withTimezone: false }),
  dueDate: timestamp("due_date", { withTimezone: false }),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
});

// ---------- Materials ----------
export const materials = pgTable("materials", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku"),
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").default("pcs"), // e.g. pcs, kg, m
  location: text("location"), // storage location / room
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
});

// ---------- Logs (journal / activity) ----------
export const logs = pgTable("logs", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  authorId: text("author_id"), // FK to users.id (soft)
  projectId: text("project_id"), // FK to projects.id (soft)
  taskId: text("task_id"), // FK to tasks.id (soft)
  level: text("level").default("INFO"), // INFO | NOTE | WARNING | ERROR
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
});
