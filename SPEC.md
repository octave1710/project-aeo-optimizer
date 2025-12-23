# SPEC — AEO & AI Search Visibility OS (MVP)

## 0) One-liner
A web app that helps teams measure and improve their visibility in AI-driven search experiences (AI Overviews / AI Mode) by:
1) detecting which target queries trigger AI answers,
2) tracking brand presence and changes over time,
3) scoring pages for “answer readiness” (AEO),
4) outputting prioritized, copy-paste improvements and weekly reports.

## 1) Target users & who pays
### Primary (MVP)
- B2B marketing teams (Head of SEO / Growth) at:
  - SMB & mid-market e-commerce
  - SaaS with content-led acquisition
  - Agencies managing multiple clients

### Buyer / payer
- Head of Growth / Head of SEO / Agency owner
- WTP: $99–$499/mo (MVP), higher for agency/multi-site.

## 2) Problem & jobs-to-be-done
### Pain points
- AI answers reduce clicks; teams need new measurement beyond classic rankings.
- Volatile SERPs: AI features appear/disappear by query.
- Content teams don’t know what to change: need page-level, actionable guidance.
- Reporting is fragmented across tools; no “AI visibility” dashboard.

### JTBD
- “Tell me which of my money queries are now AI-answered, and what I should fix first.”
- “Show trends week-over-week and alert me when I gain/lose AI presence.”
- “Give me ready-to-implement content blocks + schema + tasks for dev/content.”

## 3) MVP scope (what we ship in v1)
### Core capabilities
1) Project onboarding (domain + locale)
2) Query set import (CSV v1; optional GSC later)
3) SERP feature scan for each query:
   - AI answer present (boolean)
   - optional: list of cited sources / domains if provider supports it
   - snapshot storage (raw JSON)
4) Site page discovery:
   - sitemap import
   - basic crawl of page HTML (fetch + parse)
5) AEO scoring per page (simple, deterministic rubric)
6) Recommendations + “snippets”:
   - Answer block template
   - FAQ pack template
   - JSON-LD schema template (FAQPage / HowTo / Organization / Product where relevant)
7) Reporting:
   - weekly digest (email) + in-app report page
   - alerts on AI-feature changes for tracked queries

### Explicit non-goals (v1)
- No direct Google scraping (use a SERP data provider API)
- No “guaranteed citations”
- No full CMS write-back (copy/paste outputs only)
- No heavy competitor intelligence (only optional compare later)

## 4) Product format
- Webapp (desktop-first) with:
  - multi-project workspace
  - dashboard + pages + queries + reports
- Background worker for crawl & SERP jobs.
- Postgres for storage (+ optional Redis for queue).

## 5) User journey (end-to-end)
### Onboarding
1) Sign up → create Workspace
2) Create Project:
   - Project name
   - Domain (example.com)
   - Locale: country + language
3) Add Queries:
   - Upload CSV OR paste list
   - Optional weight/priority per query
4) Run first scan:
   - SERP scan for queries
   - sitemap import + page scoring
5) See Dashboard:
   - % queries with AI answers
   - list of “high-impact queries”
   - top pages to fix first
6) Open a Page Report:
   - score breakdown
   - recommended changes + copy/paste blocks
7) Reports:
   - weekly digest + change log
   - alerts when AI answers appear/disappear for key queries

## 6) Key screens (MVP)
1) Auth (login/signup)
2) Workspace / Projects list
3) Project Dashboard
4) Queries:
   - import CSV
   - list with AI-feature status
   - run scan button + last scan timestamp
5) Pages:
   - sitemap import
   - list of URLs + AEO score + status
6) Page Detail:
   - score breakdown
   - recommendations
   - copy/paste snippets (Answer block, FAQ, Schema)
7) Reports:
   - weekly summaries + deltas
8) Settings:
   - locale
   - SERP provider key status
   - email alerts on/off

## 7) Data model (minimal)
### Entities
- User(id, email, name, createdAt)
- Workspace(id, name, ownerUserId)
- WorkspaceMember(id, workspaceId, userId, role)
- Project(id, workspaceId, name, domain, localeCountry, localeLanguage, createdAt)

- QuerySet(id, projectId, name, createdAt)
- Query(id, querySetId, text, country, device, weight, createdAt)

- SerpScan(id, querySetId, startedAt, finishedAt, status)
- SerpResult(id, serpScanId, queryId, aiAnswerPresent, sourcesJson, rawJson, fetchedAt)

- Page(id, projectId, url, discoveredVia, lastFetchedAt, fetchStatus, httpStatus)
- PageAudit(id, pageId, auditedAt, aeoScore, rubricVersion, signalsJson, recommendationsJson)

