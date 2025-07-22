/*
  Warnings:

  - A unique constraint covering the columns `[keyResultId,weekNumber]` on the table `WeeklyMonitoringEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WeeklyMonitoringEntry_keyResultId_weekNumber_key" ON "WeeklyMonitoringEntry"("keyResultId", "weekNumber");
