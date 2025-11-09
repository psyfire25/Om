ALTER TABLE "materials" ADD COLUMN "sku" varchar(64);--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "start_date" date;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "end_date" date;