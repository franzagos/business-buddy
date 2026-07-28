import { desc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { coachingSession } from "@/lib/schema";
import { Sidebar } from "@/components/app-shell/sidebar";
import { NavigationProgress } from "@/components/app-shell/navigation-progress";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  const recentSessions = await db
    .select({
      id: coachingSession.id,
      coachId: coachingSession.coachId,
      title: coachingSession.title,
    })
    .from(coachingSession)
    .where(eq(coachingSession.userId, session.user.id))
    .orderBy(desc(coachingSession.updatedAt))
    .limit(5);

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <NavigationProgress />
      <Sidebar recentSessions={recentSessions} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
