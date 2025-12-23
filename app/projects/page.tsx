import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      domain: true,
      localeCountry: true,
      localeLanguage: true,
      createdAt: true
    }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-slate-600">
            Track AI visibility by project and domain.
          </p>
        </div>
        <Link
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          href="/projects/new"
        >
          New project
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        {projects.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">
            No projects yet. Create the first one.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {projects.map((project) => (
              <li key={project.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link
                      className="text-base font-semibold text-slate-900 hover:underline"
                      href={`/projects/${project.id}`}
                    >
                      {project.name}
                    </Link>
                    <div className="text-sm text-slate-600">
                      {project.domain} · {project.localeLanguage.toUpperCase()}-
                      {project.localeCountry.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {project.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
