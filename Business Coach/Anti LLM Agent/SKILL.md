---
name: rileva-tracce-ai
description: >-
  Audit linguistico avanzato per scovare tracce di scrittura LLM in un testo italiano (lessico da
  manuale, sintassi uniforme, struttura prevedibile, retorica impersonale) e riscriverlo in modo
  più umano e credibile. Applica un processo CoVe in 5 passi per verificare ogni indizio con
  prove testuali, evitando sia falsi positivi sia falsi negativi. Supporta una modalità generica
  (default) e una modalità strict opzionale "voce Francesco" a tolleranza zero per chi vuole
  matchare il proprio stile personale. USA SEMPRE quando l'utente chiede se un testo sembra
  scritto da un'AI/ChatGPT, di "umanizzare", "smarcare", "ripulire" un testo; quando serve una
  revisione di qualità (QA/CoVe) sull'output di un'altra skill o agente prima di consegnarlo (es.
  dopo ghostwriter, newsletter, email, post, articoli, descrizioni prodotto); o quando si
  menziona "tracce LLM", "AI detector", "suona artificiale/robotico", "troppo ChatGPT", "voce
  piatta". Attivala anche proattivamente come ultimo controllo qualità prima di consegnare
  qualsiasi testo lungo scritto o riscritto da Claude stesso.
---

# Rileva Tracce AI — Audit anti-LLM e umanizzazione del testo

## Cosa fa questa skill

Analizza un testo italiano per trovare ogni traccia stilistica che tradisce un'origine LLM (ChatGPT, Claude o altri), poi lo riscrive in una versione più umana mantenendo intatti significato, fatti e intento dell'autore. Non è un "AI detector" statistico (nessuno strumento di questo tipo è davvero affidabile, e dichiararsi tale sarebbe fuorviante): è un revisore linguistico che applica gli stessi criteri che userebbe un editor umano esperto, ma in modo sistematico, esaustivo e verificato — non a sensazione.

Il punto critico è proprio questo: a sensazione si trovano sempre "troppi" indizi (tutto comincia a sembrare sospetto) oppure se ne trovano "troppo pochi" (ci si abitua al testo dopo la prima lettura). Per questo il cuore della skill è un processo di **verifica a catena (CoVe)**: ogni indizio candidato viene messo alla prova con una domanda specifica e una citazione testuale, prima di essere incluso nel referto finale.

## Due modalità: generica vs "voce Francesco"

- **Modalità generica (default)**: si applica a qualunque testo italiano, di chiunque. Tratta ogni indizio con la gradazione forte/medio/debole descritta in `references/pattern-anti-llm.md` — nessun costrutto è vietato in assoluto, conta la frequenza e il contesto. Usa questa modalità a meno che l'utente non chieda esplicitamente l'altra.
- **Modalità strict "voce Francesco"**: attivala solo se l'utente lo chiede esplicitamente (es. "riscrivilo nel mio stile", "come lo direi io", "per LinkedIn nel mio tono", "voce Francesco"). In questa modalità una lista di costrutti (vedi fondo di `references/pattern-anti-llm.md`) passa a tolleranza zero: anche una sola occorrenza va eliminata, non solo quelle ripetute. Se non sei sicuro di quale modalità usare, chiedilo prima di partire — non dare per scontata la modalità strict solo perché l'utente è Francesco.

## Quando e come si attiva nel sistema

Questa skill è pensata per essere il **gate di qualità finale** di qualunque pipeline che produce testo:

- Se viene invocata su un testo prodotto da un'altra skill di scrittura (ghostwriter, newsletter, coach, ecc.), trattalo come l'output di un "altro agente" da auditare con occhio critico e indipendente — non difenderlo solo perché proviene da una fonte interna.
- Se l'utente fornisce un testo direttamente (incollato, allegato, o generato da Claude poco prima nella stessa conversazione), applica comunque l'intero processo: non saltare passaggi perché "il testo sembra già buono".
- Se non è chiaro cosa l'utente vuole come output (solo il referto? solo il testo riscritto? entrambi? modalità generica o voce Francesco?), chiedilo prima di partire — ma se l'utente ha solo incollato un testo senza istruzioni, il default è: modalità generica, audit completo E riscrittura.

## Il processo in 5 fasi (CoVe applicato alla scrittura)

Non saltare fasi e non comprimerle. Il valore di questo processo sta proprio nel separare la generazione di ipotesi dalla loro verifica — è il motivo per cui produce un referto affidabile invece di una lista di impressioni.

