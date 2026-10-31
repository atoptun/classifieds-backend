/*
  Warnings:

  - You are about to drop the column `photo` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `photoId` on the `Announcement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Announcement" 
DROP COLUMN "photo",
DROP COLUMN "photoId",
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "imageUrl" TEXT;
