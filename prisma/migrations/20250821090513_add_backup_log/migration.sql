/*
  Warnings:

  - You are about to drop the column `resetToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiry` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExpiry";

-- CreateTable
CREATE TABLE "BackupLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "filePath" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BackupLog_type_idx" ON "BackupLog"("type");

-- CreateIndex
CREATE INDEX "BackupLog_status_idx" ON "BackupLog"("status");

-- CreateIndex
CREATE INDEX "BackupLog_createdAt_idx" ON "BackupLog"("createdAt");
