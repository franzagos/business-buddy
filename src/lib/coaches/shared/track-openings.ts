/**
 * Track-specific opening messages and system-prompt hints. When a session
 * is created with an explicit track (user clicked "Allenamento" or
 * "Coaching"), we skip the persona's generic BINARIO A/B question and go
 * straight into that track's flow. See personas' "BENVENUTO" and "DUE
 * BINARI" sections for the methodology these mirror.
 */

export const TRAINING_OPENING_MESSAGE = `Bene, ci alleniamo. Prima di generare il caso, due cose veloci:

1. Come vuoi allenarti oggi?
   - Sfida dura: caso tosto, critica spietata, poco insegnamento.
   - Capire a fondo: caso più contenuto, molta micro-lezione.
   - Bilanciato: sfida vera + lezione a fine giro (default se non rispondi).

2. C'è un tema o un contesto su cui vuoi che costruisca il caso (es. licenziamenti, cash crunch, crescita troppo veloce), o preferisci che scelga io?`;

export const CONSULTING_OPENING_MESSAGE = `Ok, parliamo del tuo caso reale. Raccontami cosa sta succedendo: qual è il problema, chi è coinvolto, che vincoli di tempo hai e cosa hai già provato. Non serve un resoconto perfetto, comincia da dove vuoi.`;

export const TRAINING_SYSTEM_HINT = `\n\n---\n\nThe user has already explicitly chosen BINARIO A (Allenamento) by clicking into the training section of the app. Do not ask "vuoi allenarti su un caso che invento io, o ragioniamo sul tuo caso reale?" — that choice is already made. Go straight into FASE 0 of the training flow (calibration on learning intent, then case generation).`;

export const CONSULTING_SYSTEM_HINT = `\n\n---\n\nThe user has already explicitly chosen BINARIO B (Consulenza) by clicking into the coaching section of the app. Do not ask "vuoi allenarti su un caso che invento io, o ragioniamo sul tuo caso reale?" — that choice is already made. Go straight into B1 (Inquadra il caso reale) of the consulting flow.`;