### Fase 1 — Risposta di base (baseline)
Leggi il testo per intero e genera una prima lista grezza di tutto ciò che "suona da LLM": parole, frasi, strutture, ritmo, scelte retoriche. Sii generoso in questa fase, anche troppo: è normale e voluto che includa falsi positivi, li scarterai dopo. Usa `references/pattern-anti-llm.md` come checklist per non perdere categorie intere (lessico, sintassi, struttura, retorica, punteggiatura). Se è attiva la modalità "voce Francesco", scorri anche la sezione finale del reference dedicata a quel profilo.

### Fase 2 — Identifica le assunzioni non verificate
Per ogni voce della lista grezza, chiediti: "sto segnalando questo solo perché è nella mia checklist, o perché è davvero anomalo *in questo testo specifico*?". Le parole spia non sono spie in assoluto: "tuttavia" o "inoltre" usati una volta in un testo di 800 parole sono italiano normale, non un indizio. Segna esplicitamente quali voci sono assunzioni deboli che vanno verificate con più cura. (In modalità "voce Francesco", gli item della lista a tolleranza zero saltano questa fase di pesatura: ogni occorrenza è già di per sé un indizio da correggere, ma documentala comunque con citazione in Fase 4.)

### Fase 3 — Genera domande di verifica specifiche
Per ogni candidato sospetto, formula una domanda puntuale e verificabile leggendo solo il testo, non basata su intuizione. Le soglie numeriche qui sotto ("2 volte ogni 500 parole", "ripetuto 3 volte") sono punti di riferimento per testi di media lunghezza (300+ parole), non standard rigidi: su un testo breve (email, post, didascalia, paragrafo isolato) scala il giudizio proporzionalmente — 2 occorrenze in 100 parole pesano quanto 6-8 in 500, e la concentrazione di più indizi diversi nello stesso paragrafo breve è di per sé un segnale forte, anche se nessuna singola categoria raggiunge la soglia "lunga". Esempi di domande:
- "Questo connettivo ('inoltre', 'pertanto'...) compare più di 2 volte ogni 500 parole?"
- "Questa struttura a triade ('X, Y e Z' / aggettivi in tre') è isolata o si ripete in almeno 3 punti del testo?"
- "I paragrafi hanno tutti la stessa lunghezza (stesso numero di frasi, frasi di lunghezza simile) per più del 70% del testo?"
- "Questa affermazione è presentata come verità assoluta senza sfumature, eccezioni o dubbi, in un contesto dove un umano esperto ne avrebbe naturalmente?"
- "C'è almeno un dettaglio concreto e non genericizzabile (un nome, una data, un numero specifico, un aneddoto, un'opinione rischiosa) in tutto il testo, o ogni affermazione potrebbe essere stata scritta su qualsiasi argomento simile?"
- "Questo elenco puntato con grassetto a inizio riga era necessario per la chiarezza, o un umano lo avrebbe scritto in prosa?"
- (Solo modalità "voce Francesco") "Questo costrutto a tolleranza zero ('Se X, allora Y', 'Non è X, è Y', frase spezzata, punto e virgola) compare almeno una volta nel testo?"

### Fase 4 — Rispondi a ogni domanda indipendentemente
Per ciascuna domanda, rispondi citando la porzione esatta di testo (tra virgolette) che fa da prova, e indica un giudizio di forza dell'indizio: **forte** (quasi impossibile in scrittura umana spontanea), **medio** (sospetto ma non decisivo da solo), **debole** (legittimo isolatamente, conta solo se sistematico). Scarta dalla lista finale tutto ciò che in questa fase risulta un falso positivo: non includerlo nel referto solo per mostrare completezza.

### Fase 5 — Verdetto finale e riscrittura
Solo dopo le fasi 1–4 produci il referto finale (vedi formato sotto) e, se richiesto, la riscrittura umanizzata. Il verdetto deve riflettere le prove verificate, non la lista grezza di Fase 1.

## Categorie di analisi (mappa, non checklist duplicata)

Le 6 macro-categorie sono: (1) lessico da manuale — connettivi-riempitivo, verbi-passepartout, calchi dall'inglese; (2) sintassi e ritmo — uniformità di lunghezza, costruzioni "non solo X ma anche Y", triadi sistematiche; (3) struttura e impaginazione — elenchi puntati non necessari, apertura/chiusura standard; (4) retorica e contenuto — assertività piatta, bilanciamento artificiale, assenza di concretezza; (5) punteggiatura e tipografia — trattino lungo seriale, due punti sistematici, Title Case; (6) coerenza statistica come euristica qualitativa — non hai un calcolo reale di perplexity/burstiness, ma un vocabolario sempre "il più prevedibile possibile" unito a zero variazione ritmica è un segnale composito forte anche quando nessun singolo indizio isolato lo è.

Per ciascuna, con tutte le voci, esempi, le soglie di forza e i falsi positivi noti, leggi `references/pattern-anti-llm.md` durante la Fase 1 — non riassumerlo di nuovo a memoria, usalo come checklist attiva mentre scorri il testo. Il file include anche, in fondo, il profilo strict opzionale "voce Francesco" con la sua lista a tolleranza zero ed esempi prima/dopo.

