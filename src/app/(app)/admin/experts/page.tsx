import { desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users2 } from "lucide-react";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { boardExpert } from "@/lib/schema";
import { ExpertsManager } from "@/components/admin/experts-manager";

export default async function AdminExpertsPage() {
  const session = await requireAuth();
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail || session.user.email !== ownerEmail) {
    notFound();
  }

  const experts = await db
    .select({
      id: boardExpert.id,
      coachId: boardExpert.coachId,
      name: boardExpert.name,
      lens: boardExpert.lens,
      style: boardExpert.style,
      createdAt: boardExpert.createdAt,
    })
    .from(boardExpert)
    .orderBy(desc(boardExpert.createdAt))
    .limit(200);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Admin
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
          <Users2 className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Advisory Board
          </h1>
          <p className="text-sm text-muted-foreground">
            Aggiungi o rimuovi esperti disponibili nell&apos;Advisory Board, oltre al roster fisso.
          </p>
        </div>
      </div>

      <ExpertsManager
        initialExperts={experts.map((e) => ({
          ...e,
          createdAt: e.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
