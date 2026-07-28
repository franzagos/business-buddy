import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import {
  apiResponse,
  apiError,
  requireApiAuth,
  applyRateLimit,
} from "@/lib/api-utils";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { business, businessDocument } from "@/lib/schema";
import { upload } from "@/lib/storage";

const paramsSchema = z.object({ businessId: z.string().uuid() });

const MAX_DOCUMENTS_PER_BUSINESS = 5;
const MAX_CONTENT_CHARS = 50_000;
const TEXT_EXTENSIONS = new Set([".txt", ".md"]);

async function getOwnedBusiness(businessId: string, userId: string) {
  const [existing] = await db
    .select({ id: business.id, ownerUserId: business.ownerUserId })
    .from(business)
    .where(eq(business.id, businessId))
    .limit(1);
  if (!existing || existing.ownerUserId !== userId) return null;
  return existing;
}

/** GET — documents for a business, ownership-checked via the parent business. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) return apiError("Not found", 404);

  const owned = await getOwnedBusiness(
    parsedParams.data.businessId,
    session.user.id
  );
  if (!owned) return apiError("Not found", 404);

  const documents = await db
    .select({
      id: businessDocument.id,
      fileName: businessDocument.fileName,
      fileUrl: businessDocument.fileUrl,
      mimeType: businessDocument.mimeType,
      sizeBytes: businessDocument.sizeBytes,
      createdAt: businessDocument.createdAt,
    })
    .from(businessDocument)
    .where(eq(businessDocument.businessId, owned.id))
    .orderBy(asc(businessDocument.createdAt))
    .limit(50);

  return apiResponse({ documents });
}

/** POST — upload a knowledge-base document for a business (multipart/form-data). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const limited = await applyRateLimit("businesses-doc-upload", RATE_LIMITS.api);
  if (limited) return limited;

  const { session, error } = await requireApiAuth();
  if (error) return error;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) return apiError("Not found", 404);

  const owned = await getOwnedBusiness(
    parsedParams.data.businessId,
    session.user.id
  );
  if (!owned) return apiError("Not found", 404);

  const existingCount = await db
    .select({ id: businessDocument.id })
    .from(businessDocument)
    .where(eq(businessDocument.businessId, owned.id))
    .limit(MAX_DOCUMENTS_PER_BUSINESS);

  if (existingCount.length >= MAX_DOCUMENTS_PER_BUSINESS) {
    return apiError(
      `Puoi caricare al massimo ${MAX_DOCUMENTS_PER_BUSINESS} documenti per business.`,
      400
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return apiError("Invalid form data", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return apiError("Missing file", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let uploadResult;
  try {
    uploadResult = await upload(
      buffer,
      file.name,
      `business-kb/${owned.id}`
    );
  } catch (err) {
    return apiError(
      err instanceof Error ? err.message : "Upload fallito",
      400
    );
  }

  const ext = file.name
    .slice(file.name.lastIndexOf("."))
    .toLowerCase();

  let content: string | null = null;
  if (TEXT_EXTENSIONS.has(ext)) {
    const text = buffer.toString("utf-8");
    content =
      text.length > MAX_CONTENT_CHARS
        ? `${text.slice(0, MAX_CONTENT_CHARS)}\n\n[...troncato...]`
        : text;
  }

  const [created] = await db
    .insert(businessDocument)
    .values({
      businessId: owned.id,
      fileName: file.name,
      fileUrl: uploadResult.url,
      mimeType: file.type || null,
      sizeBytes: buffer.length,
      content,
    })
    .returning({
      id: businessDocument.id,
      fileName: businessDocument.fileName,
      fileUrl: businessDocument.fileUrl,
      mimeType: businessDocument.mimeType,
      sizeBytes: businessDocument.sizeBytes,
      createdAt: businessDocument.createdAt,
    });

  return apiResponse({ document: created }, 201);
}
