-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('queued', 'running', 'done', 'failed');

-- CreateTable
CREATE TABLE "Scan" (
    "id" UUID NOT NULL,
    "querySetId" UUID NOT NULL,
    "status" "ScanStatus" NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanResult" (
    "id" UUID NOT NULL,
    "scanId" UUID NOT NULL,
    "queryId" UUID NOT NULL,
    "aiPresence" BOOLEAN NOT NULL,
    "brandMentioned" BOOLEAN NOT NULL,
    "yourUrlCited" BOOLEAN NOT NULL,
    "citedUrls" JSONB,
    "notes" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scan_querySetId_idx" ON "Scan"("querySetId");

-- CreateIndex
CREATE INDEX "ScanResult_scanId_idx" ON "ScanResult"("scanId");

-- CreateIndex
CREATE INDEX "ScanResult_queryId_idx" ON "ScanResult"("queryId");

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_querySetId_fkey" FOREIGN KEY ("querySetId") REFERENCES "QuerySet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanResult" ADD CONSTRAINT "ScanResult_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanResult" ADD CONSTRAINT "ScanResult_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
