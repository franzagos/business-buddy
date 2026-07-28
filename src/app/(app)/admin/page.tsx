import { count, countDistinct, desc, eq, gte, max } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ShieldCheck, Users, MessagesSquare, Activity } from "lucide-react";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { user, coachingSession, coachingMessage } from "@/lib/schema";
import { COACH_META } from "@/lib/coaches/meta";
import { TRACK_DB_TO_SLUG, TRACK_META, type SessionTrack } from "@/lib/coaches/track";
import { DEFAULT_SESSION_TITLE } from "@/lib/copy";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatDate(d: Date): string {
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <CardContent className="space-y-1 p-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <Card className="p-6">
      <CardContent className="flex flex-col items-center gap-2 p-0 py-8 text-center">
        <p className="text-sm font-medium text-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}

export default async function AdminPage() {
  const session = await requireAuth();
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail || session.user.email !== ownerEmail) {
    notFound();
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsersRow,
    newUsers7dRow,
    newUsers30dRow,
    recentUsers,
    totalSessionsRow,
    totalMessagesRow,
    usagePerUser,
    recentSessions,
  ] = await Promise.all([
    db.select({ value: count() }).from(user),
    db
      .select({ value: count() })
      .from(user)
      .where(gte(user.createdAt, sevenDaysAgo)),
    db
      .select({ value: count() })
      .from(user)
      .where(gte(user.createdAt, thirtyDaysAgo)),
    db
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(50),
    db.select({ value: count() }).from(coachingSession),
    db.select({ value: count() }).from(coachingMessage),
    // Per-user aggregate: sessions count, messages count, last active date.
    // Single grouped query — no per-user loop.
    db
      .select({
        userId: coachingSession.userId,
        email: user.email,
        name: user.name,
        sessionCount: countDistinct(coachingSession.id),
        messageCount: count(coachingMessage.id),
        lastActive: max(coachingSession.updatedAt),
      })
      .from(coachingSession)
      .innerJoin(user, eq(user.id, coachingSession.userId))
      .leftJoin(coachingMessage, eq(coachingMessage.sessionId, coachingSession.id))
      .groupBy(coachingSession.userId, user.email, user.name)
      .orderBy(desc(max(coachingSession.updatedAt)))
      .limit(50),
    db
      .select({
        id: coachingSession.id,
        coachId: coachingSession.coachId,
        title: coachingSession.title,
        track: coachingSession.track,
        updatedAt: coachingSession.updatedAt,
        email: user.email,
      })
      .from(coachingSession)
      .innerJoin(user, eq(user.id, coachingSession.userId))
      .orderBy(desc(coachingSession.updatedAt))
      .limit(30),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Panoramica interna: registrazioni, utilizzo, attività recente.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Users className="size-4" />
          Chi si registra
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Utenti totali" value={String(totalUsersRow[0]?.value ?? 0)} />
          <StatTile
            label="Nuovi (7 giorni)"
            value={String(newUsers7dRow[0]?.value ?? 0)}
          />
          <StatTile
            label="Nuovi (30 giorni)"
            value={String(newUsers30dRow[0]?.value ?? 0)}
          />
        </div>
        {recentUsers.length === 0 ? (
          <EmptyState title="Nessun utente registrato" />
        ) : (
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <Card key={u.id} className="p-4">
                <CardContent className="flex items-center justify-between gap-4 p-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {u.name || u.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-xs text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Activity className="size-4" />
          Quanto usa il tool
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatTile label="Sessioni totali" value={String(totalSessionsRow[0]?.value ?? 0)} />
          <StatTile label="Messaggi totali" value={String(totalMessagesRow[0]?.value ?? 0)} />
        </div>
        {usagePerUser.length === 0 ? (
          <EmptyState title="Nessun utilizzo registrato ancora" />
        ) : (
          <div className="space-y-2">
            {usagePerUser.map((row) => (
              <Card key={row.userId} className="p-4">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {row.name || row.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 font-mono text-xs text-muted-foreground">
                    <span>{row.sessionCount} sessioni</span>
                    <span>{row.messageCount} messaggi</span>
                    {row.lastActive && <span>ultima: {formatDate(row.lastActive)}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <MessagesSquare className="size-4" />
          Cosa chiede
        </h2>
        {recentSessions.length === 0 ? (
          <EmptyState title="Nessuna sessione ancora" />
        ) : (
          <div className="space-y-2">
            {recentSessions.map((s) => {
              const coachMeta = COACH_META[s.coachId as keyof typeof COACH_META];
              const trackSlug = s.track
                ? TRACK_DB_TO_SLUG[s.track as SessionTrack]
                : null;
              return (
                <Card key={s.id} className="p-4">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {s.title || DEFAULT_SESSION_TITLE}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.email} · {coachMeta?.name ?? s.coachId}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {trackSlug && (
                        <Badge variant="outline">{TRACK_META[trackSlug].label}</Badge>
                      )}
                      <p className="font-mono text-xs text-muted-foreground">
                        {formatDate(s.updatedAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
