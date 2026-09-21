-- CreateEnum
CREATE TYPE "position" AS ENUM ('GOL', 'ZAG', 'LAT', 'VOL', 'MEI', 'PON', 'ATA');

-- CreateEnum
CREATE TYPE "foot" AS ENUM ('LEFT', 'RIGHT', 'BOTH');

-- CreateEnum
CREATE TYPE "player_status" AS ENUM ('ACTIVE', 'RETIRED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "transfer_type" AS ENUM ('TRANSFER', 'RENEWAL', 'FREE', 'LOAN', 'YOUTH_PROMOTION');

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "flag" TEXT NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leagues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "reputation" INTEGER NOT NULL,
    "colorPrimary" TEXT NOT NULL,
    "colorSecondary" TEXT NOT NULL,
    "crestShape" INTEGER NOT NULL,
    "crestInitials" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "position" "position" NOT NULL,
    "foot" "foot" NOT NULL,
    "age" INTEGER NOT NULL DEFAULT 16,
    "status" "player_status" NOT NULL DEFAULT 'ACTIVE',
    "pace" INTEGER NOT NULL,
    "shooting" INTEGER NOT NULL,
    "passing" INTEGER NOT NULL,
    "dribbling" INTEGER NOT NULL,
    "defending" INTEGER NOT NULL,
    "physical" INTEGER NOT NULL,
    "potential" INTEGER NOT NULL,
    "morale" INTEGER NOT NULL DEFAULT 70,
    "fitness" INTEGER NOT NULL DEFAULT 95,
    "reputation" INTEGER NOT NULL DEFAULT 5,
    "marketValue" INTEGER NOT NULL DEFAULT 0,
    "wage" INTEGER NOT NULL DEFAULT 0,
    "currentTeamId" TEXT,
    "retiredAge" INTEGER,
    "pendingSummary" JSONB,
    "pendingOffers" JSONB,
    "pendingEvent" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_stages" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "startAge" INTEGER NOT NULL,
    "endAge" INTEGER NOT NULL,
    "appearances" INTEGER NOT NULL,
    "goals" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "avgRating" DOUBLE PRECISION NOT NULL,
    "injuries" INTEGER NOT NULL DEFAULT 0,
    "overallAtEnd" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_records" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "fromTeamId" TEXT,
    "toTeamId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "wage" INTEGER NOT NULL,
    "type" "transfer_type" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transfer_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extra_campo_choices" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "eventKey" TEXT NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "optionKey" TEXT NOT NULL,
    "optionLabel" TEXT NOT NULL,
    "effects" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extra_campo_choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trophies" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "stageId" TEXT,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trophies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_name_key" ON "countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "leagues_countryId_tier_key" ON "leagues"("countryId", "tier");

-- CreateIndex
CREATE INDEX "players_sessionId_idx" ON "players"("sessionId");

-- CreateIndex
CREATE INDEX "career_stages_playerId_idx" ON "career_stages"("playerId");

-- CreateIndex
CREATE INDEX "transfer_records_playerId_idx" ON "transfer_records"("playerId");

-- CreateIndex
CREATE INDEX "extra_campo_choices_playerId_idx" ON "extra_campo_choices"("playerId");

-- CreateIndex
CREATE INDEX "trophies_playerId_idx" ON "trophies"("playerId");

-- AddForeignKey
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_currentTeamId_fkey" FOREIGN KEY ("currentTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_stages" ADD CONSTRAINT "career_stages_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_stages" ADD CONSTRAINT "career_stages_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_records" ADD CONSTRAINT "transfer_records_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_records" ADD CONSTRAINT "transfer_records_fromTeamId_fkey" FOREIGN KEY ("fromTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_records" ADD CONSTRAINT "transfer_records_toTeamId_fkey" FOREIGN KEY ("toTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extra_campo_choices" ADD CONSTRAINT "extra_campo_choices_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trophies" ADD CONSTRAINT "trophies_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trophies" ADD CONSTRAINT "trophies_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "career_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trophies" ADD CONSTRAINT "trophies_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
