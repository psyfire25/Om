import { pgTable, unique, text, boolean, timestamp, integer, uuid, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	role: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const invites = pgTable("invites", {
	token: text().primaryKey().notNull(),
	role: text().notNull(),
	email: text(),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	usedAt: timestamp("used_at", { mode: 'string' }),
	usedBy: text("used_by"),
});

export const logs = pgTable("logs", {
	id: text().primaryKey().notNull(),
	text: text().notNull(),
	authorId: text("author_id"),
	projectId: text("project_id"),
	taskId: text("task_id"),
	level: text().default('INFO'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const projects = pgTable("projects", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	status: text().default('PLANNING').notNull(),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const tasks = pgTable("tasks", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	status: text().default('PENDING').notNull(),
	projectId: text("project_id"),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	dueDate: timestamp("due_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	assigneeId: text("assignee_id"),
	priority: integer().default(0),
});

export const events = pgTable("events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	start: timestamp({ mode: 'string' }).notNull(),
	end: timestamp({ mode: 'string' }).notNull(),
	allDay: boolean("all_day").default(false).notNull(),
	ownerId: uuid("owner_id"),
	projectId: uuid("project_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
	id: text().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	endpoint: text().notNull(),
	p256Dh: text().notNull(),
	auth: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("push_subscriptions_endpoint_unique").on(table.endpoint),
]);

export const materials = pgTable("materials", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	sku: text(),
	quantity: integer().default(0).notNull(),
	unit: text().default('pcs'),
	location: text(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	projectId: uuid("project_id"),
});
