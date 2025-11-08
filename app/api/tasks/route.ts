// 👇 prevent build-time prerender/export for this route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db, create } from "@/lib/db";
import { json, bad } from "../_util";
export async function GET() {
  return json(
    db.data.tasks.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  );
}
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.title) return bad("Missing title");
  const task = await create("tasks", {
    title: body.title,
    description: body.description || "",
    assignee: body.assignee || undefined,
    status: body.status || "PENDING",
    projectId: body.projectId || undefined,
    dueDate: body.dueDate || undefined,
  });
  return json(task, 201);
}
