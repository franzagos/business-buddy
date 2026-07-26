import { desc, eq, and } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LineChart, MessageSquarePlus, MessagesSquare } from "lucide-react";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { coachingSession } from "@/lib/schema";
import { isCoachId } from "@/lib/coaches";
import { COACH_META } from "@/lib/coaches/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NewSessionButton } from "@/components/chat/new-session-button";

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
        eq(coachingSession.coachId, coachId)
      )
    )
    .orderBy(desc(coachingSession.updatedAt))
    .limit(50);

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
            <NewSessionButton coachId={coachId} />
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
                  Inizia la tua prima sessione con {meta.name.toLowerCase()}.
                </p>
              </div>
              <NewSessionButton coachId={coachId} variant="accent" />
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
                      {s.title || "Nuova sessione"}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {s.updatedAt.toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/coaches/${coachId}/sessions/${s.id}`}>
                      <MessageSquarePlus className="size-4" />
                      Continua
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
