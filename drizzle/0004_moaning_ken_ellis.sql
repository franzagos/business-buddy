ALTER TABLE "open_topic" ADD COLUMN "session_id" uuid;--> statement-breakpoint
ALTER TABLE "open_topic" ADD COLUMN "competence_rating" integer;--> statement-breakpoint
ALTER TABLE "open_topic" ADD CONSTRAINT "open_topic_session_id_coaching_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."coaching_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "open_topic_session_id_idx" ON "open_topic" USING btree ("session_id");