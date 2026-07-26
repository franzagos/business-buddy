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
    topic: text("topic").notNull(),
    reason: text("reason"),
    howToTest: text("how_to_test"),
    status: text("status").default("open").notNull(),
    closedAt: timestamp("closed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("open_topic_user_id_idx").on(table.userId),
    index("open_topic_coach_id_idx").on(table.coachId),
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
// =============================================================================
