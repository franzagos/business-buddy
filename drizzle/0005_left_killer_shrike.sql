CREATE TABLE "board_expert" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" text,
	"name" text NOT NULL,
	"lens" text NOT NULL,
	"style" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "board_expert_coach_id_idx" ON "board_expert" USING btree ("coach_id");