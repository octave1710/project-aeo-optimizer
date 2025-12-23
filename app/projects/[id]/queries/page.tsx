import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type QueriesPageProps = {
  params: { id: string };
  searchParams?: { error?: string };
};

type ParsedRow = {
  query: string;
  intent?: string;
  priority?: string;
};

const MAX_ROWS = 1000;
const MOCK_NOTES = [
  "AI answer detected (mock)",
  "AI overview summarized the query (mock)",
  "AI answer absent (mock)",
  "AI answer present with citations (mock)"
];

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function buildCitedUrls(domain: string, includeDomain: boolean) {
  const samples = [
    `https://${domain}/blog/aeo-basics`,
    `https://${domain}/guides/ai-search`,
    "https://example.com/seo/ai-overviews",
    "https://search.engine/docs/ai-answers",
    "https://industryreport.com/aeo-trends"
  ];

  const shuffled = samples.sort(() => 0.5 - Math.random());
  const count = 1 + Math.floor(Math.random() * 3);
  const urls = shuffled.slice(0, count);

  if (includeDomain && !urls.some((url) => url.includes(domain))) {
    urls.push(`https://${domain}/`);
  }

  return urls;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === "\"") {
      const nextChar = text[i + 1];
      if (inQuotes && nextChar === "\"") {
        currentCell += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i += 1;
      }
      currentRow.push(currentCell);
      currentCell = "";
      rows.push(currentRow);
      currentRow = [];
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}

function normalizeHeader(header: string[]) {
  return header.map((cell) => cell.trim().toLowerCase());
}

function parseQueryRows(rows: string[][]): ParsedRow[] {
  if (rows.length === 0) {
    return [];
  }

  const header = normalizeHeader(rows[0]);
  const hasHeader = header.includes("query");
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const queryIndex = hasHeader ? header.indexOf("query") : 0;
  const intentIndex = hasHeader ? header.indexOf("intent") : 1;
  const priorityIndex = hasHeader ? header.indexOf("priority") : 2;

  return dataRows.map((row) => ({
    query: String(row[queryIndex] ?? "").trim(),
    intent: String(row[intentIndex] ?? "").trim(),
    priority: String(row[priorityIndex] ?? "").trim()
  }));
}

async function uploadCsv(formData: FormData) {
  "use server";
  const projectId = String(formData.get("projectId") ?? "");
  const file = formData.get("file");

  if (!projectId) {
    redirect("/projects");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { localeCountry: true }
  });

  if (!project) {
    redirect(`/projects?error=Project%20not%20found.`);
  }

  if (!(file instanceof File)) {
    redirect(`/projects/${projectId}/queries?error=Please%20select%20a%20CSV%20file.`);
  }

  const text = (await file.text()).trim();

  if (!text) {
    redirect(`/projects/${projectId}/queries?error=CSV%20file%20is%20empty.`);
  }

  const rows = parseCsv(text);
  const parsedRows = parseQueryRows(rows);

  if (parsedRows.length === 0) {
    redirect(`/projects/${projectId}/queries?error=CSV%20file%20has%20no%20rows.`);
  }

  if (parsedRows.length > MAX_ROWS) {
    redirect(
      `/projects/${projectId}/queries?error=CSV%20exceeds%20${MAX_ROWS}%20rows.`
    );
  }

  const validQueries = parsedRows.filter((row) => row.query.length > 0);

  if (validQueries.length === 0) {
    redirect(
      `/projects/${projectId}/queries?error=Missing%20query%20values%20in%20CSV.`
    );
  }

  if (validQueries.length < parsedRows.length) {
    redirect(
      `/projects/${projectId}/queries?error=Some%20rows%20were%20missing%20the%20query%20column.`
    );
  }

  const querySet = await prisma.querySet.create({
    data: {
      name: `CSV import ${new Date().toLocaleDateString()}`,
      projectId
    }
  });

  await prisma.query.createMany({
    data: validQueries.map((row) => ({
      querySetId: querySet.id,
      text: row.query,
      country: project.localeCountry,
      device: "desktop",
      weight: row.priority && !Number.isNaN(Number(row.priority))
        ? Number(row.priority)
        : null
    }))
  });

  redirect(`/projects/${projectId}/queries`);
}

