import { and, eq } from "drizzle-orm";
import { UserCircle2 } from "lucide-react";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { advisorProfile } from "@/lib/schema";
import { Card, CardContent } from "@/components/ui/card";
import { AdvisorProfileForm } from "@/components/settings/advisor-profile-form";

export default async function AdvisorProfilePage() {
  const session = await requireAuth();

  const [profile] = await db
    .select({
      whatTheyThink: advisorProfile.whatTheyThink,
      howTheyDecide: advisorProfile.howTheyDecide,
    })
    .from(advisorProfile)
    .where(
      and(
        eq(advisorProfile.ownerUserId, session.user.id),
        eq(advisorProfile.isShared, false)
      )
    )
    .limit(1);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Il tuo profilo da advisor
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Descrivi come pensi e come decidi. Questo profilo diventa una voce
          disponibile nell&apos;Advisory Board delle tue sessioni di coaching,
          al pari degli altri advisor.
        </p>
      </div>

      {!profile && (
        <Card className="p-6">
          <CardContent className="flex flex-col items-center gap-3 p-0 py-6 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <UserCircle2 className="size-5" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Non hai ancora scritto il tuo profilo
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                Compila i due campi qui sotto: cosa pensi tipicamente di
                fronte a un problema e come prendi le decisioni. Una volta
                salvato, potrai convocarti come voce dell&apos;Advisory Board
                durante una sessione.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="p-6">
        <CardContent className="p-0">
          <AdvisorProfileForm
            initialWhatTheyThink={profile?.whatTheyThink ?? ""}
            initialHowTheyDecide={profile?.howTheyDecide ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
