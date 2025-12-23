import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";

async function getWorkspaceId() {
  const workspace = await prisma.workspace.findFirst({
    select: { id: true }
  });

  if (workspace) {
    return workspace.id;
  }

  const owner = await prisma.user.upsert({
    where: { email: "system@local.dev" },
    update: {},
    create: { email: "system@local.dev", name: "System" }
  });

  const createdWorkspace = await prisma.workspace.create({
    data: { name: "Default Workspace", ownerUserId: owner.id }
  });

  return createdWorkspace.id;
}

async function createProject(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const domain = String(formData.get("domain") ?? "").trim();
  const localeCountry = String(formData.get("localeCountry") ?? "").trim();
  const localeLanguage = String(formData.get("localeLanguage") ?? "").trim();

  if (!name || !domain || !localeCountry || !localeLanguage) {
    return;
  }

  const workspaceId = await getWorkspaceId();
  const project = await prisma.project.create({
    data: {
      name,
      domain,
      localeCountry,
      localeLanguage,
      workspaceId
    }
  });

  redirect(`/projects/${project.id}`);
}

export default function NewProjectPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <Link className="text-sm text-slate-600 hover:underline" href="/projects">
          Back to projects
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">New project</h1>
        <p className="text-sm text-slate-600">
          Start tracking a domain and locale.
        </p>
      </div>

      <form
        action={createProject}
        className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Project name
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            name="name"
            placeholder="Demo Project"
            required
            type="text"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Domain
          <input
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            name="domain"
            placeholder="example.com"
            required
            type="text"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Locale country
            <input
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              name="localeCountry"
              placeholder="US"
              required
              type="text"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Locale language
            <input
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              name="localeLanguage"
              placeholder="en"
              required
              type="text"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            type="submit"
          >
            Create project
          </button>
          <Link className="text-sm text-slate-600 hover:underline" href="/projects">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
