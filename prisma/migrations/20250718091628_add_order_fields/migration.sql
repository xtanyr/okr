-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OKR" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OKR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "okrId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "keyInitiatives" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyResult" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "base" DOUBLE PRECISION NOT NULL,
    "plan" DOUBLE PRECISION NOT NULL,
    "formula" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "KeyResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyMonitoringEntry" (
    "id" TEXT NOT NULL,
    "keyResultId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WeeklyMonitoringEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "OKR" ADD CONSTRAINT "OKR_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_okrId_fkey" FOREIGN KEY ("okrId") REFERENCES "OKR"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResult" ADD CONSTRAINT "KeyResult_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyMonitoringEntry" ADD CONSTRAINT "WeeklyMonitoringEntry_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "KeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
