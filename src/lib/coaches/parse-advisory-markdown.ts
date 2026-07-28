/**
 * Parses the Advisory-Board.md format used by the user's source coaching
 * content into board-expert rows. Format (per expert):
 *
 *   ### Name — optional subtitle
 *   - **Lente:** ...
 *   - **Euristiche:** ...
 *   - **Frasi-tipo:** ...
 *   - **Forte su:** ... **Debole su:** ...
 *
 * `## ` lines are section dividers and are skipped. Every other `### `
 * block is parsed into { name, lens, style }: the `Lente` bullet becomes
 * `lens`, all other bullets are concatenated as `"{Label}: {content}"`
 * joined by a single space to form `style` — matching the shape already
 * used by the static `.ts` advisory board files.
 *
 * Dependency-free: the format is simple and fixed, no need for a markdown
 * parsing library.
 */

export interface ParsedAdvisor {
  name: string;
  lens: string;
  style: string;
}

export interface SkippedBlock {
  heading: string;
  reason: string;
}

export interface ParseAdvisoryMarkdownResult {
  parsed: ParsedAdvisor[];
  skipped: SkippedBlock[];
  /** Names of parsed advisors that had no `Lente` bullet (lens = ""). */
  missingLens: string[];
}

const H3_RE = /^###\s+(.+)$/;
const H2_RE = /^##\s+(?!#)(.+)$/;
// - **Label:** content   (also tolerates missing bold markers)
const BULLET_RE = /^-\s*(?:\*\*)?([^:*]+?)(?:\*\*)?:\s*(.+)$/;

export function parseAdvisoryMarkdown(
  markdown: string
): ParseAdvisoryMarkdownResult {
  const lines = markdown.split(/\r?\n/);

  const parsed: ParsedAdvisor[] = [];
  const skipped: SkippedBlock[] = [];
  const missingLens: string[] = [];

  let currentHeading: string | null = null;
  let currentBullets: { label: string; content: string }[] = [];

  function flush() {
    if (currentHeading === null) return;
    const name = currentHeading.split("—")[0]?.trim() || currentHeading.trim();

    if (currentBullets.length === 0) {
      skipped.push({
        heading: currentHeading,
        reason: "nessun contenuto valido (nessun bullet trovato)",
      });
      currentHeading = null;
      currentBullets = [];
      return;
    }

    const lenteBullet = currentBullets.find(
      (b) => b.label.trim().toLowerCase() === "lente"
    );
    const otherBullets = currentBullets.filter(
      (b) => b.label.trim().toLowerCase() !== "lente"
    );

    const lens = lenteBullet ? lenteBullet.content.trim() : "";
    const style = otherBullets
      .map((b) => `${b.label.trim()}: ${b.content.trim()}`)
      .join(" ");

    if (!lenteBullet) {
      missingLens.push(name);
    }

    parsed.push({ name, lens, style });
    currentHeading = null;
    currentBullets = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length === 0) continue;

    const h3Match = H3_RE.exec(line);
    if (h3Match) {
      flush();
      currentHeading = h3Match[1].trim();
      continue;
    }

    const h2Match = H2_RE.exec(line);
    if (h2Match) {
      // Section divider — flush any in-progress expert, then skip this line.
      flush();
      continue;
    }

    if (currentHeading === null) continue;

    const bulletMatch = BULLET_RE.exec(line);
    if (bulletMatch) {
      currentBullets.push({
        label: bulletMatch[1],
        content: bulletMatch[2],
      });
    }
  }

  flush();

  return { parsed, skipped, missingLens };
}
