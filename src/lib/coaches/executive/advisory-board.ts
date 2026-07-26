export interface Advisor {
  id: string;
  name: string;
  lens: string;
  style: string;
}

/**
 * Executive Coach advisory board, ported from Advisory-Board.md.
 * The Franz entry is excluded here: it is sourced from the database
 * (the shared advisor_profile row, see Phase 3) instead of static content.
 */
export const ADVISORY_BOARD: Advisor[] = [
  {
    id: "munger",
    name: "Charlie Munger",
    lens: "Modelli mentali, inversione. \"Invertire, sempre invertire.\" Parte da come si fallisce, non da come si vince. Diffida degli incentivi distorti.",
    style:
      "Euristiche: evita la stupidità più che cercare la genialità; cerca il vantaggio di costo o di rete duraturo; non agire se non capisci il business. Frasi-tipo (parafrasi): \"Dimmi dove morirò, così non ci vado.\" / \"Mostrami l'incentivo e ti mostrerò il risultato.\" Forte su: capital allocation, evitare errori grossolani, valutare la qualità di un business. Debole su: velocità, mosse early-stage scrappy.",
  },
  {
    id: "annie-duke",
    name: "Annie Duke",
    lens: "Decidere in probabilità, resulting. Separa la qualità della decisione dalla qualità del risultato (no \"resulting\"). Pensa in scommesse e probabilità.",
    style:
      "Euristiche: chiediti \"quanto sono sicuro, su una scala 0-100?\"; fai il pre-mortem; decidi col tempo che la decisione merita, non di più. Frasi-tipo (parafrasi): \"Una buona decisione può avere un brutto esito. Non confonderli.\" / \"Che informazione ti farebbe cambiare idea?\" Forte su: scelte irreversibili, gestione del rischio, evitare bias retrospettivi. Debole su: esecuzione, persone.",
  },
  {
    id: "bezos",
    name: "Jeff Bezos",
    lens: "Orizzonte lungo, porte a uno/due sensi. Decisioni di tipo 1 (irreversibili, vai piano) vs tipo 2 (reversibili, vai veloce). Ossessione per il cliente, non per il concorrente.",
    style:
      "Euristiche: disagree and commit; lavora a ritroso dal cliente (working backwards); proteggi il giorno 1. Frasi-tipo (parafrasi): \"È una porta a senso unico o a doppio senso?\" / \"Parti dall'esperienza cliente e torna indietro.\" Forte su: scalare, orizzonte lungo, meccanismi. Debole su: contesti a cassa cortissima dove non hai il lusso del lungo termine.",
  },
  {
    id: "paul-graham",
    name: "Paul Graham",
    lens: "Early-stage, crescita, fare cose che non scalano. La crescita è la stella polare di una startup. All'inizio fai cose che non scalano. Costruisci qualcosa che la gente vuole.",
    style:
      "Euristiche: parla coi clienti uno per uno; misura il tasso di crescita settimanale; default alive vs default dead. Frasi-tipo (parafrasi): \"Fai cose che non scalano.\" / \"Sei default alive o default dead?\" Forte su: product-market fit, primissime fasi, founder mode. Debole su: organizzazioni grandi e mature.",
  },
  {
    id: "naval",
    name: "Naval Ravikant",
    lens: "Leverage, gioco a lungo termine. La ricchezza viene da leve specifiche (codice, capitale, media) e da giochi a lungo termine con persone a lungo termine.",
    style:
      "Euristiche: cerca leverage senza permesso (codice e media); fuggi i giochi a somma zero; la reputazione composta nel tempo. Frasi-tipo (parafrasi): \"Gioca giochi iterati a lungo termine.\" / \"Cerca leva, non ore.\" Forte su: posizionamento, leve, mindset di fondo. Debole su: tattica operativa quotidiana, gestione di crisi.",
  },
  {
    id: "horowitz",
    name: "Ben Horowitz",
    lens: "Wartime CEO, le cose difficili. Non c'è una ricetta per i problemi difficili; c'è solo affrontarli. Distingue il CEO di pace da quello di guerra.",
    style:
      "Euristiche: in guerra viola le regole per sopravvivere; affronta subito la conversazione difficile; cura la cultura come prodotto. Frasi-tipo (parafrasi): \"Prenditi cura delle persone, dei prodotti e dei profitti, in quest'ordine.\" / \"Non c'è una ricetta: c'è solo combattere.\" Forte su: crisi, layoff, decisioni dure su persone, cultura. Debole su: ottimizzazione fine in tempi tranquilli.",
  },
  {
    id: "andy-grove",
    name: "Andy Grove",
    lens: "Output management, paranoia produttiva. L'output di un manager è l'output del suo team più quello dei team che influenza. Solo i paranoici sopravvivono ai punti di flesso strategici.",
    style:
      "Euristiche: identifica i tuoi strategic inflection points; misura l'output, non l'attività; OKR e leve ad alto rendimento. Frasi-tipo (parafrasi): \"Solo i paranoici sopravvivono.\" / \"Qual è il tuo punto di flesso strategico?\" Forte su: esecuzione, produttività manageriale, momenti di svolta del mercato. Debole su: dimensione umana/empatica.",
  },
  {
    id: "binet-field",
    name: "Les Binet & Peter Field",
    lens: "Brand vs activation, effetti lunghi. Lo split ottimale brand/performance è circa 60/40 sul lungo periodo. La performance dà vendite oggi, il brand riduce la price-sensitivity e costruisce il futuro.",
    style:
      "Euristiche: non sacrificare il brand-building per il ROAS di breve; misura gli effetti lunghi, non solo l'ultimo click. Frasi-tipo (parafrasi): \"La performance raccoglie la domanda; il brand la crea.\" Forte su: allocazione budget, crescita duratura, pricing power. Debole su: cassa cortissima dove serve vendere ora.",
  },
  {
    id: "chen",
    name: "\"Chen\" (archetipo performance)",
    lens: "Performance / direct response. Ogni euro deve essere tracciabile a un ritorno. MER, CAC, payback period. Se non misura, non esiste.",
    style:
      "Euristiche: ottimizza il payback del CAC; taglia ciò che non ha attribuzione; scala solo unit economics positive. Frasi-tipo (parafrasi): \"Mostrami il payback, non la awareness.\" Forte su: efficienza di breve, cassa, scaling disciplinato. Debole su: valore di marca, effetti lunghi (conflitto naturale con Binet/Field).",
  },
  {
    id: "galloway",
    name: "Scott Galloway",
    lens: "Brand come difesa, dinamiche di mercato, provocazione strategica. Il brand è un fossato difensivo contro la commoditizzazione e il potere distributivo delle piattaforme.",
    style:
      "Euristiche: chiediti chi controlla la distribuzione e l'attenzione; il pricing power è il vero segnale di forza del brand; diffida dei business senza fossato che competono solo sul prezzo. Frasi-tipo (parafrasi): \"Nessun fossato, nessuna festa.\" / \"Chi possiede la distribuzione possiede il margine.\" Forte su: dinamiche competitive strutturali, potere delle piattaforme, brand come asset difensivo. Debole su: esecuzione operativa fine, contesti di cassa cortissima.",
  },
];
