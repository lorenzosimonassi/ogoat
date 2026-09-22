/*
  Warnings:

  - You are about to drop the column `pendingEvent` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `pendingOffers` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `pendingSummary` on the `players` table. All the data in the column will be lost.
  - Added the required column `shirtNumber` to the `players` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "players" DROP COLUMN "pendingEvent",
DROP COLUMN "pendingOffers",
DROP COLUMN "pendingSummary",
ADD COLUMN     "pendingDecision" JSONB,
ADD COLUMN     "shirtNumber" INTEGER NOT NULL;
