import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Brain,
  Briefcase,
  Check,
  FileText,
  History,
  ListChecks,
  Megaphone,
  Plus,
  Rocket,
  Target,
} from "lucide-react";
import { getOptionalSession } from "@/lib/session";
import { COACH_META_LIST } from "@/lib/coaches/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoopDivider } from "@/components/ui/loop-divider";

const COACH_DETAILS: Record<
  string,
  { description: string; bullets: string[] }
> = {
  executive: {
    description:
      "Per le decisioni che riguardano strategia, organizzazione, persone e redditività.",
    bullets: [
      "priorità strategiche",
      "assunzioni e organizzazione del team",
      "delega e responsabilità",
      "pricing e marginalità",
      "processi e produttività",
      "crescita e allocazione delle risorse",
    ],
  },
  agency: {
    description:
      "Per le decisioni che riguardano clienti, team e marginalità della tua agenzia.",
    bullets: [
      "utilization e allocazione del team",
      "scope creep e gestione dei progetti",
      "cliente-ancora e dipendenza dai grandi account",
      "pricing e marginalità dei progetti",
      "churn del team e retention dei talenti",
      "crescita e diversificazione dei servizi",
    ],
  },
  startup: {
    description:
      "Per prendere decisioni quando tempo, capitale e informazioni sono limitati.",
    bullets: [
      "product-market fit",
      "runway e burn rate",
      "crescita e priorità di prodotto",
      "fundraising e rapporti con gli investitori",
      "cap table ed equity",
      "prime assunzioni e struttura del team",
    ],
  },
};

const QUESTIONS = [
  "Il fatturato cresce, ma la marginalità sta peggiorando. Dove devo guardare?",
  "Il CAC è aumentato del 30%. Devo ridurre il budget, cambiare creatività o intervenire sull'offerta?",
  "Ho undici mesi di runway. Continuo a investire nella crescita o riduco il burn?",
  "Il team dipende ancora da me per ogni decisione. Il problema è nelle persone, nei processi o nella mia delega?",
  "Devo assumere un manager esperto o promuovere una persona interna?",
  "Il prodotto vende, ma i clienti non riacquistano. Quale parte del modello devo rivedere?",
];

const RECEIVE_ITEMS = [
  "una definizione più precisa della situazione",
  "le domande che non ti sei ancora posto",
  "le informazioni mancanti prima di decidere",
  "più opzioni con relativi compromessi",
  "rischi e conseguenze di secondo livello",
  "una raccomandazione motivata",
  "un piano con priorità e prossime azioni",
  "un esercizio per approfondire la competenza emersa",
];

const CONTEXT_ITEMS = [
  "evitare consigli generici",
  "utilizzare i tuoi dati durante l'analisi",
  "ricordare i temi lasciati aperti",
  "riconoscere errori e schemi ricorrenti",
  "costruire esercizi sempre più pertinenti",
  "confrontare i tuoi progressi nel tempo",
];

const FAQ = [
  {
    q: "Che differenza c'è rispetto a una normale chat AI?",
    a: "Business Buddy organizza ogni sessione intorno a un coach specializzato, al contesto della tua azienda e alla memoria delle conversazioni precedenti. Puoi usarlo per affrontare un problema attuale oppure per seguire un percorso di allenamento basato sulle tue decisioni e sugli errori ricorrenti.",
  },
  {
    q: "Devo sapere già quale sia il problema?",
    a: "No. Puoi partire da una situazione confusa, da alcuni dati o da una decisione che continui a rimandare. Il coach ti aiuta a definire il problema attraverso domande successive.",
  },
  {
    q: "Posso caricare documenti della mia azienda?",
    a: "Sì. Puoi aggiungere i materiali utili a comprendere il business e usarli come contesto durante le sessioni.",
  },
  {
    q: "Il coach ricorda le conversazioni precedenti?",
    a: "Sì. Le sessioni, i temi aperti e i pattern ricorrenti possono essere utilizzati per rendere più pertinenti le conversazioni successive.",
  },
  {
    q: "Quale coach devo scegliere?",
    a: "Scegli l'Executive Coach per strategia, organizzazione e gestione aziendale, l'Agency Coach per la gestione di clienti, team e marginalità della tua agenzia, lo Startup Coach per prodotto, capitale, fundraising e costruzione dell'azienda.",
  },
  {
    q: "Quanto costa?",
    a: "Puoi iniziare gratuitamente, senza inserire una carta di credito. L'account gratuito prevede un limite giornaliero di messaggi.",
  },
  {
    q: "Può sostituire un consulente?",
    a: "Business Buddy aiuta a strutturare il ragionamento, verificare le ipotesi e preparare meglio una decisione. Le decisioni legali, fiscali, finanziarie o regolamentate devono essere verificate con professionisti qualificati.",
  },
];

