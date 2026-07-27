import { eq } from "drizzle-orm";
import { Briefcase } from "lucide-react";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { businessProfile } from "@/lib/schema";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessProfileForm } from "@/components/settings/business-profile-form";

export default async function BusinessProfilePage() {
  const session = await requireAuth();

  const [profile] = await db
    .select({
      businessType: businessProfile.businessType,
      context: businessProfile.context,
      notes: businessProfile.notes,
    })
    .from(businessProfile)
    .where(eq(businessProfile.userId, session.user.id))
    .limit(1);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Il tuo business
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Descrivi la tua azienda una volta sola. I coach lo useranno come
          contesto reale nelle sessioni, invece di casi generici.
        </p>
      </div>

      {!profile && (
        <Card className="p-6">
          <CardContent className="flex flex-col items-center gap-3 p-0 py-6 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Briefcase className="size-5" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Non hai ancora descritto il tuo business
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                Compila i campi qui sotto: che tipo di business è, il
                contesto e qualsiasi altra info utile per i coach.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="p-6">
        <CardContent className="p-0">
          <BusinessProfileForm
            initialBusinessType={
              (profile?.businessType as
                | "executive"
                | "agency"
                | "startup"
                | "other"
                | null) ?? "none"
            }
            initialContext={profile?.context ?? ""}
            initialNotes={profile?.notes ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
