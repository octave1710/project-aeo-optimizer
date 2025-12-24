# Project AEO Optimizer
Project AEO Optimizer is a workspace for refining and automating AEO-focused workflows.
It centralizes scripts, data, and configurations to improve answer-engine visibility.
The project emphasizes repeatable experiments, measurable outcomes, and clean documentation.
It supports iterative optimization with clear inputs, outputs, and reporting.
This README provides a concise overview of goals and scope.

## Running locally
Prereqs:
- Node.js 18+
- Docker (for Postgres)

Steps:
1. Copy `.env.example` to `.env` and adjust values if needed.
2. Start Postgres: `docker-compose up -d`.
3. Install deps: `npm install`.
4. Generate Prisma client: `npm run prisma:generate`.
5. Run migrations: `npm run prisma:migrate`.
6. Seed demo data: `npx prisma db seed`.
7. Start the dev server: `npm run dev`.

## CSV format
Upload a CSV with these columns:
- `query` (required)
- `intent` (optional)
- `priority` (optional number)
