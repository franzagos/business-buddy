import { and, desc, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { ArrowRight, Compass, MessagesSquare, Sparkles } from "lucide-react";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { coachingSession, openTopic, progressEntry } from "@/lib/schema";
import { COACH_META_LIST } from "@/lib/coaches/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NewSessionButton } from "@/components/chat/new-session-button";
import { ResumeTopicButton } from "@/components/chat/resume-topic-button";
import { SessionScoreBadge } from "@/components/chat/session-score-badge";
import type { CoachId } from "@/lib/coaches";
import { DEFAULT_SESSION_TITLE } from "@/lib/copy";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";

export default async function AppHomePage() {
  const session = await requireAuth();

  const sessions = await db
    .select({
      id: coachingSession.id,
      coachId: coachingSession.coachId,
      title: coachingSession.title,
      updatedAt: coachingSession.updatedAt,
    })
    .from(coachingSession)
    .where(eq(coachingSession.userId, session.user.id))
    .orderBy(desc(coachingSession.updatedAt))
    .limit(50);

  const latestByCoach = new Map<string, (typeof sessions)[number]>();
  for (const s of sessions) {
    if (!latestByCoach.has(s.coachId)) latestByCoach.set(s.coachId, s);
  }

  const hasAnySession = sessions.length > 0;

  const recentSessionIds = sessions.slice(0, 8).map((s) => s.id);
  const recentEntries =
    recentSessionIds.length > 0
      ? await db
          .select({
            sessionId: progressEntry.sessionId,
            register: progressEntry.register,
            scores: progressEntry.scores,
          })
          .from(progressEntry)
          .where(inArray(progressEntry.sessionId, recentSessionIds))
          .limit(50)
      : [];
  const entryBySession = new Map(
    recentEntries.filter((e) => e.sessionId).map((e) => [e.sessionId as string, e])
  );
  const firstName = session.user.name?.split(" ")[0] || "";

  const openTopics = await db
    .select({
      id: openTopic.id,
      coachId: openTopic.coachId,
      topic: openTopic.topic,
    })
    .from(openTopic)
    .where(and(eq(openTopic.userId, session.user.id), eq(openTopic.status, "open")))
    .orderBy(desc(openTopic.createdAt))
    .limit(5);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <OnboardingModal />
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {firstName ? `Bentornato, ${firstName}` : "Bentornato"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasAnySession
            ? "Riprendi una sessione o parla con un altro coach."
            : "Scegli un coach per iniziare la tua prima sessione."}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {COACH_META_LIST.map((coach) => {
          const Icon = coach.icon;
          const latest = latestByCoach.get(coach.id);
          return (
            <Card key={coach.id} className="p-6">
              <CardContent className="flex h-full flex-col gap-4 p-0">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
                  <Icon className="size-5" />
                </span>
                <div className="flex-1 space-y-1.5">
                  <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
                    {coach.name}
                  </h2>
                  <p className="text-xs font-medium tracking-wide text-accent uppercase">
                    {coach.tagline}
                  </p>
                  {!hasAnySession && (
                    <p className="text-sm text-muted-foreground">
                      {coach.description}
                    </p>
                  )}
                </div>
                {latest ? (
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/coaches/${coach.id}/sessions/${latest.id}`}>
                      Continua
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : (
                  <NewSessionButton coachId={coach.id} variant="accent" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {openTopics.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Compass className="size-4" />
            Temi ancora aperti
          </h2>
          <div className="space-y-2">
            {openTopics.map((t) => {
              const meta = COACH_META_LIST.find((c) => c.id === t.coachId);
              return (
                <Card key={t.id} className="p-4">
                  <CardContent className="flex items-center justify-between gap-4 p-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {t.topic}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {meta?.name ?? t.coachId}
                      </p>
                    </div>
                    <ResumeTopicButton
                      coachId={t.coachId as CoachId}
                      topic={t.topic}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {hasAnySession && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Sessioni recenti
          </h2>
          <div className="space-y-2">
            {sessions.slice(0, 8).map((s) => {
              const meta = COACH_META_LIST.find((c) => c.id === s.coachId);
              const Icon = meta?.icon ?? Sparkles;
              return (
                <Card
                  key={s.id}
                  className="p-4 hover:shadow-[var(--shadow-1,0_1px_2px_rgba(19,33,90,0.08))]"
                >
                  <CardContent className="flex items-center justify-between gap-4 p-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {s.title || DEFAULT_SESSION_TITLE}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {meta?.name ?? s.coachId} ·{" "}
                          {s.updatedAt.toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <SessionScoreBadge
                        scores={entryBySession.get(s.id)?.scores ?? null}
                        register={entryBySession.get(s.id)?.register ?? null}
                      />
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/coaches/${s.coachId}/sessions/${s.id}`}>
                          <MessagesSquare className="size-4" />
                          Apri
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
