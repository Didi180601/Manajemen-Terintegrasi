/*
  Warnings:

  - You are about to drop the column `gaji` on the `abk` table. All the data in the column will be lost.
  - You are about to drop the column `namaAbk` on the `gaji` table. All the data in the column will be lost.
  - Added the required column `abk_id` to the `gaji` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "abk" DROP COLUMN "gaji";

-- AlterTable
ALTER TABLE "gaji" DROP COLUMN "namaAbk",
ADD COLUMN     "abk_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "gaji" ADD CONSTRAINT "gaji_abk_id_fkey" FOREIGN KEY ("abk_id") REFERENCES "abk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