const COACH_ICONS = { executive: Briefcase, agency: Megaphone, startup: Rocket };
const COACH_ARTICLE: Record<string, string> = {
  executive: "l'",
  agency: "l'",
  startup: "lo ",
};

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

      {/* ================= HERO ================= */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 text-center sm:pt-20">
        <p className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Target className="size-3.5 text-accent" />
          Tre coach specializzati. Una decisione più solida.
        </p>
        <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold tracking-[-0.02em] text-foreground sm:text-5xl md:text-[56px] md:leading-[1.05]">
          Porta un problema reale. Esci con una direzione chiara.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Business Buddy ti dà accesso a tre coach specializzati in
          strategia aziendale, agenzie e startup.
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Racconta una situazione complessa, aggiungi il contesto della tua
          azienda e confronta il tuo ragionamento con domande, alternative,
          rischi e conseguenze che potresti non aver considerato.
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Quando vuoi migliorare, il coach crea esercizi costruiti sui tuoi
          punti deboli e sulle decisioni che affronti ogni giorno.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="accent">
            <Link href="/register">
              Porta il tuo primo problema
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#come-funziona">Scopri come funziona</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Gratis, senza carta di credito. Prima sessione in meno di un
          minuto.
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <LoopDivider />
      </div>

      {/* ================= QUANDO USARLO ================= */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Usalo quando devi decidere e quando vuoi migliorare
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Card className="p-6">
            <CardContent className="flex h-full flex-col gap-4 p-0">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
                <Target className="size-6" />
              </span>
              <div className="space-y-2">
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  Risolvi un problema reale
                </h3>
                <p className="text-sm text-muted-foreground">
                  Descrivi la situazione, gli obiettivi, i vincoli e i dati
                  disponibili. Il coach ti aiuta a mettere a fuoco il vero
                  problema, individua le informazioni mancanti, analizza le
                  opzioni e costruisce un piano d&apos;azione coerente con
                  il tuo contesto.
                </p>
                <p className="text-sm text-muted-foreground">
                  Puoi usarlo prima di una decisione importante, durante una
                  fase di blocco o per verificare un piano che hai già
                  preparato.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="flex h-full flex-col gap-4 p-0">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
                <Brain className="size-6" />
              </span>
              <div className="space-y-2">
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  Allena le tue capacità imprenditoriali
                </h3>
                <p className="text-sm text-muted-foreground">
                  Il coach crea esercizi, simulazioni e casi costruiti sulla
                  tua azienda e sulle competenze che vuoi sviluppare.
                </p>
                <p className="text-sm text-muted-foreground">
                  Prendi una decisione, motivala e ricevi un&apos;analisi
                  dettagliata del tuo ragionamento. Gli errori ricorrenti
                  restano in memoria e diventano il punto di partenza delle
                  sessioni successive.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <LoopDivider />
      </div>

      {/* ================= COME FUNZIONA ================= */}
      <section id="come-funziona" className="mx-auto max-w-6xl scroll-mt-8 px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Come funziona
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              n: "01",
              title: "Scegli il coach",
              body: "Seleziona il campo più vicino al problema che vuoi affrontare: strategia aziendale, agenzia o startup.",
            },
            {
              n: "02",
              title: "Aggiungi il tuo contesto",
              body: "Descrivi l'azienda, il mercato, gli obiettivi e i vincoli. Puoi caricare documenti e materiali utili alla sessione.",
            },
            {
              n: "03",
              title: "Affronta il problema",
              body: "Il coach ti fa le domande necessarie, mette alla prova le tue ipotesi e ti aiuta a confrontare le alternative disponibili.",
            },
            {
              n: "04",
              title: "Trasforma l'analisi in azione",
              body: "Chiudi la sessione con priorità, rischi, prossimi passi e temi ancora da approfondire.",
            },
          ].map((step) => (
            <Card key={step.n} className="p-6">
              <CardContent className="flex h-full flex-col gap-2 p-0">
                <span className="font-mono text-xs font-semibold tracking-wide text-accent">
                  {step.n}
                </span>
                <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Business Buddy conserva il contesto e riparte da dove avevi
          lasciato.
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <LoopDivider />
      </div>

      {/* ================= TRE COACH ================= */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Tre coach per tre tipi di decisione
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {COACH_META_LIST.map((coach) => {
            const Icon = COACH_ICONS[coach.id as keyof typeof COACH_ICONS];
            const details = COACH_DETAILS[coach.id];
            return (
              <Card key={coach.id} className="flex flex-col p-6">
                <CardContent className="flex h-full flex-col gap-4 p-0">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
                    <Icon className="size-6" />
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                      {coach.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {details.description}
                    </p>
                  </div>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Usalo per lavorare su
                  </p>
                  <ul className="flex-1 space-y-1.5 text-sm text-foreground/80">
                    {details.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-accent" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="mt-auto w-full">
                    <Link href={`/register?coach=${coach.id}`}>
                      Parla con {COACH_ARTICLE[coach.id] ?? "il "}
                      {coach.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <LoopDivider />
      </div>

      {/* ================= DOMANDA GIÀ IN TESTA ================= */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Parti dalla domanda che hai già in testa
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {QUESTIONS.map((q) => (
            <Card key={q} className="p-5">
              <CardContent className="p-0">
                <p className="text-sm text-foreground/80 italic">
                  &ldquo;{q}&rdquo;
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted-foreground">
          Il coach parte dalla tua situazione, raccoglie le informazioni
          necessarie e costruisce la sessione intorno al problema.
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <LoopDivider />
      </div>

      {/* ================= CONTESTO / KB ================= */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Una risposta utile richiede il contesto giusto
            </h2>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Business Buddy può conoscere la tua azienda, i suoi numeri, i
              prodotti, il mercato e le decisioni già prese. Questo gli
              permette di:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
              {CONTEXT_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Puoi creare contesti diversi per aziende, progetti o aree di
              lavoro differenti.
            </p>
          </div>
          <Card className="p-8">
            <CardContent className="flex flex-col items-center gap-3 p-0 py-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-accent">
                <FileText className="size-6" />
              </span>
              <p className="text-sm font-medium text-foreground">
                Carica documenti, il coach li usa come esempio
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Contesto e materiali della tua azienda entrano direttamente
                negli esercizi e nelle consulenze, invece di scenari
                generici.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <LoopDivider />
      </div>

      {/* ================= COSA RICEVI ================= */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Cosa ricevi da una sessione
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            A seconda del problema, il coach può aiutarti a ottenere:
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RECEIVE_ITEMS.map((item) => (
            <Card key={item} className="p-4">
              <CardContent className="flex items-start gap-2 p-0">
                <Check className="mt-0.5 size-3.5 shrink-0 text-accent" />
                <p className="text-sm text-foreground/80">{item}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted-foreground">
          Il valore della sessione cresce con la qualità e la completezza
          del contesto che fornisci.
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <LoopDivider />
      </div>

      {/* ================= MEMORIA ================= */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Card className="order-2 p-8 lg:order-1">
            <CardContent className="flex flex-col items-center gap-3 p-0 py-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-accent">
                <History className="size-6" />
              </span>
              <p className="text-sm font-medium text-foreground">
                La cronologia diventa una mappa del tuo modo di decidere
              </p>
            </CardContent>
          </Card>
          <div className="order-1 lg:order-2">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Ogni sessione migliora anche la successiva
            </h2>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Il coach ricorda le conversazioni precedenti, i temi rimasti
              aperti e i pattern che tendi a ripetere.
            </p>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Se continui a sottovalutare lo stesso rischio, evitare lo
              stesso dato o prendere decisioni con lo stesso bias, Business
              Buddy lo rende visibile e costruisce esercizi mirati.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <LoopDivider />
      </div>

      {/* ================= FAQ ================= */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Domande frequenti
          </h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <Card key={item.q} className="overflow-hidden p-0">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 text-sm font-medium text-foreground marker:content-none">
                  {item.q}
                  <Plus className="size-4 shrink-0 text-muted-foreground transition-transform ease-[var(--ease-snap)] duration-150 group-open:rotate-45" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground">
                  {item.a}
                </div>
              </details>
            </Card>
          ))}
        </div>
      </section>

      {/* ================= ACTION ================= */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Card className="overflow-hidden bg-primary p-10 text-center text-primary-foreground sm:p-14">
          <CardContent className="space-y-5 p-0">
            <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary-foreground/10">
              <ListChecks className="size-5" />
            </span>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Quale decisione devi prendere oggi?
            </h2>
            <p className="mx-auto max-w-xl text-sm text-primary-foreground/80 sm:text-base">
              Porta il problema, aggiungi il contesto e metti alla prova il
              tuo ragionamento con il coach più adatto.
            </p>
            <Button asChild size="lg" variant="accent">
              <Link href="/register">
                Inizia la prima sessione
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="text-xs text-primary-foreground/60">
              Gratis, con un limite giornaliero di messaggi. Nessuna carta
              richiesta.
            </p>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        Business Buddy
      </footer>
    </div>
  );
}