- Report(id, projectId, periodStart, periodEnd, createdAt, summaryJson)
- AlertRule(id, projectId, type, thresholdJson, enabled)
- AlertEvent(id, projectId, type, payloadJson, createdAt)

## 8) AEO scoring rubric (v1, deterministic)
Score out of 100, computed from weighted signals:

### Content Answerability (40)
- Has clear definition/summary block early (0/10)
- Has structured lists / steps / tables where relevant (0/10)
- Has FAQ section (0/10)
- Addresses intent completeness (heuristic: headings coverage) (0/10)

### Structured Data & Entities (25)
- JSON-LD present (FAQPage/HowTo/Product/Organization) (0/10)
- Clear entity markers (brand, product, location, author) (0/10)
- Internal linking to supporting pages (0/5)

### Trust & Freshness (20)
- Author/about/contact present (0/5)
- References/citations/outbound sources where relevant (0/5)
- Updated date / changelog / freshness signals (0/5)
- Performance basics proxy (TTFB not in v1; use lightweight heuristics) (0/5)

### Technical Readability (15)
- Clean headings hierarchy (0/5)
- Avoids overly thin/duplicated content signals (0/5)
- Mobile-friendly hint (basic meta viewport detection) (0/5)

Rubric must be versioned (rubricVersion).

## 9) Recommendations generator (v1)
For each page, output:
- Priority: High/Medium/Low (based on score + query importance linkage later)
- Recommended actions (5–10 max)
- Copy/paste snippets:
  1) Answer Block (40–80 words)
  2) FAQ Pack (6–12 Q/A templates)
  3) JSON-LD (FAQPage default, plus others if detected intent)

Snippets are templates, not hallucinated facts. If generating text, constrain to reusing page’s existing facts or user-provided inputs.

## 10) SERP feature scanning (v1)
- Use a SERP data provider API (config in env):
  - Input: query + country + device + language
  - Output: aiAnswerPresent boolean (or equivalent feature flag)
  - Optional: cited sources list if available
- Store raw snapshots for reproducibility & debugging.

## 11) Background jobs (MVP)
- Job A: import sitemap → create/update Page records
- Job B: fetch page HTML → parse signals → write PageAudit
- Job C: SERP scan queries → write SerpResults
- Job D: weekly report generator → write Report + send email

Queue approach:
- v1 can run sequentially with a simple worker + cron
- must support retries, timeouts, rate limits

## 12) Metrics (what we track)
Product analytics events:
- project_created
- queries_imported
- serp_scan_started / completed
- sitemap_imported
- page_audit_completed
- report_viewed
- snippet_copied (answer_block / faq / schema)
- alert_enabled

Success metrics (MVP):
- Time to first value < 10 minutes (from signup to dashboard filled)
- Weekly active projects
- # snippet copies / project / week
- Paid conversion rate on trial (later)

## 13) Pricing hypothesis (MVP)
- Free trial 7–14 days (or freemium with limited queries)
- Starter: $99/mo (1 site, 500 queries/mo, weekly reports)
- Pro: $299/mo (3 sites, 2,000 queries/mo, alerts, team)
- Agency: $499+/mo (10+ sites, seats, exports)

## 14) Tech stack (recommended)
- Next.js (App Router) + TypeScript + Tailwind
- Postgres + Prisma
- Worker/queue: BullMQ + Redis OR DB-backed queue + cron
- HTML parsing: Cheerio
- Email: Resend/Postmark
- Deployment: Vercel (web) + Railway/Fly.io (db/worker)

## 15) Security & compliance (baseline)
- Do not store credentials. OAuth tokens encrypted at rest if GSC added.
- Respect robots.txt and implement rate limiting on fetch.
- Provide data deletion per project/workspace.
- Avoid claims of guaranteed ranking/citation.

## 16) Milestones / PR plan (10 PRs)
1) Scaffold app + auth + db + docker-compose
2) Workspace/projects CRUD + navigation
3) QuerySet CSV import + list UI
4) SERP provider integration + SerpScan runner + results table
5) Sitemap import + pages table
6) Page fetch + parser signals + PageAudit storage
7) AEO scoring rubric v1 + page detail UI
8) Recommendations & snippet components + copy buttons
9) Reports + weekly digest generator
10) Alerts + settings + deploy docs

## 17) Definition of Done (MVP)
A new user can:
- create a project,
- upload queries,
- run scan,
- see which queries have AI answers,
- see page scores + prioritized recommendations,
- copy snippets,
- receive a weekly report email.

