import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AlertTriangle, ListChecks, TrendingUp } from "lucide-react";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { progressEntry, openTopic, blindSpotPattern } from "@/lib/schema";
import { isCoachId, getCoach } from "@/lib/coaches";
import { COACH_META } from "@/lib/coaches/meta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OpenTopicToggle } from "@/components/progress/open-topic-toggle";

interface Score {
  dimension: string;
  score: number;
  note?: string | null;
}

export default async function ProgressPage({
  params,
}: {
  params: Promise<{ coachId: string }>;
}) {
  const { coachId } = await params;
  if (!isCoachId(coachId)) notFound();

  const session = await requireAuth();
  const meta = COACH_META[coachId];
  const coach = getCoach(coachId);
  const rubricLabels = Object.fromEntries(
    coach.rubric.map((r) => [r.id, r.label])
  );

  const [entries, topics, blindSpots] = await Promise.all([
    db
      .select({
        id: progressEntry.id,
        decision: progressEntry.decision,
        lesson: progressEntry.lesson,
        register: progressEntry.register,
        scores: progressEntry.scores,
        createdAt: progressEntry.createdAt,
      })
      .from(progressEntry)
      .where(
        and(
          eq(progressEntry.userId, session.user.id),
          eq(progressEntry.coachId, coachId)
        )
      )
      .orderBy(desc(progressEntry.createdAt))
      .limit(50),
    db
      .select({
        id: openTopic.id,
        topic: openTopic.topic,
        reason: openTopic.reason,
        status: openTopic.status,
        createdAt: openTopic.createdAt,
      })
      .from(openTopic)
      .where(
        and(
          eq(openTopic.userId, session.user.id),
          eq(openTopic.coachId, coachId)
        )
      )
      .orderBy(desc(openTopic.createdAt))
      .limit(50),
    db
      .select({
        id: blindSpotPattern.id,
        pattern: blindSpotPattern.pattern,
        occurrenceCount: blindSpotPattern.occurrenceCount,
        lastSeenAt: blindSpotPattern.lastSeenAt,
      })
      .from(blindSpotPattern)
      .where(
        and(
          eq(blindSpotPattern.userId, session.user.id),
          eq(blindSpotPattern.coachId, coachId)
        )
      )
      .orderBy(desc(blindSpotPattern.occurrenceCount))
      .limit(50),
  ]);

  // Oldest-first so we can compute deltas against the previous entry.
  const chronological = [...entries].reverse();
  const scoresByEntryId = new Map<string, Score[]>();
  chronological.forEach((entry, idx) => {
    const scores = (entry.scores as Score[] | null) ?? [];
    scoresByEntryId.set(entry.id, scores);
    void idx;
  });

  function deltasFor(entryId: string): Map<string, number> {
    const idx = chronological.findIndex((e) => e.id === entryId);
    const deltas = new Map<string, number>();
    if (idx <= 0) return deltas;
    const current = scoresByEntryId.get(entryId) ?? [];
    const previous = scoresByEntryId.get(chronological[idx - 1].id) ?? [];
    for (const s of current) {
      const prev = previous.find((p) => p.dimension === s.dimension);
      if (prev) deltas.set(s.dimension, s.score - prev.score);
    }
    return deltas;
  }

  const openTopicsFirst = [...topics].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === "open" ? -1 : 1;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="space-y-1.5">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {meta.name}
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Progress
        </h1>
        <p className="text-sm text-muted-foreground">
          Storico delle sessioni chiuse, temi ancora aperti e pattern
          ricorrenti individuati con {meta.name.toLowerCase()}.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Sessioni valutate
        </h2>
        {entries.length === 0 ? (
          <EmptyState
            icon={<TrendingUp className="size-5" />}
            title="Nessuna sessione valutata ancora"
            description='Chiudi una sessione con "Termina sessione e salva progressi" per vedere qui la prima valutazione.'
          />
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const scores = scoresByEntryId.get(entry.id) ?? [];
              const deltas = deltasFor(entry.id);
              return (
                <Card key={entry.id} className="p-6">
                  <CardContent className="space-y-3 p-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-xs text-muted-foreground">
                        {entry.createdAt.toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      {entry.register && (
                        <Badge variant="outline">{entry.register}</Badge>
                      )}
                    </div>

                    {entry.decision && (
                      <p className="text-sm font-medium text-foreground">
                        {entry.decision}
                      </p>
                    )}
                    {entry.lesson && (
                      <p className="text-sm text-muted-foreground">
                        {entry.lesson}
                      </p>
                    )}

                    {scores.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {scores.map((s) => {
                          const delta = deltas.get(s.dimension);
                          const label = rubricLabels[s.dimension] ?? s.dimension;
                          return (
                            <Badge
                              key={s.dimension}
                              variant="secondary"
                              className="font-mono"
                            >
                              {label}: {s.score}/10
                              {typeof delta === "number" && delta !== 0 && (
                                <span
                                  className={
                                    delta > 0
                                      ? "text-accent"
                                      : "text-destructive"
                                  }
                                >
                                  {" "}
                                  ({delta > 0 ? "+" : ""}
                                  {delta})
                                </span>
                              )}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Temi aperti
        </h2>
        {topics.length === 0 ? (
          <EmptyState
            icon={<ListChecks className="size-5" />}
            title="Nessun tema aperto"
            description="I temi che il coach segnala come da approfondire in futuro compariranno qui."
          />
        ) : (
          <div className="space-y-2">
            {openTopicsFirst.map((t) => (
              <Card key={t.id} className="p-4">
                <CardContent className="flex items-center justify-between gap-4 p-0">
                  <div className="min-w-0 space-y-0.5">
                    <p
                      className={
                        t.status === "closed"
                          ? "truncate text-sm text-muted-foreground line-through"
                          : "truncate text-sm font-medium text-foreground"
                      }
                    >
                      {t.topic}
                    </p>
                    {t.reason && (
                      <p className="truncate text-xs text-muted-foreground">
                        {t.reason}
                      </p>
                    )}
                  </div>
                  <OpenTopicToggle id={t.id} status={t.status as "open" | "closed"} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Pattern ricorrenti
        </h2>
        {blindSpots.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle className="size-5" />}
            title="Nessun pattern individuato"
            description="Quando lo stesso punto cieco si ripresenta in più sessioni, verrà segnalato qui con il conteggio delle occorrenze."
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {blindSpots.map((b) => {
              const flagged = b.occurrenceCount >= 3;
              return (
                <Badge
                  key={b.id}
                  variant={flagged ? "destructive" : "outline"}
                  className="gap-1.5"
                >
                  {flagged && <AlertTriangle className="size-3" />}
                  {b.pattern}
                  <span className="font-mono">×{b.occurrenceCount}</span>
                </Badge>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-6">
      <CardContent className="flex flex-col items-center gap-3 p-0 py-8 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          {icon}
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
