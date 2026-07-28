"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  FileUp,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { saveErrorMessage, deleteErrorMessage } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { COACH_META_LIST } from "@/lib/coaches/meta";

type CoachFilter = "all" | "executive" | "agency" | "startup";
type CoachSelectValue = "all" | "executive" | "agency" | "startup";

export interface BoardExpertSummary {
  id: string;
  coachId: string | null;
  name: string;
  lens: string;
  style: string;
  createdAt: string;
}

export interface StaticExpertSummary {
  coachId: "executive" | "agency" | "startup";
  id: string;
  name: string;
  lens: string;
  style: string;
  hidden: boolean;
}

interface BulkImportSummary {
  created: number;
  createdNames: string[];
  skipped: number;
  skippedReasons: string[];
  missingLens: string[];
}

function coachLabel(coachId: string | null): string {
  if (!coachId) return "Tutti i coach";
  return COACH_META_LIST.find((c) => c.id === coachId)?.name ?? coachId;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function ExpertsManager({
  initialExperts,
  staticExperts,
}: {
  initialExperts: BoardExpertSummary[];
  staticExperts: StaticExpertSummary[];
}) {
  const router = useRouter();
  const [experts, setExperts] = useState(initialExperts);
  const [statics, setStatics] = useState(staticExperts);
  const [filter, setFilter] = useState<CoachFilter>("all");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  // Manual add form state
  const [name, setName] = useState("");
  const [lens, setLens] = useState("");
  const [style, setStyle] = useState("");
  const [coachSelect, setCoachSelect] = useState<CoachSelectValue>("all");
  const [saving, setSaving] = useState(false);

  // Bulk import state
  const [markdown, setMarkdown] = useState("");
  const [bulkCoachSelect, setBulkCoachSelect] =
    useState<CoachSelectValue>("all");
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<BulkImportSummary | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    try {
      const contents = await Promise.all(files.map((f) => f.text()));
      // Multiple files: join with a blank line so each file's H3 blocks
      // still parse independently on the server.
      setMarkdown((prev) => {
        const joined = contents.join("\n\n");
        return prev.trim() ? `${prev}\n\n${joined}` : joined;
      });
      toast.success(
        files.length === 1
          ? `Caricato ${files[0].name}.`
          : `Caricati ${files.length} file.`
      );
    } catch {
      toast.error("Non sono riuscito a leggere il file. Riprova.");
    }
  }

  const filteredExperts = useMemo(() => {
    if (filter === "all") return experts;
    return experts.filter((e) => e.coachId === filter || e.coachId === null);
  }, [experts, filter]);

  const filteredStatics = useMemo(() => {
    if (filter === "all") return statics;
    return statics.filter((s) => s.coachId === filter);
  }, [statics, filter]);

  async function handleToggleHidden(expert: StaticExpertSummary) {
    const key = `${expert.coachId}:${expert.id}`;
    setTogglingKey(key);
    try {
      const res = await fetch("/api/admin/hidden-experts", {
        method: expert.hidden ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachId: expert.coachId, expertId: expert.id }),
      });
      if (!res.ok) {
        toast.error(saveErrorMessage("l'esperto"));
        return;
      }
      setStatics((prev) =>
        prev.map((s) =>
          s.coachId === expert.coachId && s.id === expert.id
            ? { ...s, hidden: !s.hidden }
            : s
        )
      );
      toast.success(expert.hidden ? "Esperto ripristinato." : "Esperto nascosto.");
      router.refresh();
    } catch {
      toast.error(saveErrorMessage("l'esperto"));
    } finally {
      setTogglingKey(null);
    }
  }

  async function handleAdd() {
    if (!name.trim() || !lens.trim() || !style.trim()) {
      toast.error("Nome, lente e stile sono obbligatori.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/experts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          lens,
          style,
          coachId: coachSelect,
        }),
      });
      if (!res.ok) {
        toast.error(saveErrorMessage("l'esperto"));
        return;
      }
      const { expert } = await res.json();
      setExperts((prev) => [
        { ...expert, createdAt: new Date().toISOString() },
        ...prev,
      ]);
      toast.success("Esperto aggiunto.");
      setName("");
      setLens("");
      setStyle("");
      setCoachSelect("all");
      router.refresh();
    } catch {
      toast.error(saveErrorMessage("l'esperto"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/experts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error(deleteErrorMessage("l'esperto"));
        return;
      }
      setExperts((prev) => prev.filter((e) => e.id !== id));
      toast.success("Esperto eliminato.");
      router.refresh();
    } catch {
      toast.error(deleteErrorMessage("l'esperto"));
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  }

  async function handleImport() {
    if (!markdown.trim()) {
      toast.error("Incolla del markdown da importare.");
      return;
    }
    setImporting(true);
    setImportSummary(null);
    try {
      const res = await fetch("/api/admin/experts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, coachId: bulkCoachSelect }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(body?.error || "Import non riuscito.");
        return;
      }
      setImportSummary(body as BulkImportSummary);
      toast.success(`${body.created} esperti importati.`);
      setMarkdown("");
      router.refresh();
      // Refresh local list by refetching.
      const listRes = await fetch("/api/admin/experts");
      if (listRes.ok) {
        const { experts: refreshed } = await listRes.json();
        setExperts(refreshed);
      }
    } catch {
      toast.error("Import non riuscito.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { value: "all", label: "Tutti" },
            { value: "executive", label: "Executive" },
            { value: "agency", label: "Agency" },
            { value: "startup", label: "Startup" },
          ] as { value: CoachFilter; label: string }[]
        ).map((tab) => (
          <Button
            key={tab.value}
            type="button"
            size="sm"
            variant={filter === tab.value ? "default" : "outline"}
            onClick={() => setFilter(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* List */}
      {filteredExperts.length === 0 ? (
        <Card className="p-6">
          <CardContent className="flex flex-col items-center gap-2 p-0 py-8 text-center">
            <p className="text-sm font-medium text-foreground">
              Nessun esperto in questa vista.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredExperts.map((e) => (
            <Card key={e.id} className="p-4">
              <CardContent className="flex items-start justify-between gap-3 p-0">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {e.name}
                    </p>
                    <Badge variant={e.coachId ? "outline" : "secondary"}>
                      {coachLabel(e.coachId)}
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {truncate(e.lens || "(nessuna lente)", 160)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Elimina ${e.name}`}
                  disabled={deletingId === e.id}
                  onClick={() => setPendingDeleteId(e.id)}
                  className="shrink-0"
                >
                  {deletingId === e.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Manual add */}
      <Card className="p-6">
        <CardContent className="space-y-4 p-0">
          <h2 className="text-sm font-medium text-foreground">
            Aggiungi esperto
          </h2>
          <div className="space-y-2">
            <Label htmlFor="expert-name">Nome</Label>
            <Input
              id="expert-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Charlie Munger"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expert-lens">Lente</Label>
            <Textarea
              id="expert-lens"
              value={lens}
              onChange={(e) => setLens(e.target.value)}
              placeholder="Il punto di vista distintivo di questo advisor..."
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expert-style">Stile</Label>
            <Textarea
              id="expert-style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Euristiche, frasi-tipo, forte su/debole su..."
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expert-coach">Coach</Label>
            <select
              id="expert-coach"
              value={coachSelect}
              onChange={(e) =>
                setCoachSelect(e.target.value as CoachSelectValue)
              }
              className="flex h-9 w-full rounded-sm border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Tutti i coach</option>
              {COACH_META_LIST.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Aggiungi esperto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Static (code-defined) experts */}
      <Card className="p-6">
        <CardContent className="space-y-4 p-0">
          <div>
            <h2 className="text-sm font-medium text-foreground">
              Esperti predefiniti
            </h2>
            <p className="text-xs text-muted-foreground">
              Roster fisso definito nel codice. Non puoi eliminarli, ma puoi
              nasconderli dall&apos;Advisory Board di un coach.
            </p>
          </div>
          {filteredStatics.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nessun esperto predefinito in questa vista.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredStatics.map((s) => {
                const key = `${s.coachId}:${s.id}`;
                return (
                  <Card
                    key={key}
                    className={`p-4 ${s.hidden ? "opacity-60" : ""}`}
                  >
                    <CardContent className="flex items-start justify-between gap-3 p-0">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {s.name}
                          </p>
                          <Badge variant="outline">{coachLabel(s.coachId)}</Badge>
                          {s.hidden && (
                            <Badge variant="secondary">Nascosto</Badge>
                          )}
                        </div>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {truncate(s.lens || "(nessuna lente)", 160)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          s.hidden ? `Ripristina ${s.name}` : `Nascondi ${s.name}`
                        }
                        disabled={togglingKey === key}
                        onClick={() => handleToggleHidden(s)}
                        className="shrink-0"
                      >
                        {togglingKey === key ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : s.hidden ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk import */}
      <Card className="p-6">
        <CardContent className="space-y-4 p-0">
          <div>
            <h2 className="text-sm font-medium text-foreground">
              Importa da Markdown
            </h2>
            <p className="text-xs text-muted-foreground">
              Carica un file Advisory-Board.md, oppure incolla il testo qui
              sotto (formato &quot;### Nome&quot; con bullet
              &quot;- **Label:** testo&quot;).
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt,text/markdown,text/plain"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="size-4" />
              Carica file .md
            </Button>
          </div>
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="### Charlie Munger — modelli mentali, inversione&#10;- **Lente:** ..."
            rows={10}
            className="resize-none font-mono text-xs"
          />
          <div className="space-y-2">
            <Label htmlFor="bulk-coach">Coach di destinazione</Label>
            <select
              id="bulk-coach"
              value={bulkCoachSelect}
              onChange={(e) =>
                setBulkCoachSelect(e.target.value as CoachSelectValue)
              }
              className="flex h-9 w-full rounded-sm border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Tutti i coach</option>
              {COACH_META_LIST.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleImport} disabled={importing}>
              {importing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UploadCloud className="size-4" />
              )}
              Importa
            </Button>
          </div>

          {importSummary && (
            <div className="space-y-1 rounded-sm border border-border bg-secondary/40 p-3 text-xs text-foreground">
              <p>
                <strong>{importSummary.created}</strong> esperti importati
                {importSummary.createdNames.length > 0 && (
                  <>: {importSummary.createdNames.join(", ")}</>
                )}
                .
              </p>
              {importSummary.skipped > 0 && (
                <p className="text-muted-foreground">
                  {importSummary.skipped} righe saltate:{" "}
                  {importSummary.skippedReasons.join("; ")}
                </p>
              )}
              {importSummary.missingLens.length > 0 && (
                <p className="text-muted-foreground">
                  Senza lente (da completare a mano):{" "}
                  {importSummary.missingLens.join(", ")}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminare l&apos;esperto?</DialogTitle>
            <DialogDescription>
              L&apos;azione non è reversibile. L&apos;esperto verrà rimosso
              dall&apos;Advisory Board.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDeleteId(null)}>
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
