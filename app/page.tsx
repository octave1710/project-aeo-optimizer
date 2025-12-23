import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold">AEO Visibility OS</h1>
      <p className="text-base text-slate-600">
        Scaffolded Next.js + Prisma + Postgres stack. Feature UI is intentionally
        minimal until the product surfaces are implemented.
      </p>
      <div>
        <Link
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          href="/projects"
        >
          View projects
        </Link>
      </div>
    </main>
  );
}
