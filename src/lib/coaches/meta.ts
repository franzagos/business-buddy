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
    tagline: "Wartime CEO + crescita",
    description:
      "30 anni nelle trincee di PMI e scale-up. Casi reali, niente teoria da manuale, per decisioni da wartime CEO e per la crescita in tempo di pace.",
    icon: Briefcase,
  },
  agency: {
    id: "agency",
    name: "Agency Coach",
    tagline: "25 anni dentro le agenzie",
    description:
      "Dal primo account alla direzione di agenzia. Utilization, scope creep, cliente-ancora, churn del team: il mestiere visto da dentro.",
    icon: Megaphone,
  },
  startup: {
    id: "startup",
    name: "Startup Coach",
    tagline: "Dal foglio bianco all'exit",
    description:
      "Tre term sheet negoziati, un board da allineare, un cap table sporcato round dopo round. Runway, investitori, valutazione, costi opportunità.",
    icon: Rocket,
  },
};

export const COACH_META_LIST: CoachMeta[] = [
  COACH_META.executive,
  COACH_META.agency,
  COACH_META.startup,
];
