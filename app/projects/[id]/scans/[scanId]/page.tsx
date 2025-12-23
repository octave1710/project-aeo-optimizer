import Link from "next/link";
import { prisma } from "@/lib/prisma";

type ScanDetailPageProps = {
  params: { id: string; scanId: string };
};

function percent(count: number, total: number) {
  if (!total) {
    return 0;
  }
  return Math.round((count / total) * 100);
}

export default async function ScanDetailPage({ params }: ScanDetailPageProps) {
  const scan = await prisma.scan.findUnique({
    where: { id: params.scanId },
    include: {
      querySet: {
        select: {
          id: true,
          name: true,
          project: { select: { id: true, name: true, domain: true } }
        }
      },
      results: {
        include: {
          query: { select: { text: true } }
        },
        orderBy: { capturedAt: "desc" }
      }
    }
  });

  if (!scan || scan.querySet.project.id !== params.id) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
        <Link className="text-sm text-slate-600 hover:underline" href="/projects">
          Back to projects
        </Link>
        <h1 className="text-2xl font-semibold">Scan not found</h1>
      </main>
    );
  }

  const total = scan.results.length;
  const aiPresenceCount = scan.results.filter((result) => result.aiPresence).length;
  const brandMentionCount = scan.results.filter(
    (result) => result.brandMentioned
  ).length;
  const yourUrlCitedCount = scan.results.filter(
    (result) => result.yourUrlCited
  ).length;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            className="text-sm text-slate-600 hover:underline"
            href={`/projects/${scan.querySet.project.id}/queries/${scan.querySet.id}/scans`}
          >
            Back to scans
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Scan detail</h1>
          <p className="text-sm text-slate-600">
            {scan.querySet.project.name} · {scan.querySet.name}
          </p>
        </div>
        <div className="text-xs text-slate-500">
          {scan.createdAt.toLocaleString()}
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs uppercase text-slate-500">AI Presence</div>
          <div className="mt-2 text-2xl font-semibold">
            {percent(aiPresenceCount, total)}%
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs uppercase text-slate-500">Brand Mention</div>
          <div className="mt-2 text-2xl font-semibold">
            {percent(brandMentionCount, total)}%
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs uppercase text-slate-500">Your URL Cited</div>
          <div className="mt-2 text-2xl font-semibold">
            {percent(yourUrlCitedCount, total)}%
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Results</h2>
        </div>
        {scan.results.length === 0 ? (
          <div className="px-6 py-6 text-sm text-slate-600">
            No results recorded for this scan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Query</th>
                  <th className="px-4 py-3">AI presence</th>
                  <th className="px-4 py-3">Brand mentioned</th>
                  <th className="px-4 py-3">Your URL cited</th>
                  <th className="px-4 py-3">Cited URLs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scan.results.map((result) => (
                  <tr key={result.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {result.query.text}
                    </td>
                    <td className="px-4 py-3">
                      {result.aiPresence ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      {result.brandMentioned ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      {result.yourUrlCited ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {Array.isArray(result.citedUrls) &&
                      result.citedUrls.length > 0
                        ? result.citedUrls.join(", ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
