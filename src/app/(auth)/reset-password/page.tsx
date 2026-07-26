"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <Card className="p-6">
        <CardContent className="space-y-4 p-0 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Link non valido
          </h1>
          <p className="text-sm text-muted-foreground">
            Questo link per reimpostare la password non è valido o è scaduto.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Richiedi un nuovo link
          </Link>
        </CardContent>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }
    if (password.length < 8) {
      setError("La password deve avere almeno 8 caratteri");
      return;
    }

    setLoading(true);
    try {
      await (authClient as any).resetPassword({ newPassword: password, token: token! });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Impossibile reimpostare la password. Il link potrebbe essere scaduto.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="p-6">
        <CardContent className="space-y-4 p-0 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Password aggiornata
          </h1>
          <p className="text-sm text-muted-foreground">
            Ti stiamo reindirizzando al login...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardContent className="space-y-6 p-0">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Nuova password
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Scegli una nuova password per il tuo account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">Nuova password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm">Conferma password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full" variant="accent">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Reimposta password
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
