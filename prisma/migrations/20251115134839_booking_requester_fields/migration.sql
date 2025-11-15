-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "googleEventId" TEXT,
    "googleCalendarId" TEXT,
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT,
    "approvedById" TEXT,
    "requesterName" TEXT NOT NULL DEFAULT '',
    "requesterEmail" TEXT NOT NULL DEFAULT '',
    "requesterPhone" TEXT,
    CONSTRAINT "Booking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("approvedById", "createdAt", "createdById", "endDate", "googleCalendarId", "googleEventId", "id", "lastSyncedAt", "notes", "requesterEmail", "requesterName", "requesterPhone", "startDate", "status", "title", "updatedAt")
SELECT "approvedById", "createdAt", "createdById", "endDate", "googleCalendarId", "googleEventId", "id", "lastSyncedAt", "notes", '' AS "requesterEmail", '' AS "requesterName", NULL AS "requesterPhone", "startDate", "status", "title", "updatedAt"
FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_googleEventId_key" ON "Booking"("googleEventId");
CREATE INDEX "Booking_startDate_idx" ON "Booking"("startDate");
CREATE INDEX "Booking_endDate_idx" ON "Booking"("endDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
