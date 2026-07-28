"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { saveErrorMessage } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AdvisorProfileFormProps {
  initialWhatTheyThink: string;
  initialHowTheyDecide: string;
}

export function AdvisorProfileForm({
  initialWhatTheyThink,
  initialHowTheyDecide,
}: AdvisorProfileFormProps) {
  const [whatTheyThink, setWhatTheyThink] = useState(initialWhatTheyThink);
  const [howTheyDecide, setHowTheyDecide] = useState(initialHowTheyDecide);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/advisor-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatTheyThink, howTheyDecide }),
      });
      if (!res.ok) {
        toast.error(saveErrorMessage("il profilo"));
        return;
      }
      toast.success("Profilo salvato.");
    } catch {
      toast.error(saveErrorMessage("il profilo"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="what-they-think">Cosa penso</Label>
        <Textarea
          id="what-they-think"
          value={whatTheyThink}
          onChange={(e) => setWhatTheyThink(e.target.value)}
          placeholder="Di fronte a un problema, il mio primo istinto è..."
          rows={6}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="how-they-decide">Come decido</Label>
        <Textarea
          id="how-they-decide"
          value={howTheyDecide}
          onChange={(e) => setHowTheyDecide(e.target.value)}
          placeholder="Quando devo decidere, il mio processo è..."
          rows={6}
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
          Salva profilo
        </Button>
      </div>
    </div>
  );
}
