-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RevenueEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "orderCost" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shopId" TEXT NOT NULL,
    CONSTRAINT "RevenueEntry_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RevenueEntry" ("amount", "createdAt", "date", "id", "shopId") SELECT "amount", "createdAt", "date", "id", "shopId" FROM "RevenueEntry";
DROP TABLE "RevenueEntry";
ALTER TABLE "new_RevenueEntry" RENAME TO "RevenueEntry";
CREATE UNIQUE INDEX "RevenueEntry_shopId_date_key" ON "RevenueEntry"("shopId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
