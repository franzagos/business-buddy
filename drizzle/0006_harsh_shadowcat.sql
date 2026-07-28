CREATE TABLE "hidden_board_expert" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" text NOT NULL,
	"expert_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "hidden_board_expert_coach_expert_idx" ON "hidden_board_expert" USING btree ("coach_id","expert_id");