-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "photo" TEXT,
ADD COLUMN     "photoId" TEXT;

-- CreateIndex
CREATE INDEX "Announcement_userId_idx" ON "Announcement"("userId");
