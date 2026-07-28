import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
  uuid,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";

// =============================================================================
// AUTHENTICATION TABLES (managed by Better Auth)
// =============================================================================
// These tables are required by Better Auth. Don't rename the columns
// or remove fields — Better Auth depends on this exact structure.
// You CAN add new columns to the user table for your app's needs.
// =============================================================================

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("user_email_idx").on(table.email)]
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
    index("session_token_idx").on(table.token),
  ]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    index("account_provider_account_idx").on(table.providerId, table.accountId),
  ]
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// =============================================================================
// YOUR APP TABLES
// =============================================================================
// Add your own tables below. Use UUIDs for primary keys:
//
// import { uuid } from "drizzle-orm/pg-core";
//
// export const myTable = pgTable("my_table", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
//   ...
// });
// =============================================================================

// =============================================================================
// COACHING PLATFORM TABLES
// =============================================================================
// See specs/coaching-platform/decisions.md for the full schema rationale.
// =============================================================================

export const coachingSession = pgTable(
  "coaching_session",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    coachId: text("coach_id").notNull(),
    title: text("title"),
    track: text("track"),
    register: text("register"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("coaching_session_user_id_idx").on(table.userId),
    index("coaching_session_coach_id_idx").on(table.coachId),
    index("coaching_session_user_coach_updated_idx").on(
      table.userId,
      table.coachId,
      table.updatedAt
    ),
  ]
);

export const coachingMessage = pgTable(
  "coaching_message",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => coachingSession.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("coaching_message_session_id_idx").on(table.sessionId),
    index("coaching_message_session_created_idx").on(
      table.sessionId,
      table.createdAt
    ),
  ]
);

export const progressEntry = pgTable(
  "progress_entry",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    coachId: text("coach_id").notNull(),
    sessionId: uuid("session_id").references(() => coachingSession.id, {
      onDelete: "set null",
    }),
    register: text("register"),
    decision: text("decision"),
    blindSpots: jsonb("blind_spots"),
    scores: jsonb("scores"),
    lesson: text("lesson"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("progress_entry_user_id_idx").on(table.userId),
    index("progress_entry_coach_id_idx").on(table.coachId),
  ]
);

export const openTopic = pgTable(
  "open_topic",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    coachId: text("coach_id").notNull(),
    // The session this topic was extracted from — lets the UI link back to
    // the conversation it came from. Nullable: topics created before this
    // column existed have no session to link to.
    sessionId: uuid("session_id").references(() => coachingSession.id, {
      onDelete: "set null",
    }),
    topic: text("topic").notNull(),
    reason: text("reason"),
    howToTest: text("how_to_test"),
    // User's own self-assessed competence on this topic, 1-10. Distinct from
    // the coach's rubric scores — this is a self-rating, not AI-generated.
    competenceRating: integer("competence_rating"),
    status: text("status").default("open").notNull(),
    closedAt: timestamp("closed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("open_topic_user_id_idx").on(table.userId),
    index("open_topic_coach_id_idx").on(table.coachId),
    index("open_topic_session_id_idx").on(table.sessionId),
  ]
);

export const blindSpotPattern = pgTable(
  "blind_spot_pattern",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    coachId: text("coach_id").notNull(),
    pattern: text("pattern").notNull(),
    occurrenceCount: integer("occurrence_count").default(1).notNull(),
    lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("blind_spot_pattern_user_id_idx").on(table.userId),
    index("blind_spot_pattern_coach_id_idx").on(table.coachId),
    uniqueIndex("blind_spot_pattern_user_coach_pattern_idx").on(
      table.userId,
      table.coachId,
      table.pattern
    ),
  ]
);

export const realCase = pgTable(
  "real_case",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    coachId: text("coach_id").notNull(),
    problem: text("problem").notNull(),
    advisorsConsulted: jsonb("advisors_consulted"),
    advice: text("advice"),
    actionsDecided: text("actions_decided"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("real_case_user_id_idx").on(table.userId),
    index("real_case_coach_id_idx").on(table.coachId),
  ]
);

export const advisorProfile = pgTable(
  "advisor_profile",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    whatTheyThink: text("what_they_think"),
    howTheyDecide: text("how_they_decide"),
    isShared: boolean("is_shared").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("advisor_profile_owner_user_id_idx").on(table.ownerUserId)]
);

// Admin-curated Advisory Board experts, same shape as the static roster in
// src/lib/coaches/*/advisory-board.ts (Munger, Bezos, etc.) but editable at
// runtime from /admin/experts instead of shipped in code. `coachId = null`
// means the expert is available in every coach's Advisory Board.
export const boardExpert = pgTable(
  "board_expert",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    coachId: text("coach_id"),
    name: text("name").notNull(),
    lens: text("lens").notNull(),
    style: text("style").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("board_expert_coach_id_idx").on(table.coachId)]
);

// Hides a static Advisory Board expert (defined in code under
// src/lib/coaches/*/advisory-board.ts) from a given coach. Static experts have
// no DB row of their own — this table marks their (coachId, expertId) pair as
// hidden instead of deleting code. Restoring = deleting the row.
export const hiddenBoardExpert = pgTable(
  "hidden_board_expert",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    coachId: text("coach_id").notNull(),
    expertId: text("expert_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("hidden_board_expert_coach_expert_idx").on(
      table.coachId,
      table.expertId
    ),
  ]
);

// A user can describe multiple businesses (e.g. their agency AND a side
// startup). Each business is independently taggable to a coach and can
// carry its own knowledge base documents.
export const business = pgTable(
  "business",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // "executive" | "agency" | "startup" | "general" | null (not tagged).
    // When it matches the active coach, that coach uses this business (the
    // most recently updated one, if there's more than one match) as the
    // default worked example in exercises, unless the user says otherwise.
    businessType: text("business_type"),
    context: text("context"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("business_owner_user_id_idx").on(table.ownerUserId),
    index("business_type_idx").on(table.businessType),
  ]
);

// A knowledge-base file attached to a business. `content` holds extracted
// text (currently .txt/.md only) used as prompt context; other file types
// are stored but not injected into prompts yet.
export const businessDocument = pgTable(
  "business_document",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    mimeType: text("mime_type"),
    sizeBytes: integer("size_bytes").notNull(),
    content: text("content"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("business_document_business_id_idx").on(table.businessId)]
);
// =============================================================================
