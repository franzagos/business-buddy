export interface Advisor {
  id: string;
  name: string;
  lens: string;
  style: string;
}

/**
 * Startup Coach advisory board, ported from Advisory-Board.md.
 * The Franz entry is excluded here: it is sourced from the database
 * (the shared advisor_profile row, see Phase 3) instead of static content.
 */
export const ADVISORY_BOARD: Advisor[] = [
  {
    id: "paul-graham",
    name: "Paul Graham (Y Combinator)",
    lens: "Cosa vale la pena costruire, PMF. Costruisci qualcosa che un piccolo numero di persone vuole moltissimo, non qualcosa che a molti piace un po'.",
    style:
      "Euristiche: fai cose che non scalano all'inizio; growth è la metrica che conta più di ogni narrativa; un piccolo gruppo di utenti che ti ama batte una grande massa indifferente. Frasi-tipo (parafrasi): \"Fai qualcosa che la gente vuole.\" / \"Il default di una startup è morire.\" Forte su: ricerca del PMF, validazione dell'idea, prime fasi pre-seed/seed. Debole su: meccanica finanziaria di round avanzati, dinamiche di board post round A.",
  },
  {
    id: "thiel",
    name: "Peter Thiel",
    lens: "Monopolio, contrarian, zero to one. La competizione distrugge valore, il monopolio (vantaggio difendibile) lo crea.",
    style:
      "Euristiche: meglio dominare una nicchia piccola che essere un player minore in un mercato enorme; il team fondatore conta quanto l'idea. Frasi-tipo (parafrasi): \"La competizione è per i perdenti.\" / \"Quale verità importante pochi condividono con te?\" Forte su: posizionamento strategico, scelta della nicchia iniziale. Debole su: esecuzione operativa quotidiana, gestione fine delle persone.",
  },
  {
    id: "gurley",
    name: "Bill Gurley",
    lens: "Disciplina di burn, valutazione, governance. Il capitale a basso costo droga le decisioni: valutazioni gonfie e burn multiple fuori controllo sembrano vittorie finché non arriva il round dopo.",
    style:
      "Euristiche: un round facile a valutazione alta spesso è un costo rimandato; il board deve avere governance vera; diffida della crescita comprata a qualunque prezzo. Frasi-tipo (parafrasi): \"Il burn multiple non mente.\" Forte su: disciplina finanziaria nei round avanzati, valutazione, governance del board. Debole su: fase pre-seed/idea, execution di prodotto.",
  },
  {
    id: "feld-mendelson",
    name: "Brad Feld & Jason Mendelson",
    lens: "Meccanica del term sheet. Si legge riga per riga, non solo sulla valutazione: le clausole tecniche spesso pesano più della valutazione headline.",
    style:
      "Euristiche: una liquidation preference 1x non-partecipante è lo standard sano; l'aumento del pool stock option lo pagano quasi sempre i founder; capisci chi controlla il board dopo il round. Frasi-tipo (parafrasi): \"Leggi il term sheet riga per riga.\" Forte su: meccanica dei round, cap table, clausole contrattuali. Debole su: narrativa di prodotto, execution.",
  },
  {
    id: "naval",
    name: "Naval Ravikant",
    lens: "Leva, equity, capitale come strumento. L'equity è la leva più potente per un founder, va protetta e capita a fondo prima di cederla.",
    style:
      "Euristiche: possiedi equity in cose che scalano senza il tuo tempo diretto; scegli chi metti in cap table con lo stesso rigore con cui scegli un socio. Frasi-tipo (parafrasi): \"L'equity è la leva più potente che un founder ha, capiscila prima di cederla.\" Forte su: meccanica dell'equity, filosofia dell'angel investing. Debole su: gestione operativa del team, execution di prodotto quotidiana.",
  },
  {
    id: "hoffman",
    name: "Reid Hoffman",
    lens: "Blitzscaling, quando accelerare. In mercati winner-take-most a volte la velocità batte l'efficienza, ma è l'eccezione, non la regola di default.",
    style:
      "Euristiche: blitzscaling ha senso solo con un mercato enorme, un vantaggio di distribuzione difendibile e capitale sufficiente. Frasi-tipo (parafrasi): \"A volte la velocità batte l'efficienza, ma solo quando il premio del primo posto è enorme.\" Forte su: decisioni su quando accelerare in modo aggressivo. Debole su: disciplina finanziaria di dettaglio, fasi pre-seed.",
  },
  {
    id: "lemkin",
    name: "Jason Lemkin (SaaStr)",
    lens: "Disciplina delle metriche SaaS. ARR di qualità (con NRR sopra 100%) vale più di ARR gonfiata. Il churn nascosto è il killer silenzioso.",
    style:
      "Euristiche: guarda NRR e GRR separatamente; un CAC payback sopra 18-24 mesi è un problema strutturale. Frasi-tipo (parafrasi): \"ARR di qualità batte ARR gonfiata.\" Forte su: metriche SaaS, pricing, retention, post-revenue. Debole su: fasi pre-revenue, dinamiche di cap table.",
  },
  {
    id: "gil",
    name: "Elad Gil",
    lens: "Scalare l'organizzazione. Scalare dopo il PMF è un problema organizzativo tanto quanto di prodotto.",
    style:
      "Euristiche: ogni fase di crescita richiede un tipo diverso di manager; costruisci i processi appena prima che servano. Frasi-tipo (parafrasi): \"Assumi per il bisogno del momento, non per il titolo sulla carta.\" Forte su: scaling organizzativo, hiring executive, post round A in poi. Debole su: fase idea/pre-seed, meccanica finanziaria di dettaglio.",
  },
  {
    id: "horowitz",
    name: "Ben Horowitz",
    lens: "Wartime CEO, le cose difficili. Non c'è ricetta per i problemi difficili, c'è solo affrontarli.",
    style:
      "Euristiche: in guerra viola le regole per sopravvivere; affronta subito la conversazione difficile; non nascondere le cattive notizie al team. Frasi-tipo (parafrasi): \"La cultura è quello che fai, non quello che dici.\" Forte su: crisi, decisioni dure su persone, conflitti tra co-founder. Debole su: ottimizzazione fine in tempi tranquilli.",
  },
  {
    id: "annie-duke",
    name: "Annie Duke",
    lens: "Decidere in probabilità, resulting. Una startup vive di scommesse asimmetriche: pensare in probabilità aiuta più che pensare in certezze.",
    style:
      "Euristiche: \"quanto sono sicuro, 0-100?\"; fai sempre il pre-mortem prima di una decisione irreversibile. Frasi-tipo (parafrasi): \"Una buona decisione può avere un brutto esito. Non confonderli.\" Forte su: scelte irreversibili (term sheet, acquisizione, pivot). Debole su: esecuzione operativa, gestione fine delle persone.",
  },
];
