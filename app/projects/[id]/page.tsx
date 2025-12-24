import Link from "next/link";
import { prisma } from "../../../lib/prisma";

type ProjectDetailPageProps = {
  params: { id: string };
};

export default async function ProjectDetailPage({
  params
}: ProjectDetailPageProps) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      domain: true,
      localeCountry: true,
      localeLanguage: true,
      createdAt: true,
      workspace: { select: { name: true } }
    }
  });

  if (!project) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
        <Link className="text-sm text-slate-600 hover:underline" href="/projects">
          Back to projects
        </Link>
        <h1 className="text-2xl font-semibold">Project not found</h1>
        <p className="text-sm text-slate-600">
          Check the project ID and try again.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <Link className="text-sm text-slate-600 hover:underline" href="/projects">
        Back to projects
      </Link>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-sm text-slate-600">{project.domain}</p>
          <Link
            className="w-fit text-sm font-medium text-slate-700 hover:underline"
            href={`/projects/${project.id}/queries`}
          >
            View queries
          </Link>
          <div className="text-sm text-slate-600">
            Locale: {project.localeLanguage.toUpperCase()}-
            {project.localeCountry.toUpperCase()}
          </div>
          <div className="text-sm text-slate-600">
            Workspace: {project.workspace.name}
          </div>
          <div className="text-xs text-slate-500">
            Created {project.createdAt.toLocaleDateString()}
          </div>
        </div>
      </div>
    </main>
  );
}
