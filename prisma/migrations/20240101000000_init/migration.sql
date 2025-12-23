CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Workspace" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "ownerUserId" UUID NOT NULL,
    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkspaceMember" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" TEXT NOT NULL,
    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Project" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "localeCountry" TEXT NOT NULL,
    "localeLanguage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuerySet" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuerySet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Query" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "querySetId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Query_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SerpScan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "querySetId" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    CONSTRAINT "SerpScan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SerpResult" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "serpScanId" UUID NOT NULL,
    "queryId" UUID NOT NULL,
    "aiAnswerPresent" BOOLEAN NOT NULL,
    "sourcesJson" JSONB,
    "rawJson" JSONB,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SerpResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Page" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "discoveredVia" TEXT,
    "lastFetchedAt" TIMESTAMP(3),
    "fetchStatus" TEXT,
    "httpStatus" INTEGER,
    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PageAudit" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pageId" UUID NOT NULL,
    "auditedAt" TIMESTAMP(3) NOT NULL,
    "aeoScore" INTEGER NOT NULL,
    "rubricVersion" TEXT NOT NULL,
    "signalsJson" JSONB,
    "recommendationsJson" JSONB,
    CONSTRAINT "PageAudit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Report" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summaryJson" JSONB,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AlertRule" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "thresholdJson" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AlertEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "payloadJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AlertEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");
CREATE UNIQUE INDEX "Page_projectId_url_key" ON "Page"("projectId", "url");

CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");
CREATE INDEX "Project_workspaceId_idx" ON "Project"("workspaceId");
CREATE INDEX "QuerySet_projectId_idx" ON "QuerySet"("projectId");
CREATE INDEX "Query_querySetId_idx" ON "Query"("querySetId");
CREATE INDEX "SerpScan_querySetId_idx" ON "SerpScan"("querySetId");
CREATE INDEX "SerpResult_serpScanId_idx" ON "SerpResult"("serpScanId");
CREATE INDEX "SerpResult_queryId_idx" ON "SerpResult"("queryId");
CREATE INDEX "Page_projectId_idx" ON "Page"("projectId");
CREATE INDEX "PageAudit_pageId_idx" ON "PageAudit"("pageId");
CREATE INDEX "Report_projectId_idx" ON "Report"("projectId");
CREATE INDEX "AlertRule_projectId_idx" ON "AlertRule"("projectId");
CREATE INDEX "AlertEvent_projectId_idx" ON "AlertEvent"("projectId");

ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuerySet" ADD CONSTRAINT "QuerySet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Query" ADD CONSTRAINT "Query_querySetId_fkey" FOREIGN KEY ("querySetId") REFERENCES "QuerySet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SerpScan" ADD CONSTRAINT "SerpScan_querySetId_fkey" FOREIGN KEY ("querySetId") REFERENCES "QuerySet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SerpResult" ADD CONSTRAINT "SerpResult_serpScanId_fkey" FOREIGN KEY ("serpScanId") REFERENCES "SerpScan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SerpResult" ADD CONSTRAINT "SerpResult_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Page" ADD CONSTRAINT "Page_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PageAudit" ADD CONSTRAINT "PageAudit_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
