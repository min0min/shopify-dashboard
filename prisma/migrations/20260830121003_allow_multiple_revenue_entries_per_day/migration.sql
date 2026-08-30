-- DropIndex
DROP INDEX "RevenueEntry_shopId_date_key";

-- CreateIndex
CREATE INDEX "RevenueEntry_shopId_date_idx" ON "RevenueEntry"("shopId", "date");
