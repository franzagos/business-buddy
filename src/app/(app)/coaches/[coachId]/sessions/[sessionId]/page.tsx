import { asc, eq, or } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { coachingSession, coachingMessage, advisorProfile } from "@/lib/schema";
import { getCoach, isCoachId } from "@/lib/coaches";
import { findMatchingBusiness } from "@/lib/coaches/business-context";
import { COACH_META } from "@/lib/coaches/meta";
import { ChatTranscript } from "@/components/chat/chat-transcript";
import { SessionTitle } from "@/components/chat/session-title";
import { Badge } from "@/components/ui/badge";

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
  const matchingBusiness = await findMatchingBusiness(session.user.id, coachId);

  const dbAdvisors = await db
    .select({
      id: advisorProfile.id,
      name: advisorProfile.name,
      ownerUserId: advisorProfile.ownerUserId,
    })
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
    ...dbAdvisors.map((a) => ({ id: a.id, name: a.name })),
  ];
  const hasOwnAdvisorProfile = dbAdvisors.some(
    (a) => a.ownerUserId === session.user.id
  );

  return (
    <div className="flex h-screen min-h-0 flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {meta.name}
          </p>
          {matchingBusiness && (
            <Link href={`/settings/businesses/${matchingBusiness.id}`}>
              <Badge
                variant="secondary"
                className="gap-1 transition-colors ease-[var(--ease-snap)] duration-150 hover:bg-secondary/70"
              >
                <Building2 className="size-3" />
                Contesto: {matchingBusiness.name}
              </Badge>
            </Link>
          )}
        </div>
        <SessionTitle
          coachId={coachId}
          sessionId={sessionId}
          initialTitle={chatSession.title}
        />
      </header>

      <ChatTranscript
        coachId={coachId}
        sessionId={sessionId}
        advisors={advisors}
        hasOwnAdvisorProfile={hasOwnAdvisorProfile}
        initialMessages={messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        }))}
      />
    </div>
  );
}