## Formato del referto finale

Usa SEMPRE questa struttura quando presenti l'audit:

```
## Verdetto complessivo
[Probabilmente umano / Misto, con tracce localizzate / Probabilmente generato o pesantemente rivisto da LLM / Quasi certamente LLM]
Modalità applicata: [generica / voce Francesco]
Motivazione in 2-3 frasi basata sulle prove di Fase 4, non sulla lista grezza.

## Tracce confermate (con prove)
Per ciascuna, in prosa, non in tabella se sono poche: categoria, citazione testuale tra virgolette, perché è un indizio (forte/medio/debole), e quante volte ricorre il pattern nel testo.

## Falsi positivi scartati (facoltativo, solo se utile)
Cose che sembravano sospette ma la Fase 4 ha escluso — utile per mostrare il rigore del processo, soprattutto se l'utente potrebbe dubitare del verdetto.

## Testo riscritto
La versione umanizzata, completa.

## Cosa non ho potuto migliorare da solo
Se nel testo originale mancano dettagli concreti (aneddoti, numeri, nomi, opinioni specifiche) che servirebbero a renderlo davvero credibile, elencali qui invece di inventarli.
```

Se l'utente ha chiesto solo l'audit (senza riscrittura) o solo la riscrittura (senza referto), fornisci solo la parte richiesta — ma fai comunque tutte le 5 fasi internamente, perché senza Fase 1-4 la riscrittura sarebbe alla cieca.

## Come riscrivere (Fase 5, parte due)

L'obiettivo non è "rendere il testo brutto per sembrare umano": un essere umano competente scrive bene. L'obiettivo è rompere la prevedibilità e iniettare specificità, senza alterare i fatti.

- **Varia il ritmo davvero**: alterna frasi brevi e dirette a frasi più lunghe e articolate. Una frase di 4 parole dopo tre frasi lunghe è un segnale di scrittura umana, non un difetto.
- **Rompi le triadi**: se trovi liste sistematiche di tre, cambiale in due o quattro elementi, o trasformale in prosa.
- **Elimina i connettivi-riempitivo**: spesso la frase funziona meglio senza "inoltre"/"tuttavia" iniziale — usa un punto, una virgola, o nessuna congiunzione.
- **Sostituisci il lessico generico con scelte concrete e contestuali**: non "ottimizzare il processo" ma cosa esattamente cambia, con che verbo specifico.
- **Rompi la struttura standard**: non aprire sempre con una definizione, non chiudere sempre con un riassunto-più-invito-all'azione. Un finale che si interrompe su un dettaglio specifico è più umano di una sintesi pulita.
- **Riduci gli elenchi puntati dove la prosa è più naturale** — non eliminarli sempre, ma chiediti se servono davvero o se sono lì per abitudine.
- **NON inventare fatti, numeri, aneddoti o citazioni che non c'erano**: se il testo è debole perché generico, la causa vera è la mancanza di contenuto concreto, non solo la forma. Segnala questo gap nella sezione finale del referto invece di riempirlo con dettagli inventati — inventare informazioni per "sembrare umani" è un problema più grave del problema che si voleva risolvere.
- **Mantieni intatti claim, dati, struttura logica e intento dell'autore.** Stai cambiando la voce, non il contenuto.
- **Non esagerare nella direzione opposta**: refusi finti, slang forzato o imperfezioni artificiali sono un altro tipo di tic riconoscibile. L'obiettivo è naturalezza, non sciatteria performativa.
- **Se è attiva la modalità "voce Francesco"**: applica in più la tolleranza zero sui costrutti elencati in fondo a `references/pattern-anti-llm.md` (niente "Se X, allora Y", niente frasi spezzate, niente punto e virgola, niente congiunzioni-tic in apertura) e privilegia i tratti positivi descritti lì (frasi brevi, aneddoti con numeri se presenti nel testo originale, liste "1) 2) 3)", chiusura con domanda diretta al lettore).

## Limiti onesti da comunicare se l'utente lo chiede

Nessun metodo (incluso questo) distingue con certezza un testo umano da uno generato da LLM: i modelli migliorano, e scrittori umani stanchi o poco esperti producono a volte testo altrettanto piatto. Questa skill massimizza l'affidabilità rispetto a un giudizio impressionistico grazie al processo di verifica, ma il verdetto resta un'inferenza linguistica qualitativa, non una prova. Comunicalo se l'utente tratta il verdetto come definitivo. La modalità "voce Francesco" è ancora più stringente per costruzione (tolleranza zero su una lista specifica) e va comunicata come una scelta stilistica deliberata, non come "regola universale di scrittura umana".
