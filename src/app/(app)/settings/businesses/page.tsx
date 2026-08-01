import Link from "next/link";
import { eq, desc, inArray, sql } from "drizzle-orm";
import { Briefcase, Plus, FileText } from "lucide-react";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { business, businessDocument } from "@/lib/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COACH_META } from "@/lib/coaches/meta";
import type { CoachId } from "@/lib/coaches";

export default async function BusinessesPage() {
  const session = await requireAuth();

  const businesses = await db
    .select({
      id: business.id,
      name: business.name,
      businessType: business.businessType,
      context: business.context,
      updatedAt: business.updatedAt,
    })
    .from(business)
    .where(eq(business.ownerUserId, session.user.id))
    .orderBy(desc(business.updatedAt))
    .limit(50);

  const docCounts = new Map<string, number>();
  if (businesses.length > 0) {
    const counts = await db
      .select({
        businessId: businessDocument.businessId,
        count: sql<number>`count(*)`,
      })
      .from(businessDocument)
      .where(
        inArray(
          businessDocument.businessId,
          businesses.map((b) => b.id)
        )
      )
      .groupBy(businessDocument.businessId);
    for (const c of counts) {
      docCounts.set(c.businessId, Number(c.count));
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            I tuoi business
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Descrivi ogni tua attività una volta sola. I coach le useranno
            come contesto reale nelle sessioni, invece di casi generici.
          </p>
        </div>
        <Button asChild>
          <Link href="/settings/businesses/new">
            <Plus className="size-4" />
            Nuovo business
          </Link>
        </Button>
      </div>

      {businesses.length === 0 ? (
        <Card className="p-6">
          <CardContent className="flex flex-col items-center gap-3 p-0 py-6 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Briefcase className="size-5" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Non hai ancora aggiunto nessun business
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                Aggiungi la tua agenzia, la tua startup o qualsiasi altra
                attività: contesto, note e documenti che i coach possono
                usare come esempio reale.
              </p>
            </div>
            <Button asChild className="mt-2">
              <Link href="/settings/businesses/new">
                <Plus className="size-4" />
                Nuovo business
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b) => {
            const meta = b.businessType
              ? COACH_META[b.businessType as CoachId]
              : null;
            const docCount = docCounts.get(b.id) ?? 0;
            return (
              <Link key={b.id} href={`/settings/businesses/${b.id}`}>
                <Card className="h-full p-6 hover:shadow-[var(--shadow-1)]">
                  <CardContent className="space-y-3 p-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-base font-semibold tracking-tight text-foreground">
                        {b.name}
                      </p>
                      {meta ? (
                        <Badge variant="secondary">{meta.name}</Badge>
                      ) : b.businessType === "general" ? (
                        <Badge variant="secondary">Generico</Badge>
                      ) : null}
                    </div>
                    {b.context ? (
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {b.context}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Nessun contesto ancora.
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="size-3.5" />
                      {docCount === 0
                        ? "Nessun documento"
                        : `${docCount} document${docCount === 1 ? "o" : "i"}`}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
