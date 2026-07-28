import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { business, businessDocument } from "@/lib/schema";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessForm } from "@/components/settings/business-form";
import { BusinessDocuments } from "@/components/settings/business-documents";
import { DeleteBusinessButton } from "@/components/settings/delete-business-button";

type BusinessType = "executive" | "agency" | "startup" | "general" | "none";

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const session = await requireAuth();
  const { businessId } = await params;

  const [record] = await db
    .select({
      id: business.id,
      ownerUserId: business.ownerUserId,
      name: business.name,
      businessType: business.businessType,
      context: business.context,
      notes: business.notes,
    })
    .from(business)
    .where(eq(business.id, businessId))
    .limit(1);

  if (!record || record.ownerUserId !== session.user.id) {
    notFound();
  }

  const documents = await db
    .select({
      id: businessDocument.id,
      fileName: businessDocument.fileName,
      sizeBytes: businessDocument.sizeBytes,
      createdAt: businessDocument.createdAt,
    })
    .from(businessDocument)
    .where(eq(businessDocument.businessId, record.id))
    .limit(5);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {record.name}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Aggiorna le informazioni e gestisci i documenti di riferimento di
          questo business.
        </p>
      </div>

      <Card className="p-6">
        <CardContent className="p-0">
          <BusinessForm
            mode="edit"
            businessId={record.id}
            initialName={record.name}
            initialBusinessType={(record.businessType as BusinessType) ?? "none"}
            initialContext={record.context ?? ""}
            initialNotes={record.notes ?? ""}
          />
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardContent className="p-0">
          <BusinessDocuments
            businessId={record.id}
            initialDocuments={documents.map((d) => ({
              ...d,
              createdAt: d.createdAt.toISOString(),
            }))}
          />
        </CardContent>
      </Card>

      <Card className="border-destructive/30 p-6">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-0">
          <div>
            <p className="text-sm font-medium text-foreground">
              Elimina business
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              Rimuove definitivamente questo business e tutti i suoi
              documenti di riferimento.
            </p>
          </div>
          <DeleteBusinessButton businessId={record.id} />
        </CardContent>
      </Card>
    </div>
  );
}
