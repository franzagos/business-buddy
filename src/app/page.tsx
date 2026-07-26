import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LineChart, MessagesSquare, ShieldCheck } from "lucide-react";
import { getOptionalSession } from "@/lib/session";
import { COACH_META_LIST } from "@/lib/coaches/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoopDivider } from "@/components/ui/loop-divider";

export default async function LandingPage() {
  const session = await getOptionalSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          Business Buddy
        </span>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Accedi</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Inizia ora</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 text-center sm:pt-20">
        <p className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="size-3.5 text-accent" />
          Coaching privato, sempre disponibile
        </p>
        <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold tracking-[-0.02em] text-foreground sm:text-5xl md:text-[56px] md:leading-[1.05]">
          Il tuo consulente da 30 anni di trincea, ogni volta che ne hai bisogno
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Tre coach AI — Executive, Agency, Startup — costruiti su casi reali,
          non su teoria da manuale. Parlano chiaro, ricordano ogni sessione e
          ti aiutano a decidere quando conta davvero.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="accent">
            <Link href="/register">
              Inizia ora
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Ho già un account</Link>
          </Button>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <LoopDivider />
      </div>

      {/* Coach grid */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Tre coach, tre prospettive
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Scegli chi ti serve adesso. Ogni coach ricorda le tue sessioni
            precedenti e traccia i tuoi progressi.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {COACH_META_LIST.map((coach) => {
            const Icon = coach.icon;
            return (
              <Card key={coach.id} className="p-6">
                <CardContent className="flex h-full flex-col gap-4 p-0">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
                    <Icon className="size-6" />
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                      {coach.name}
                    </h3>
                    <p className="text-xs font-medium tracking-wide text-accent uppercase">
                      {coach.tagline}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {coach.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <LoopDivider />
      </div>

      {/* Feature strip */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-5 sm:grid-cols-2">
          <Card className="p-6">
            <CardContent className="flex items-start gap-4 p-0">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
                <MessagesSquare className="size-5" />
              </span>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">
                  Sessioni che si ricordano di te
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ogni conversazione resta salvata. Riprendi esattamente da
                  dove avevi lasciato, con il contesto già pronto.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="flex items-start gap-4 p-0">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
                <LineChart className="size-5" />
              </span>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">
                  Progressi tracciati, non solo chat
                </h3>
                <p className="text-sm text-muted-foreground">
                  Punteggi, temi aperti, pattern ricorrenti: il coach nota ciò
                  che ripeti, così puoi correggerlo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Card className="overflow-hidden bg-primary p-10 text-center text-primary-foreground sm:p-14">
          <CardContent className="space-y-5 p-0">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Pronto a decidere con più chiarezza?
            </h2>
            <p className="mx-auto max-w-xl text-sm text-primary-foreground/80 sm:text-base">
              Crea un account gratuito e inizia la tua prima sessione in meno
              di un minuto.
            </p>
            <Button asChild size="lg" variant="accent">
              <Link href="/register">
                Inizia ora
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        Business Buddy
      </footer>
    </div>
  );
}
