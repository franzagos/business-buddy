"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { saveErrorMessage } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { COACH_META_LIST } from "@/lib/coaches/meta";

type BusinessType = "executive" | "agency" | "startup" | "general" | "none";

interface BusinessFormProps {
  mode: "create" | "edit";
  businessId?: string;
  initialName?: string;
  initialBusinessType?: BusinessType;
  initialContext?: string;
  initialNotes?: string;
}

export function BusinessForm({
  mode,
  businessId,
  initialName = "",
  initialBusinessType = "none",
  initialContext = "",
  initialNotes = "",
}: BusinessFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [businessType, setBusinessType] =
    useState<BusinessType>(initialBusinessType);
  const [context, setContext] = useState(initialContext);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Il nome del business è obbligatorio.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        mode === "create" ? "/api/businesses" : `/api/businesses/${businessId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, businessType, context, notes }),
        }
      );
      if (!res.ok) {
        toast.error(saveErrorMessage("il business"));
        return;
      }
      toast.success("Business salvato.");
      if (mode === "create") {
        const { business: created } = await res.json();
        router.push(`/settings/businesses/${created.id}`);
      } else {
        router.refresh();
      }
    } catch {
      toast.error(saveErrorMessage("il business"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="business-name">Nome</Label>
        <Input
          id="business-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Es. La mia agenzia, Il mio side project..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-type">Tipo di business</Label>
        <select
          id="business-type"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value as BusinessType)}
          className="flex h-9 w-full rounded-sm border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="none">Nessuno</option>
          <option value="general">Generico</option>
          {COACH_META_LIST.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Se corrisponde a un coach specifico, quel coach userà questo
          business come esempio negli esercizi, a meno che tu non dica
          diversamente nella sessione.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-context">Contesto del business</Label>
        <Textarea
          id="business-context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Cosa fa l'azienda, dimensione del team, fase in cui si trova, mercato..."
          rows={5}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-notes">Altre info utili</Label>
        <Textarea
          id="business-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Qualsiasi altro dettaglio che il coach dovrebbe conoscere..."
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {mode === "create" ? "Crea business" : "Salva business"}
        </Button>
      </div>
    </div>
  );
}
