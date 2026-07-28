import { requireAuth } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessForm } from "@/components/settings/business-form";

export default async function NewBusinessPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Nuovo business
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Descrivi la tua attività. Potrai aggiungere documenti di
          riferimento dopo averla creata.
        </p>
      </div>

      <Card className="p-6">
        <CardContent className="p-0">
          <BusinessForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
