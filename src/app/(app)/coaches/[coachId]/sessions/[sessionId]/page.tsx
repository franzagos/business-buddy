import { asc, eq, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { coachingSession, coachingMessage, advisorProfile } from "@/lib/schema";
import { getCoach, isCoachId } from "@/lib/coaches";
import { COACH_META } from "@/lib/coaches/meta";
import { ChatTranscript } from "@/components/chat/chat-transcript";

export default async function ChatSessionPage({
  params,
}: {
  params: Promise<{ coachId: string; sessionId: string }>;
}) {
  const { coachId, sessionId } = await params;
  if (!isCoachId(coachId)) notFound();

  const session = await requireAuth();

  const [chatSession] = await db
    .select({
      id: coachingSession.id,
      userId: coachingSession.userId,
      coachId: coachingSession.coachId,
      title: coachingSession.title,
    })
    .from(coachingSession)
    .where(eq(coachingSession.id, sessionId))
    .limit(1);

  if (
    !chatSession ||
    chatSession.userId !== session.user.id ||
    chatSession.coachId !== coachId
  ) {
    notFound();
  }

  const messages = await db
    .select({
      id: coachingMessage.id,
      role: coachingMessage.role,
      content: coachingMessage.content,
      createdAt: coachingMessage.createdAt,
    })
    .from(coachingMessage)
    .where(eq(coachingMessage.sessionId, sessionId))
    .orderBy(asc(coachingMessage.createdAt))
    .limit(200);

  const meta = COACH_META[coachId];
  const coach = getCoach(coachId);

  const dbAdvisors = await db
    .select({ id: advisorProfile.id, name: advisorProfile.name })
    .from(advisorProfile)
    .where(
      or(
        eq(advisorProfile.ownerUserId, session.user.id),
        eq(advisorProfile.isShared, true)
      )
    )
    .limit(50);

  const advisors = [
    ...coach.advisoryBoard.map((a) => ({ id: a.id, name: a.name })),
    ...dbAdvisors,
  ];

  return (
    <div className="flex h-screen min-h-0 flex-col">
      <header className="border-b border-border px-6 py-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {meta.name}
        </p>
        <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">
          {chatSession.title || "Nuova sessione"}
        </h1>
      </header>

      <ChatTranscript
        coachId={coachId}
        sessionId={sessionId}
        advisors={advisors}
        initialMessages={messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        }))}
      />
    </div>
  );
}
