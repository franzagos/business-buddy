"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await (authClient as any).requestPasswordReset({ email, redirectTo: "/reset-password" });
      setSent(true);
    } catch {
      setError("Qualcosa è andato storto. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card className="p-6">
        <CardContent className="space-y-4 p-0 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Controlla la tua email
          </h1>
          <p className="text-sm text-muted-foreground">
            Se esiste un account per {email}, ti abbiamo inviato un link per
            reimpostare la password.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Torna al login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardContent className="space-y-6 p-0">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Recupera password
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Inserisci la tua email per ricevere un link di recupero
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@esempio.com"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full" variant="accent">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Invia link di recupero
          </Button>
        </form>

        <p className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Torna al login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
