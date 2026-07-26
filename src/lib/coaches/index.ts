import { WRITING_QUALITY_GATE } from "./shared/writing-quality-gate";
import {
  SYSTEM_PROMPT as EXECUTIVE_SYSTEM_PROMPT,
  WELCOME_MESSAGE as EXECUTIVE_WELCOME_MESSAGE,
} from "./executive/persona";
import { ADVISORY_BOARD as EXECUTIVE_ADVISORY_BOARD } from "./executive/advisory-board";
import { RUBRIC as EXECUTIVE_RUBRIC } from "./executive/rubric";
import {
  SYSTEM_PROMPT as AGENCY_SYSTEM_PROMPT,
  WELCOME_MESSAGE as AGENCY_WELCOME_MESSAGE,
} from "./agency/persona";
import { ADVISORY_BOARD as AGENCY_ADVISORY_BOARD } from "./agency/advisory-board";
import { RUBRIC as AGENCY_RUBRIC } from "./agency/rubric";
import {
  SYSTEM_PROMPT as STARTUP_SYSTEM_PROMPT,
  WELCOME_MESSAGE as STARTUP_WELCOME_MESSAGE,
} from "./startup/persona";
import { ADVISORY_BOARD as STARTUP_ADVISORY_BOARD } from "./startup/advisory-board";
import { RUBRIC as STARTUP_RUBRIC } from "./startup/rubric";
import type { Advisor } from "./executive/advisory-board";
import type { RubricDimension } from "./executive/rubric";

export type CoachId = "executive" | "agency" | "startup";

export const COACH_IDS: CoachId[] = ["executive", "agency", "startup"];

export interface Coach {
  id: CoachId;
  systemPrompt: string;
  advisoryBoard: Advisor[];
  rubric: RubricDimension[];
  welcomeMessage: string;
}

const COACHES: Record<
  CoachId,
  {
    systemPrompt: string;
    advisoryBoard: Advisor[];
    rubric: RubricDimension[];
    welcomeMessage: string;
  }
> = {
  executive: {
    systemPrompt: EXECUTIVE_SYSTEM_PROMPT,
    advisoryBoard: EXECUTIVE_ADVISORY_BOARD,
    rubric: EXECUTIVE_RUBRIC,
    welcomeMessage: EXECUTIVE_WELCOME_MESSAGE,
  },
  agency: {
    systemPrompt: AGENCY_SYSTEM_PROMPT,
    advisoryBoard: AGENCY_ADVISORY_BOARD,
    rubric: AGENCY_RUBRIC,
    welcomeMessage: AGENCY_WELCOME_MESSAGE,
  },
  startup: {
    systemPrompt: STARTUP_SYSTEM_PROMPT,
    advisoryBoard: STARTUP_ADVISORY_BOARD,
    rubric: STARTUP_RUBRIC,
    welcomeMessage: STARTUP_WELCOME_MESSAGE,
  },
};

/**
 * Returns a coach's assembled content: system prompt (persona + the shared
 * writing-quality gate appended), advisory board roster, evaluation rubric,
 * and welcome message. See specs/coaching-platform/decisions.md.
 */
export function getCoach(coachId: CoachId): Coach {
  const coach = COACHES[coachId];
  return {
    id: coachId,
    systemPrompt: `${coach.systemPrompt}\n\n---\n\n${WRITING_QUALITY_GATE}`,
    advisoryBoard: coach.advisoryBoard,
    rubric: coach.rubric,
    welcomeMessage: coach.welcomeMessage,
  };
}

export function isCoachId(value: string): value is CoachId {
  return (COACH_IDS as string[]).includes(value);
}
