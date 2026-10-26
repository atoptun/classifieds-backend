/*
  Warnings:

  - You are about to alter the column `title` on the `Announcement` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `price` on the `Announcement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - Changed the type of `category` on the `Announcement` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('SALE', 'SERVICE', 'JOB', 'OTHER');

-- AlterTable
ALTER TABLE "Announcement" ALTER COLUMN "title" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
DROP COLUMN "category",
ADD COLUMN     "category" "Category" NOT NULL;
