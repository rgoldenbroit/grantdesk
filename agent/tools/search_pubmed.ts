import { defineTool } from "eve/tools";
import { z } from "zod";

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

type Summary = { title?: string; fulljournalname?: string; pubdate?: string };

// DECISION: a failed search must say "search failed", never look like "no papers found".
async function getJson(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (res.status === 429) throw new Error("PubMed is rate-limiting requests. Wait a few seconds and try again.");
  if (!res.ok) throw new Error(`PubMed search failed (HTTP ${res.status}).`);
  return res.json();
}

export default defineTool({
  description:
    "Search PubMed for recent papers. Returns PMID, title, journal, and year. Cite only PMIDs returned here.",
  inputSchema: z.object({
    query: z.string().min(3).describe("PubMed search terms, for example: PET hydrolase thermostability"),
    fromYear: z.number().int().min(1990).max(2030).default(2023),
    maxResults: z.number().int().min(1).max(10).default(6),
  }),
  label: { start: ({ query }) => `Searching PubMed for "${query}"` },
  async execute({ query, fromYear, maxResults }) {
    // DECISION: NCBI asks callers to identify themselves; no API key needed at this volume.
    const common = `tool=grantdesk&email=${encodeURIComponent(process.env.NCBI_EMAIL ?? "")}`;
    const term = encodeURIComponent(`${query} AND ${fromYear}:3000[dp]`);
    const search = await getJson(
      `${EUTILS}/esearch.fcgi?db=pubmed&retmode=json&sort=relevance&retmax=${maxResults}&term=${term}&${common}`,
    );
    const ids: string[] = search?.esearchresult?.idlist ?? [];
    if (ids.length === 0) return { results: [] };

    const summary = await getJson(
      `${EUTILS}/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}&${common}`,
    );

    return {
      results: ids.map((pmid) => {
        const item: Summary = summary?.result?.[pmid] ?? {};
        return {
          pmid,
          title: item.title ?? "",
          journal: item.fulljournalname ?? "",
          year: (item.pubdate ?? "").slice(0, 4),
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        };
      }),
    };
  },
});
