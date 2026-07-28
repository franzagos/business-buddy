import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, BookOpen, ListChecks, TrendingUp } from "lucide-react";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { progressEntry, openTopic, blindSpotPattern } from "@/lib/schema";
import { isCoachId, getCoach } from "@/lib/coaches";
import { COACH_META } from "@/lib/coaches/meta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OpenTopicCard } from "@/components/progress/open-topic-card";
import { ProgressPageCoachmark } from "@/components/progress/progress-page-coachmark";
import { RubricIcon } from "@/components/ui/rubric-icon";
import {
  PersonalAnalytics,
  type TrendPoint,
  type DimensionStat,
} from "@/components/progress/personal-analytics";

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
  const rubricIcons = Object.fromEntries(
    coach.rubric.map((r) => [r.id, r.icon])
  );

  const [entries, topics, blindSpots] = await Promise.all([
    db
      .select({
        id: progressEntry.id,
        sessionId: progressEntry.sessionId,
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
        howToTest: openTopic.howToTest,
        sessionId: openTopic.sessionId,
        competenceRating: openTopic.competenceRating,
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

  // ---- Personal analytics: aggregate the same data the lists below show. ----
  const trend: TrendPoint[] = chronological
    .map((entry) => {
      const scores = scoresByEntryId.get(entry.id) ?? [];
      if (scores.length === 0) return null;
      const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
      return { entryId: entry.id, date: entry.createdAt.toISOString(), avgScore: avg };
    })
    .filter((p): p is TrendPoint => p !== null);

  const overallAverage =
    trend.length > 0
      ? trend.reduce((sum, p) => sum + p.avgScore, 0) / trend.length
      : null;

  const scoresByDimension = new Map<string, number[]>();
  for (const entry of chronological) {
    for (const s of scoresByEntryId.get(entry.id) ?? []) {
      const list = scoresByDimension.get(s.dimension) ?? [];
      list.push(s.score);
      scoresByDimension.set(s.dimension, list);
    }
  }
  const dimensionStats: DimensionStat[] = coach.rubric
    .map((r) => {
      const scores = scoresByDimension.get(r.id) ?? [];
      if (scores.length === 0) return null;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const trendDelta = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : null;
      return { id: r.id, label: r.label, icon: r.icon, avg, count: scores.length, trend: trendDelta };
    })
    .filter((d): d is DimensionStat => d !== null);

  const activeBlindSpotsCount = blindSpots.filter((b) => b.occurrenceCount >= 3).length;
  const openTopicsCount = topics.filter((t) => t.status === "open").length;

  // Entries with a lesson, most recent first (already the query's order),
  // each keeping its sessionId so the user can jump back to that specific case.
  const lessons = entries.filter((e) => e.lesson);

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

      <ProgressPageCoachmark />

      {entries.length > 0 && (
        <PersonalAnalytics
          sessionsEvaluated={entries.length}
          overallAverage={overallAverage}
          openTopicsCount={openTopicsCount}
          activeBlindSpotsCount={activeBlindSpotsCount}
          trend={trend}
          dimensions={dimensionStats}
        />
      )}

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
                              className="gap-1.5 font-mono"
                            >
                              <RubricIcon
                                icon={rubricIcons[s.dimension]}
                                className="size-3"
                              />
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
              <OpenTopicCard
                key={t.id}
                id={t.id}
                coachId={coachId}
                topic={t.topic}
                reason={t.reason}
                howToTest={t.howToTest}
                sessionId={t.sessionId}
                status={t.status as "open" | "closed"}
                competenceRating={t.competenceRating}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Lezioni apprese
        </h2>
        {lessons.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="size-5" />}
            title="Nessuna lezione ancora"
            description="Le lezioni chiave emerse a fine sessione compariranno qui, con un riferimento al caso specifico."
          />
        ) : (
          <div className="space-y-2">
            {lessons.map((entry) => (
              <Card key={entry.id} className="p-4">
                <CardContent className="space-y-2 p-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-xs text-muted-foreground">
                      {entry.createdAt.toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {entry.sessionId && (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/coaches/${coachId}/sessions/${entry.sessionId}`}>
                          Apri il caso
                        </Link>
                      </Button>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {entry.lesson}
                  </p>
                  {entry.decision && (
                    <p className="text-xs text-muted-foreground">
                      Caso: {entry.decision}
                    </p>
                  )}
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
