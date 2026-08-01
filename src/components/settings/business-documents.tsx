"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { deleteErrorMessage } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface BusinessDocumentSummary {
  id: string;
  fileName: string;
  sizeBytes: number;
  createdAt: string;
}

interface BusinessDocumentsProps {
  businessId: string;
  initialDocuments: BusinessDocumentSummary[];
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BusinessDocuments({
  businessId,
  initialDocuments,
}: BusinessDocumentsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (documents.length >= 5) {
      toast.error("Puoi caricare al massimo 5 documenti per business.");
      return;
    }

    if (!/\.(txt|md)$/i.test(file.name)) {
      toast.error("Formato non supportato: carica solo file .txt o .md.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/businesses/${businessId}/documents`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(body?.error || "Non sono riuscito a caricare il file.");
        return;
      }
      const { document } = await res.json();
      setDocuments((prev) => [...prev, document]);
      toast.success("Documento caricato.");
    } catch {
      toast.error("Non sono riuscito a caricare il file.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(documentId: string) {
    setDeletingId(documentId);
    try {
      const res = await fetch(
        `/api/businesses/${businessId}/documents/${documentId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        toast.error(deleteErrorMessage("il documento"));
        return;
      }
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
      toast.success("Documento eliminato.");
      router.refresh();
    } catch {
      toast.error(deleteErrorMessage("il documento"));
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            Documenti di riferimento
          </p>
          <p className="text-xs text-muted-foreground">
            File .txt o .md — usati come riferimento dai coach (max 5).
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={uploading || documents.length >= 5}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Carica documento
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-sm border border-dashed border-border py-8 text-center">
          <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <FileText className="size-4" />
          </span>
          <p className="text-sm text-muted-foreground">
            Nessun documento caricato ancora.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-sm border border-border">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">
                    {doc.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(doc.sizeBytes)} ·{" "}
                    {new Date(doc.createdAt).toLocaleDateString("it-IT")}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Elimina ${doc.fileName}`}
                disabled={deletingId === doc.id}
                onClick={() => setPendingDeleteId(doc.id)}
              >
                {deletingId === doc.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminare il documento?</DialogTitle>
            <DialogDescription>
              L&apos;azione non è reversibile. Il file verrà rimosso
              definitivamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDeleteId(null)}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              disabled={deletingId !== null}
              onClick={() => pendingDeleteId && handleDelete(pendingDeleteId)}
            >
              {deletingId !== null ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
