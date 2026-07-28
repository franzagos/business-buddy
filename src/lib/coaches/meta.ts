import { Briefcase, Megaphone, Rocket } from "lucide-react";
import type { CoachId } from "./index";

/**
 * UI-facing metadata for each coach — display name, short persona summary,
 * and icon tile. Not used in prompts (see `getCoach` for that); this is
 * purely for rendering the coach picker, sidebar, and landing pages.
 */
export interface CoachMeta {
  id: CoachId;
  name: string;
  tagline: string;
  description: string;
  icon: typeof Briefcase;
}

export const COACH_META: Record<CoachId, CoachMeta> = {
  executive: {
    id: "executive",
    name: "Executive Coach",
    tagline: "Crisi, cassa, persone",
    description:
      "Ti allena con casi estremi da wartime CEO e da tempo di pace, poi mette il tuo piano davanti a un Advisory Board di pareri diversi per trovare i punti ciechi prima che te li trovi la realtà.",
    icon: Briefcase,
  },
  agency: {
    id: "agency",
    name: "Agency Coach",
    tagline: "Clienti, team, margini",
    description:
      "Utilization, scope creep, cliente-ancora, churn del team: ti allena su casi concreti e confronta il tuo piano con più prospettive prima che tu lo metta in pratica.",
    icon: Megaphone,
  },
  startup: {
    id: "startup",
    name: "Startup Coach",
    tagline: "Runway, prodotto, investitori",
    description:
      "Runway, investitori, cap table, prime assunzioni: ti allena a decidere sotto pressione e ti mette a confronto con pareri diversi prima di ogni mossa che conta.",
    icon: Rocket,
  },
};

export const COACH_META_LIST: CoachMeta[] = [
  COACH_META.executive,
  COACH_META.agency,
  COACH_META.startup,
];
