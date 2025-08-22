-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_resetToken_idx" ON "User"("resetToken");

-- CreateIndex
CREATE INDEX "User_resetTokenExpiry_idx" ON "User"("resetTokenExpiry");
