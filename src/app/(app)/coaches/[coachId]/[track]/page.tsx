import { desc, eq, and, inArray } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Dumbbell, MessageCircleHeart, MessageSquarePlus, MessagesSquare } from "lucide-react";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { coachingSession, progressEntry } from "@/lib/schema";
import { isCoachId } from "@/lib/coaches";
import { COACH_META } from "@/lib/coaches/meta";
import { TRACK_META, TRACK_SLUG_TO_DB, isTrackSlug } from "@/lib/coaches/track";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewSessionButton } from "@/components/chat/new-session-button";
import { SessionScoreBadge } from "@/components/chat/session-score-badge";
import { DEFAULT_SESSION_TITLE } from "@/lib/copy";

const TRACK_ICONS = {
  training: Dumbbell,
  coaching: MessageCircleHeart,
} as const;

export default async function CoachTrackPage({
  params,
}: {
  params: Promise<{ coachId: string; track: string }>;
}) {
  const { coachId, track } = await params;
  if (!isCoachId(coachId)) notFound();
  if (!isTrackSlug(track)) notFound();

  const session = await requireAuth();
  const meta = COACH_META[coachId];
  const trackMeta = TRACK_META[track];
  const dbTrack = TRACK_SLUG_TO_DB[track];
  const TrackIcon = TRACK_ICONS[track];
  const ctaLabel = track === "training" ? "Nuovo allenamento" : "Nuovo confronto";

  const sessions = await db
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
        eq(coachingSession.track, dbTrack)
      )
    )
    .orderBy(desc(coachingSession.updatedAt))
    .limit(50);

  const sessionIds = sessions.map((s) => s.id);
  const entries =
    sessionIds.length > 0
      ? await db
          .select({
            sessionId: progressEntry.sessionId,
            register: progressEntry.register,
            scores: progressEntry.scores,
          })
          .from(progressEntry)
          .where(inArray(progressEntry.sessionId, sessionIds))
          .limit(50)
      : [];
  const entryBySession = new Map(
    entries.filter((e) => e.sessionId).map((e) => [e.sessionId as string, e])
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      <Card className="p-6">
        <CardContent className="flex flex-col gap-4 p-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
              <TrackIcon className="size-6" />
            </span>
            <div className="space-y-1.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {meta.name}
              </p>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                {trackMeta.label}
              </h1>
              <p className="max-w-2xl text-sm text-foreground/80">
                {trackMeta.description}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <NewSessionButton coachId={coachId} track={dbTrack} label={ctaLabel} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Le tue sessioni
        </h2>

        {sessions.length === 0 ? (
          <Card className="p-6">
            <CardContent className="flex flex-col items-center gap-3 p-0 py-8 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <MessagesSquare className="size-5" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Nessuna sessione ancora
                </p>
                <p className="text-sm text-muted-foreground">
                  {track === "training"
                    ? `Inizia il tuo primo allenamento con ${meta.name.toLowerCase()}.`
                    : `Porta il tuo primo caso reale a ${meta.name.toLowerCase()}.`}
                </p>
              </div>
              <NewSessionButton coachId={coachId} track={dbTrack} label={ctaLabel} variant="accent" />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
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
                      scores={entryBySession.get(s.id)?.scores ?? null}
                      register={entryBySession.get(s.id)?.register ?? null}
                    />
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/coaches/${coachId}/sessions/${s.id}`}>
                        <MessageSquarePlus className="size-4" />
                        Continua
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
