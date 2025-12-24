import Link from "next/link";
import { prisma } from "@/lib/prisma";


type QuerySetScansPageProps = {
  params: { id: string; querySetId: string };
};

export default async function QuerySetScansPage({
  params
}: QuerySetScansPageProps) {
  const querySet = await prisma.querySet.findFirst({
    where: { id: params.querySetId, projectId: params.id },
    select: {
      id: true,
      name: true,
      project: { select: { id: true, name: true, domain: true } }
    }
  });

  if (!querySet) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
        <Link className="text-sm text-slate-600 hover:underline" href="/projects">
          Back to projects
        </Link>
        <h1 className="text-2xl font-semibold">Query set not found</h1>
      </main>
    );
  }

  const scans = await prisma.scan.findMany({
    where: { querySetId: querySet.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      startedAt: true,
      finishedAt: true,
      _count: { select: { results: true } }
    }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
      <div>
        <Link
          className="text-sm text-slate-600 hover:underline"
          href={`/projects/${querySet.project.id}/queries`}
        >
          Back to queries
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{querySet.project.name}</h1>
        <p className="text-sm text-slate-600">
          {querySet.project.domain} · {querySet.name}
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Scans</h2>
        </div>
        {scans.length === 0 ? (
          <div className="px-6 py-6 text-sm text-slate-600">
            No scans yet. Run a scan from the query set list.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {scans.map((scan) => (
              <li key={scan.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link
                      className="text-sm font-semibold text-slate-900 hover:underline"
                      href={`/projects/${querySet.project.id}/scans/${scan.id}`}
                    >
                      Scan {scan.createdAt.toLocaleString()}
                    </Link>
                    <div className="text-xs text-slate-600">
                      Status: {scan.status} · {scan._count.results} results
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {scan.finishedAt
                      ? `Finished ${scan.finishedAt.toLocaleTimeString()}`
                      : "In progress"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
