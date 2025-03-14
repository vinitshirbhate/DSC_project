/*
  Warnings:

  - You are about to drop the column `accessToken` on the `Blacklist` table. All the data in the column will be lost.
  - You are about to drop the column `refershToken` on the `Blacklist` table. All the data in the column will be lost.
  - Added the required column `token` to the `Blacklist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blacklist" DROP COLUMN "accessToken",
DROP COLUMN "refershToken",
ADD COLUMN     "token" TEXT NOT NULL;
