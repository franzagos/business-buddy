import { desc, eq, and, inArray, isNull, count } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Dumbbell,
  LineChart,
  MessageCircleHeart,
  MessagesSquare,
} from "lucide-react";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { coachingSession, progressEntry } from "@/lib/schema";
import { isCoachId } from "@/lib/coaches";
import { COACH_META } from "@/lib/coaches/meta";
import { DEFAULT_SESSION_TITLE } from "@/lib/copy";
import { TRACK_META } from "@/lib/coaches/track";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SessionScoreBadge } from "@/components/chat/session-score-badge";

export default async function CoachPage({
  params,
}: {
  params: Promise<{ coachId: string }>;
}) {
  const { coachId } = await params;
  if (!isCoachId(coachId)) notFound();

  const session = await requireAuth();
  const meta = COACH_META[coachId];
  const Icon = meta.icon;

  const [trainingCount, coachingCount, legacySessions] = await Promise.all([
    db
      .select({ value: count() })
      .from(coachingSession)
      .where(
        and(
          eq(coachingSession.userId, session.user.id),
          eq(coachingSession.coachId, coachId),
          eq(coachingSession.track, "training")
        )
      ),
    db
      .select({ value: count() })
      .from(coachingSession)
      .where(
        and(
          eq(coachingSession.userId, session.user.id),
          eq(coachingSession.coachId, coachId),
          eq(coachingSession.track, "consulting")
        )
      ),
    db
      .select({
        id: coachingSession.id,
        title: coachingSession.title,
        updatedAt: coachingSession.updatedAt,
      })
      .from(coachingSession)
      .where(
        and(
          eq(coachingSession.userId, session.user.id),
          eq(coachingSession.coachId, coachId),
          isNull(coachingSession.track)
        )
      )
      .orderBy(desc(coachingSession.updatedAt))
      .limit(50),
  ]);

  const legacyIds = legacySessions.map((s) => s.id);
  const legacyEntries =
    legacyIds.length > 0
      ? await db
          .select({
            sessionId: progressEntry.sessionId,
            register: progressEntry.register,
            scores: progressEntry.scores,
          })
          .from(progressEntry)
          .where(inArray(progressEntry.sessionId, legacyIds))
          .limit(50)
      : [];
  const legacyEntryBySession = new Map(
    legacyEntries.filter((e) => e.sessionId).map((e) => [e.sessionId as string, e])
  );

  const tracks = [
    { slug: "training" as const, icon: Dumbbell, count: trainingCount[0]?.value ?? 0 },
    { slug: "coaching" as const, icon: MessageCircleHeart, count: coachingCount[0]?.value ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      <Card className="p-6">
        <CardContent className="flex flex-col gap-4 p-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
              <Icon className="size-6" />
            </span>
            <div className="space-y-1.5">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                {meta.name}
              </h1>
              <p className="text-sm text-muted-foreground">{meta.tagline}</p>
              <p className="max-w-2xl text-sm text-foreground/80">
                {meta.description}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/coaches/${coachId}/progress`}>
                <LineChart className="size-4" />
                Progress
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {tracks.map((t) => {
          const trackMeta = TRACK_META[t.slug];
          const TrackIcon = t.icon;
          return (
            <Link key={t.slug} href={`/coaches/${coachId}/${t.slug}`} className="group">
              <Card className="h-full p-6 transition-shadow ease-[var(--ease-snap)] duration-150 group-hover:shadow-[var(--shadow-1,0_1px_2px_rgba(19,33,90,0.08))]">
                <CardContent className="flex h-full flex-col gap-4 p-0">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
                      <TrackIcon className="size-5" />
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform ease-[var(--ease-snap)] duration-150 group-hover:translate-x-0.5" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
                      {trackMeta.label}
                    </h2>
                    <p className="text-sm text-foreground/80">{trackMeta.description}</p>
                  </div>
                  <p className="mt-auto text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {t.count} {t.count === 1 ? "sessione" : "sessioni"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {legacySessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Altre sessioni
          </h2>
          <div className="space-y-2">
            {legacySessions.map((s) => (
              <Card
                key={s.id}
                className="p-4 transition-shadow ease-[var(--ease-snap)] duration-150 hover:shadow-[var(--shadow-1,0_1px_2px_rgba(19,33,90,0.08))]"
              >
                <CardContent className="flex items-center justify-between gap-4 p-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {s.title || DEFAULT_SESSION_TITLE}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {s.updatedAt.toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <SessionScoreBadge
                      scores={legacyEntryBySession.get(s.id)?.scores ?? null}
                      register={legacyEntryBySession.get(s.id)?.register ?? null}
                    />
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/coaches/${coachId}/sessions/${s.id}`}>
                        <MessagesSquare className="size-4" />
                        Continua
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
