-- DropForeignKey
ALTER TABLE "Scan" DROP CONSTRAINT "Scan_querySetId_fkey";

-- DropForeignKey
ALTER TABLE "ScanResult" DROP CONSTRAINT "ScanResult_queryId_fkey";

-- DropForeignKey
ALTER TABLE "ScanResult" DROP CONSTRAINT "ScanResult_scanId_fkey";

-- AlterTable
ALTER TABLE "Scan" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ScanResult" ALTER COLUMN "id" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_querySetId_fkey" FOREIGN KEY ("querySetId") REFERENCES "QuerySet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanResult" ADD CONSTRAINT "ScanResult_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanResult" ADD CONSTRAINT "ScanResult_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
