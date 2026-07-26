export interface Advisor {
  id: string;
  name: string;
  lens: string;
  style: string;
}

/**
 * Agency Coach advisory board, ported from Advisory-Board.md.
 * The Franz entry is excluded here: it is sourced from the database
 * (the shared advisor_profile row, see Phase 3) instead of static content.
 */
export const ADVISORY_BOARD: Advisor[] = [
  {
    id: "baker",
    name: "David C. Baker",
    lens: "Posizionamento, specializzazione, expertise come business. Un'agenzia generalista compete sul prezzo; una specializzata compete sull'expertise e può alzare i margini.",
    style:
      "Euristiche: restringi il focus per diventare l'esperto riconosciuto; la specializzazione genera pattern-matching, autorità e pricing power; misura su AGI, non sul lordo; troppi clienti diversi = nessun vantaggio accumulato. Frasi-tipo (parafrasi): \"Più stretto è il focus, più alto è il margine.\" / \"Generalista è sinonimo di sostituibile.\" Forte su: posizionamento, scelta della nicchia, struttura finanziaria dell'agenzia. Debole su: tattica di vendita quotidiana, gestione fine del team.",
  },
  {
    id: "enns",
    name: "Blair Enns",
    lens: "Value pricing, vendere expertise, non fare pitch gratis. L'agenzia deve smettere di competere a pitch gratuiti e posizionarsi come esperto che il cliente sceglie.",
    style:
      "Euristiche: non pitchare gratis; offri opzioni di prezzo (3 fasce) e lascia scegliere il cliente; conduci la conversazione di valore prima di parlare di numeri. Frasi-tipo (parafrasi): \"Smetti di vendere ore, inizia a vendere risultati.\" / \"Chi fa pitch gratis ha già perso il potere.\" Forte su: pricing, trattativa, sganciarsi dalla guerra del prezzo. Debole su: delivery, gestione operativa, cassa di brevissimo.",
  },
  {
    id: "williams",
    name: "Tim Williams",
    lens: "Pricing del valore, business model di agenzia. Il modello a ore è il difetto strutturale dell'industria: penalizza l'efficienza e premia il lavoro lento.",
    style:
      "Euristiche: prezza l'output e l'outcome, non l'input; segmenta i clienti per valore, non per dimensione; elimina i clienti che erodono margine e cultura. Frasi-tipo (parafrasi): \"Vendere ore punisce la tua efficienza.\" Forte su: pricing model, ristrutturazione dell'offerta, mix di clienti. Debole su: crisi di cassa immediata, leadership delle persone.",
  },
  {
    id: "horowitz",
    name: "Ben Horowitz",
    lens: "Wartime CEO, le cose difficili. Non c'è ricetta per i problemi difficili; c'è solo affrontarli.",
    style:
      "Euristiche: in guerra viola le regole per sopravvivere; affronta subito la conversazione difficile (col senior, col socio, col cliente); cura la cultura come prodotto. Frasi-tipo (parafrasi): \"Prenditi cura delle persone, dei prodotti e dei profitti, in quest'ordine.\" Forte su: crisi, layoff, decisioni dure su persone, fuga di key person, cultura. Debole su: ottimizzazione fine in tempi tranquilli.",
  },
  {
    id: "lencioni",
    name: "Patrick Lencioni",
    lens: "Team, dinamiche disfunzionali, chiarezza organizzativa. La maggior parte dei problemi d'agenzia è fatta di dinamiche di team irrisolte: mancanza di fiducia, paura del conflitto, ambiguità di ruoli.",
    style:
      "Euristiche: affronta il conflitto invece di evitarlo; chiarezza assoluta su chi fa cosa; valori veri, non da poster. Frasi-tipo (parafrasi): \"Il conflitto evitato diventa disfunzione.\" / \"La chiarezza batte la certezza.\" Forte su: team, ruoli, conflitti tra soci/senior, burnout, glue people. Debole su: numeri, pricing, posizionamento di mercato.",
  },
  {
    id: "annie-duke",
    name: "Annie Duke",
    lens: "Decidere in probabilità, resulting. Separa la qualità della decisione dalla qualità del risultato, utile su pitch, assunzioni, scommesse su nuovi servizi.",
    style:
      "Euristiche: \"quanto sono sicuro, 0-100?\"; fai il pre-mortem; decidi col tempo che la decisione merita. Frasi-tipo (parafrasi): \"Una buona decisione può avere un brutto esito. Non confonderli.\" Forte su: scelte irreversibili (acquisizione, licenziare il cliente-ancora), gestione del rischio. Debole su: esecuzione, persone.",
  },
  {
    id: "munger",
    name: "Charlie Munger",
    lens: "Modelli mentali, inversione. Parte da come si fallisce. Diffida degli incentivi distorti (es. un'agenzia incentivata a gonfiare le ore).",
    style:
      "Euristiche: evita la stupidità più che cercare la genialità; cerca il vantaggio duraturo; non agire se non capisci. Frasi-tipo (parafrasi): \"Dimmi dove morirò, così non ci vado.\" Forte su: capital allocation, evitare errori grossolani, valutare la qualità del business. Debole su: velocità, mosse scrappy.",
  },
  {
    id: "binet-field",
    name: "Les Binet & Peter Field",
    lens: "Brand vs activation, effetti lunghi. Lo split brand/performance circa 60/40 sul lungo. Utile quando l'agenzia deve giustificare al cliente investimenti che non rendono nell'ultimo click.",
    style:
      "Frasi-tipo (parafrasi): \"La performance raccoglie la domanda; il brand la crea.\" / \"Il ROAS di breve nasconde il costo di lungo.\" Forte su: allocazione budget, valore di lungo, pricing power del cliente. Debole su: cassa cortissima.",
  },
  {
    id: "galloway",
    name: "Scott Galloway",
    lens: "Dinamiche strutturali, brand come fossato. Il brand è un fossato contro la commoditizzazione; guarda distribuzione e potere prima delle tattiche.",
    style:
      "Frasi-tipo (parafrasi): \"Nessun fossato, nessuna festa.\" / \"Chi possiede la distribuzione possiede il margine.\" Forte su: posizionamento competitivo, lettura provocatoria dei mercati. Debole su: esecuzione fine, persone.",
  },
];
