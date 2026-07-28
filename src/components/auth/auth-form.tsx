"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, signUp } from "@/lib/auth-client";
import { Loader2, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { isCoachId } from "@/lib/coaches";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const isLogin = mode === "login";
  // If the user arrived from a specific coach's card on the landing page
  // (?coach=executive), skip the generic dashboard and drop them straight
  // into a first session with that coach — fewer steps to the first value
  // moment (see specs/coaching-platform/decisions.md's neuromarketing notes).
  const coachParam = searchParams.get("coach");
  const redirectCoach = coachParam && isCoachId(coachParam) ? coachParam : null;

  async function goToDestination() {
    if (!redirectCoach) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    try {
      const res = await fetch(`/api/coaches/${redirectCoach}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track: "training" }),
      });
      if (res.ok) {
        const { session: newSession } = await res.json();
        router.push(`/coaches/${redirectCoach}/sessions/${newSession.id}`);
        router.refresh();
        return;
      }
    } catch {
      // fall through to dashboard
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message || "Email o password non corrette");
          return;
        }
      } else {
        const result = await signUp.email({ email, password, name });
        if (result.error) {
          setError(result.error.message || "Non sono riuscito a creare l'account");
          return;
        }
      }
      await goToDestination();
    } catch {
      setError("Qualcosa è andato storto. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLinkSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const callbackURL = redirectCoach ? `/coaches/${redirectCoach}` : "/dashboard";
      const result = await signIn.magicLink({ email, callbackURL });
      if (result.error) {
        setError(result.error.message || "Non sono riuscito a inviare il link. Riprova.");
        return;
      }
      setMagicLinkSent(true);
    } catch {
      setError("Qualcosa è andato storto. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  if (isLogin && magicLinkSent) {
    return (
      <Card className="p-6">
        <CardContent className="space-y-4 p-0 text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-secondary text-accent">
            <Mail className="size-5" />
          </span>
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Controlla la tua email
            </h1>
            <p className="text-sm text-muted-foreground">
              Ti abbiamo inviato un link di accesso a {email}. Il link scade
              tra un&apos;ora.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setMagicLinkSent(false);
              setUseMagicLink(false);
            }}
          >
            Torna al login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
    <CardContent className="space-y-6 p-0">
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {isLogin ? "Bentornato" : "Crea un account"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isLogin
            ? useMagicLink
              ? "Ricevi un link di accesso via email"
              : "Accedi al tuo account"
            : "Inserisci i tuoi dati per iniziare"}
        </p>
      </div>

      {isLogin && useMagicLink ? (
        <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="magic-email">Email</Label>
            <Input
              id="magic-email"
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
            Invia link di accesso
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Il tuo nome"
              />
            </div>
          )}

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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {isLogin && (
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Password dimenticata?
                </Link>
              )}
            </div>
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full" variant="accent">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLogin ? "Accedi" : "Crea account"}
          </Button>
        </form>
      )}

      {isLogin && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setError("");
            setUseMagicLink((v) => !v);
          }}
        >
          <Mail className="size-4" />
          {useMagicLink ? "Accedi con password" : "Accedi con un link via email"}
        </Button>
      )}

      {/* Switch mode */}
      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "Non hai un account?" : "Hai già un account?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="text-foreground underline underline-offset-2 hover:text-foreground/80 transition-colors"
        >
          {isLogin ? "Registrati" : "Accedi"}
        </Link>
      </p>
    </CardContent>
    </Card>
  );
}
