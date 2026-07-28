"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Briefcase,
  LineChart,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "bb-onboarding-seen";
const REOPEN_EVENT = "bb:reopen-onboarding";

/** Same one-time-read-on-mount pattern as `useCoachmark`, plus a custom
 * event listener so the "Guida" sidebar link can force a reopen even when
 * already on /dashboard (a plain navigation wouldn't remount this). */
function useOnboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from an external store (localStorage), not a cascading render loop
        setOpen(true);
      }
    } catch {
      // localStorage unavailable — just skip onboarding.
    }

    function handleReopen() {
      setOpen(true);
    }
    window.addEventListener(REOPEN_EVENT, handleReopen);
    return () => window.removeEventListener(REOPEN_EVENT, handleReopen);
  }, []);

  function markSeen() {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  return { open, markSeen };
}

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: Users,
    title: "Benvenuto",
    body: "Ci sono tre coach — Executive, Agency, Startup — ognuno con due modalità: Allenamento (casi costruiti per esercitarti) e Coaching (il tuo problema reale).",
  },
  {
    icon: Briefcase,
    title: "Il tuo business",
    body: "Puoi descrivere la tua azienda e caricare documenti di riferimento nelle impostazioni. Il coach li usa come esempio reale invece di casi generici.",
  },
  {
    icon: Users,
    title: "Advisory Board",
    body: "Durante una sessione puoi convocare più esperti, inclusa una tua voce personale, per confrontare la tua idea con pareri diversi.",
  },
  {
    icon: LineChart,
    title: "Progressi",
    body: "Ogni sessione valutata aggiunge punteggi, temi aperti e lezioni apprese che si accumulano nel tempo, visibili nella pagina Progress di ogni coach.",
  },
];

export function OnboardingModal() {
  const { open, markSeen } = useOnboarding();
  const [step, setStep] = useState(0);

  function handleOpenChange(next: boolean) {
    if (!next) markSeen();
  }

  function next() {
    if (step === STEPS.length - 1) {
      markSeen();
      setStep(0);
      return;
    }
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function skip() {
    markSeen();
    setStep(0);
  }

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
            <Icon className="size-5" />
          </span>
          <DialogTitle className="font-display text-lg font-semibold tracking-tight">
            {current.title}
          </DialogTitle>
          <DialogDescription>{current.body}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s.title}
              className={cn(
                "size-1.5 rounded-full transition-colors ease-[var(--ease-snap)] duration-150",
                i === step ? "bg-accent" : "bg-secondary"
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={skip}
            className="text-xs text-muted-foreground underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded-xs"
          >
            Salta
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button type="button" variant="outline" size="sm" onClick={back}>
                Indietro
              </Button>
            )}
            <Button type="button" variant="accent" size="sm" onClick={next}>
              {step === STEPS.length - 1 ? "Inizia" : "Avanti"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
