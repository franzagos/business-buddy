import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Brain,
  Check,
  Target,
  Users,
} from "lucide-react";
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

      {/* ================= ATTENTION ================= */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 text-center sm:pt-20">
        <p className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Target className="size-3.5 text-accent" />
          Allenamento, non teoria da manuale
        </p>
        <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold tracking-[-0.02em] text-foreground sm:text-5xl md:text-[56px] md:leading-[1.05]">
          Le tue decisioni migliori nascono da un allenamento vero e da pareri
          che non hai ancora sentito
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Business Buddy ti mette davanti a casi difficili, ti costringe a
          decidere, poi smonta il tuo ragionamento con la lente di più esperti
          diversi. Non un riassunto di libri di business: un allenamento che
          si ricorda dove sbagli e ti ci riporta finché non impari.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="accent">
            <Link href="/register">
              Inizia ad allenarti
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

      {/* ================= INTEREST ================= */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Due modi per pensare meglio
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Ogni coach lavora su due binari: ti allena su casi costruiti per
            colpire i tuoi punti deboli, e ti aiuta a mettere alla prova le
            tue idee reali contro punti di vista diversi dal tuo.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Card className="p-6">
            <CardContent className="flex h-full flex-col gap-4 p-0">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
                <Brain className="size-6" />
              </span>
              <div className="space-y-1.5">
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  Allenamento con casi estremi
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ricevi un caso con poste alte e dati imperfetti. Decidi, il
                  coach smonta il tuo piano un punto alla volta, ti fa vedere
                  la conseguenza a catena e ti insegna il principio dietro
                  l&apos;errore. Nessuno sconto, ma sempre una lezione.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="flex h-full flex-col gap-4 p-0">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
                <Users className="size-6" />
              </span>
              <div className="space-y-1.5">
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  Un Advisory Board di pareri diversi
                </h3>
                <p className="text-sm text-muted-foreground">
                  Porti un problema vero e convochi più prospettive che
                  ragionano con logiche diverse dalla tua. Vedi dove
                  convergono, dove no, e cosa la tua idea non aveva ancora
                  considerato.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <LoopDivider />
      </div>

      {/* Coach grid — still Interest, concrete proof of the method */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Tre coach, tre terreni di allenamento
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Scegli il coach più vicino al problema che hai adesso. Ogni coach
            ricorda le tue sessioni precedenti e mira ai pattern che si
            ripetono.
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

      {/* ================= DESIRE ================= */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Cosa cambia, sessione dopo sessione
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Card className="p-6">
            <CardContent className="flex items-start gap-3 p-0">
              <Check className="mt-0.5 size-5 shrink-0 text-accent" />
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">
                  Vedi i tuoi punti ciechi ricorrenti
                </h3>
                <p className="text-sm text-muted-foreground">
                  Se sbagli lo stesso tipo di mossa tre volte, il coach lo
                  nota e costruisce apposta il caso successivo per stressarlo.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="flex items-start gap-3 p-0">
              <Check className="mt-0.5 size-5 shrink-0 text-accent" />
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">
                  Decidi con più angoli, non da solo
                </h3>
                <p className="text-sm text-muted-foreground">
                  Prima di agire, confronti la tua idea con più prospettive
                  invece di fidarti solo del tuo primo istinto.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="flex items-start gap-3 p-0">
              <Check className="mt-0.5 size-5 shrink-0 text-accent" />
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">
                  Progressi tracciati, non solo chat
                </h3>
                <p className="text-sm text-muted-foreground">
                  Punteggi per sessione, temi ancora aperti, un delta
                  misurabile rispetto alla volta scorsa.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ================= ACTION ================= */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Card className="overflow-hidden bg-primary p-10 text-center text-primary-foreground sm:p-14">
          <CardContent className="space-y-5 p-0">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Il prossimo caso è pronto per te
            </h2>
            <p className="mx-auto max-w-xl text-sm text-primary-foreground/80 sm:text-base">
              Crea un account gratuito e inizia la tua prima sessione di
              allenamento in meno di un minuto.
            </p>
            <Button asChild size="lg" variant="accent">
              <Link href="/register">
                Inizia ad allenarti
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