async function runScan(formData: FormData) {
  "use server";
  const projectId = String(formData.get("projectId") ?? "");
  const querySetId = String(formData.get("querySetId") ?? "");

  if (!projectId || !querySetId) {
    redirect("/projects");
  }

  const querySet = await prisma.querySet.findUnique({
    where: { id: querySetId },
    include: {
      project: { select: { domain: true } },
      queries: true
    }
  });

  if (!querySet) {
    redirect(`/projects/${projectId}/queries?error=Query%20set%20not%20found.`);
  }

  if (querySet.queries.length === 0) {
    redirect(
      `/projects/${projectId}/queries?error=No%20queries%20in%20this%20query%20set.`
    );
  }

  const startedAt = new Date();
  const scan = await prisma.scan.create({
    data: {
      querySetId: querySet.id,
      status: "running",
      startedAt
    }
  });

  const results = querySet.queries.map((query) => {
    const aiPresence = Math.random() < 0.68;
    const brandMentioned = aiPresence && Math.random() < 0.42;
    const yourUrlCited = aiPresence && Math.random() < 0.28;

    return {
      scanId: scan.id,
      queryId: query.id,
      aiPresence,
      brandMentioned,
      yourUrlCited,
      citedUrls: aiPresence
        ? buildCitedUrls(querySet.project.domain, yourUrlCited)
        : [],
      notes: pickRandom(MOCK_NOTES),
      capturedAt: new Date()
    };
  });

  await prisma.scanResult.createMany({ data: results });

  await prisma.scan.update({
    where: { id: scan.id },
    data: {
      status: "done",
      finishedAt: new Date()
    }
  });

  redirect(`/projects/${projectId}/scans/${scan.id}`);
}

export default async function ProjectQueriesPage({
  params,
  searchParams
}: QueriesPageProps) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, domain: true }
  });

  if (!project) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
        <Link className="text-sm text-slate-600 hover:underline" href="/projects">
          Back to projects
        </Link>
        <h1 className="text-2xl font-semibold">Project not found</h1>
      </main>
    );
  }

  const querySets = await prisma.querySet.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
    include: {
      queries: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link className="text-sm text-slate-600 hover:underline" href="/projects">
            Back to projects
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{project.name}</h1>
          <p className="text-sm text-slate-600">{project.domain}</p>
        </div>
        <Link
          className="text-sm font-medium text-slate-700 hover:underline"
          href={`/projects/${project.id}`}
        >
          View project
        </Link>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Upload CSV</h2>
            <p className="text-sm text-slate-600">
              Columns: query (required), intent (optional), priority (optional).
            </p>
          </div>
          <Link
            className="text-sm font-medium text-slate-700 hover:underline"
            href={`/projects/${project.id}/queries/sample`}
          >
            Download sample CSV
          </Link>
        </div>
        {searchParams?.error ? (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {decodeURIComponent(searchParams.error)}
          </div>
        ) : null}
        <form action={uploadCsv} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="projectId" value={project.id} />
          <input
            className="block w-full text-sm text-slate-700"
            name="file"
            accept=".csv,text/csv"
            type="file"
            required
          />
          <button
            className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            type="submit"
          >
            Upload CSV
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Query sets</h2>
        </div>
        {querySets.length === 0 ? (
          <div className="px-6 py-6 text-sm text-slate-600">
            No query sets yet. Upload a CSV to create one.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {querySets.map((set) => (
              <div key={set.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-semibold">{set.name}</div>
                    <div className="text-sm text-slate-600">
                      {set.queries.length} queries
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {set.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <form action={runScan}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="querySetId" value={set.id} />
                    <button
                      className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                      type="submit"
                    >
                      Run scan
                    </button>
                  </form>
                  <Link
                    className="text-xs font-medium text-slate-600 hover:underline"
                    href={`/projects/${project.id}/queries/${set.id}/scans`}
                  >
                    View scans
                  </Link>
                </div>
                <ul className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  {set.queries.map((query) => (
                    <li
                      key={query.id}
                      className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      {query.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
