CREATE TABLE "advisor_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" text NOT NULL,
	"name" text NOT NULL,
	"what_they_think" text,
	"how_they_decide" text,
	"is_shared" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blind_spot_pattern" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"coach_id" text NOT NULL,
	"pattern" text NOT NULL,
	"occurrence_count" integer DEFAULT 1 NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaching_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaching_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"coach_id" text NOT NULL,
	"title" text,
	"track" text,
	"register" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "open_topic" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"coach_id" text NOT NULL,
	"topic" text NOT NULL,
	"reason" text,
	"how_to_test" text,
	"status" text DEFAULT 'open' NOT NULL,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"coach_id" text NOT NULL,
	"session_id" uuid,
	"register" text,
	"decision" text,
	"blind_spots" jsonb,
	"scores" jsonb,
	"lesson" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "real_case" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"coach_id" text NOT NULL,
	"problem" text NOT NULL,
	"advisors_consulted" jsonb,
	"advice" text,
	"actions_decided" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "advisor_profile" ADD CONSTRAINT "advisor_profile_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blind_spot_pattern" ADD CONSTRAINT "blind_spot_pattern_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_message" ADD CONSTRAINT "coaching_message_session_id_coaching_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."coaching_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_session" ADD CONSTRAINT "coaching_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "open_topic" ADD CONSTRAINT "open_topic_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_entry" ADD CONSTRAINT "progress_entry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_entry" ADD CONSTRAINT "progress_entry_session_id_coaching_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."coaching_session"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "real_case" ADD CONSTRAINT "real_case_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "advisor_profile_owner_user_id_idx" ON "advisor_profile" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "blind_spot_pattern_user_id_idx" ON "blind_spot_pattern" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "blind_spot_pattern_coach_id_idx" ON "blind_spot_pattern" USING btree ("coach_id");--> statement-breakpoint
CREATE UNIQUE INDEX "blind_spot_pattern_user_coach_pattern_idx" ON "blind_spot_pattern" USING btree ("user_id","coach_id","pattern");--> statement-breakpoint
CREATE INDEX "coaching_message_session_id_idx" ON "coaching_message" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "coaching_message_session_created_idx" ON "coaching_message" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "coaching_session_user_id_idx" ON "coaching_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "coaching_session_coach_id_idx" ON "coaching_session" USING btree ("coach_id");--> statement-breakpoint
CREATE INDEX "coaching_session_user_coach_updated_idx" ON "coaching_session" USING btree ("user_id","coach_id","updated_at");--> statement-breakpoint
CREATE INDEX "open_topic_user_id_idx" ON "open_topic" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "open_topic_coach_id_idx" ON "open_topic" USING btree ("coach_id");--> statement-breakpoint
CREATE INDEX "progress_entry_user_id_idx" ON "progress_entry" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "progress_entry_coach_id_idx" ON "progress_entry" USING btree ("coach_id");--> statement-breakpoint
CREATE INDEX "real_case_user_id_idx" ON "real_case" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "real_case_coach_id_idx" ON "real_case" USING btree ("coach_id");