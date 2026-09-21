"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureSessionId } from "@/lib/session";
import { Foot, Position, Prisma } from "@/generated/prisma/client";
import { generateInitialAttributes, generatePotential, overallFor, type Attributes } from "@/lib/game/attributes";
import { computeMarketValue, computeWage } from "@/lib/game/marketValue";
import { growAttributes } from "@/lib/game/progression";
import { simulateCycle } from "@/lib/game/simulateCycle";
import { shouldForceRetire, canRetireVoluntarily } from "@/lib/game/retirement";
import { generateTransferOffers, type OfferTeam, type TransferOffer } from "@/lib/game/transferOffers";
import { pickExtraCampoEvent } from "@/lib/game/extraCampoEvents";
import type { RandomFn } from "@/lib/game/rng";
import { clamp } from "@/lib/game/rng";
import { CYCLE_YEARS } from "@/lib/game/constants";

const rand: RandomFn = Math.random;

function toOfferTeam(team: {
  id: string;
  name: string;
  shortName: string;
  reputation: number;
  colorPrimary: string;
  colorSecondary: string;
  crestShape: number;
  crestInitials: string;
  league: { name: string; tier: number; country: { name: string } };
}): OfferTeam {
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    reputation: team.reputation,
    colorPrimary: team.colorPrimary,
    colorSecondary: team.colorSecondary,
    crestShape: team.crestShape,
    crestInitials: team.crestInitials,
    leagueName: team.league.name,
    leagueTier: team.league.tier,
    countryName: team.league.country.name,
  };
}

export async function createCareer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const countryId = String(formData.get("countryId") ?? "");
  const position = String(formData.get("position") ?? "") as Position;
  const footRaw = String(formData.get("foot") ?? "RIGHT") as Foot;

  if (!name || !countryId || !position) {
    throw new Error("Preencha todos os campos pra começar a carreira.");
  }

  const sessionId = await ensureSessionId();

  await prisma.player.updateMany({
    where: { sessionId, status: "ACTIVE" },
    data: { status: "ABANDONED" },
  });

  const startingTeam = await prisma.team.findFirst({
    where: { league: { tier: 3, countryId } },
    orderBy: { reputation: "asc" },
    skip: Math.floor(rand() * 6),
  });

  const fallbackTeam =
    startingTeam ??
    (await prisma.team.findFirst({ where: { league: { countryId } }, orderBy: { reputation: "asc" } }));

  if (!fallbackTeam) throw new Error("Não há times cadastrados pra esse país. Rode o seed do banco.");

  const attrs = generateInitialAttributes(rand, position);
  const overall = overallFor(position, attrs);
  const potential = generatePotential(rand, overall);
  const reputation = 5;
  const marketValue = computeMarketValue(overall, potential, 16, reputation);
  const wage = computeWage(marketValue, fallbackTeam.reputation);

  const player = await prisma.player.create({
    data: {
      sessionId,
      name,
      countryId,
      position,
      foot: footRaw,
      age: 16,
      status: "ACTIVE",
      ...attrs,
      potential,
      morale: 75,
      fitness: 95,
      reputation,
      marketValue,
      wage,
      currentTeamId: fallbackTeam.id,
    },
  });

  redirect(`/carreira/${player.id}`);
}

export async function advanceCycle(playerId: string) {
  const player = await prisma.player.findUniqueOrThrow({
    where: { id: playerId },
    include: { currentTeam: { include: { league: { include: { country: true } } } } },
  });

  if (player.status !== "ACTIVE") redirect(`/carreira/${playerId}`);
  if (player.pendingSummary) redirect(`/carreira/${playerId}/resultado`);
  if (!player.currentTeam) throw new Error("Jogador sem clube atual.");

  const attrsBefore: Attributes = {
    pace: player.pace,
    shooting: player.shooting,
    passing: player.passing,
    dribbling: player.dribbling,
    defending: player.defending,
    physical: player.physical,
  };
  const overallBefore = overallFor(player.position, attrsBefore);
  const startAge = player.age;
  const endAge = startAge + CYCLE_YEARS;

  const cycle = simulateCycle(rand, {
    position: player.position,
    overall: overallBefore,
    age: startAge,
    teamReputation: player.currentTeam.reputation,
    leagueName: player.currentTeam.league.name,
    leagueTier: player.currentTeam.league.tier,
    morale: player.morale,
    fitness: player.fitness,
  });

  const attrsAfter = growAttributes(rand, attrsBefore, startAge, player.potential, player.morale, player.fitness);
  const overallAfter = overallFor(player.position, attrsAfter);

  const newMorale = clamp(player.morale + cycle.moraleDrift, 5, 100);
  const newFitness = clamp(cycle.fitnessAfter, 20, 100);
  const reputationGain = (cycle.trophies.length > 0 ? 4 : 0) + Math.round((cycle.avgRating - 6.5) * 2.2);
  const newReputation = clamp(player.reputation + reputationGain, 1, 99);
  const newMarketValue = computeMarketValue(overallAfter, player.potential, endAge, newReputation);

  const stage = await prisma.careerStage.create({
    data: {
      playerId: player.id,
      teamId: player.currentTeam.id,
      startAge,
      endAge,
      appearances: cycle.appearances,
      goals: cycle.goals,
      assists: cycle.assists,
      avgRating: Math.round(cycle.avgRating * 100) / 100,
      injuries: cycle.injuries,
      overallAtEnd: overallAfter,
      summary: buildStageSummary(player.currentTeam.name, cycle.appearances, cycle.goals, cycle.assists, cycle.avgRating),
    },
  });

  if (cycle.trophies.length > 0) {
    await prisma.trophy.createMany({
      data: cycle.trophies.map((name) => ({
        playerId: player.id,
        stageId: stage.id,
        teamId: player.currentTeam!.id,
        name,
        age: endAge,
      })),
    });
  }

  const forceRetire = shouldForceRetire(rand, endAge, overallAfter);

  const pendingSummary = {
    stageId: stage.id,
    teamName: player.currentTeam.name,
    startAge,
    endAge,
    appearances: cycle.appearances,
    goals: cycle.goals,
    assists: cycle.assists,
    avgRating: Math.round(cycle.avgRating * 100) / 100,
    injuries: cycle.injuries,
    trophies: cycle.trophies,
    overallBefore,
    overallAfter,
    retired: forceRetire,
  };

  if (forceRetire) {
    await prisma.player.update({
      where: { id: player.id },
      data: {
        ...attrsAfter,
        age: endAge,
        morale: newMorale,
        fitness: newFitness,
        reputation: newReputation,
        marketValue: newMarketValue,
        status: "RETIRED",
        retiredAge: endAge,
        pendingSummary,
        pendingOffers: Prisma.DbNull,
        pendingEvent: Prisma.DbNull,
      },
    });
    redirect(`/carreira/${playerId}/resultado`);
  }

  const candidateTeams = await prisma.team.findMany({
    where: { id: { not: player.currentTeam.id } },
    include: { league: { include: { country: true } } },
  });

  const offers: TransferOffer[] = generateTransferOffers(rand, {
    currentTeam: toOfferTeam(player.currentTeam),
    currentWage: player.wage,
    overall: overallAfter,
    reputation: newReputation,
    marketValue: newMarketValue,
    age: endAge,
    lastAvgRating: cycle.avgRating,
    candidates: candidateTeams.map(toOfferTeam),
  });

  const recentChoices = await prisma.extraCampoChoice.findMany({
    where: { playerId: player.id },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { eventKey: true },
  });

  const event = pickExtraCampoEvent(rand, {
    age: endAge,
    reputation: newReputation,
    recentInjury: cycle.injuries > 0,
    excludeKeys: new Set(recentChoices.map((c) => c.eventKey)),
  });

  await prisma.player.update({
    where: { id: player.id },
    data: {
      ...attrsAfter,
      age: endAge,
      morale: newMorale,
      fitness: newFitness,
      reputation: newReputation,
      marketValue: newMarketValue,
      pendingSummary,
      pendingOffers: offers,
      pendingEvent: {
        key: event.key,
        title: event.title,
        description: event.description,
        options: event.options.map((o) => ({ key: o.key, label: o.label, description: o.description, effects: o.effects })),
      },
    },
  });

  redirect(`/carreira/${playerId}/resultado`);
}

export async function submitDecision(playerId: string, formData: FormData) {
  const offerKey = String(formData.get("offerKey") ?? "");
  const optionKey = String(formData.get("optionKey") ?? "");

  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });
  if (!player.pendingOffers || !player.pendingEvent) redirect(`/carreira/${playerId}`);

  const offers = player.pendingOffers as unknown as TransferOffer[];
  const event = player.pendingEvent as unknown as { key: string; title: string; options: { key: string; label: string; effects: Record<string, unknown> }[] };

  const chosenOffer = offers.find((o) => o.key === offerKey) ?? offers[0];
  const chosenOption = event.options.find((o) => o.key === optionKey) ?? event.options[0];
  const effects = chosenOption.effects as {
    morale?: number;
    reputation?: number;
    fitness?: number;
    marketValuePct?: number;
    wageFlat?: number;
    attribute?: { key: "pace" | "shooting" | "passing" | "dribbling" | "defending" | "physical"; amount: number };
  };

  await prisma.transferRecord.create({
    data: {
      playerId,
      fromTeamId: player.currentTeamId,
      toTeamId: chosenOffer.team.id,
      age: player.age,
      fee: chosenOffer.fee,
      wage: chosenOffer.wage,
      type: chosenOffer.kind === "RENEWAL" ? "RENEWAL" : chosenOffer.kind === "LOAN" ? "LOAN" : "TRANSFER",
    },
  });

  await prisma.extraCampoChoice.create({
    data: {
      playerId,
      age: player.age,
      eventKey: event.key,
      eventTitle: event.title,
      optionKey: chosenOption.key,
      optionLabel: chosenOption.label,
      effects,
    },
  });

  const newMarketValueBase = chosenOffer.kind === "RENEWAL" ? player.marketValue : Math.round(player.marketValue * 1.02);
  const marketValueAfterEvent = Math.round(newMarketValueBase * (1 + (effects.marketValuePct ?? 0) / 100));

  const attrUpdate: Partial<Record<"pace" | "shooting" | "passing" | "dribbling" | "defending" | "physical", number>> = {};
  if (effects.attribute) {
    const current = player[effects.attribute.key];
    attrUpdate[effects.attribute.key] = clamp(current + effects.attribute.amount, 1, 99);
  }

  await prisma.player.update({
    where: { id: playerId },
    data: {
      currentTeamId: chosenOffer.team.id,
      wage: clamp(chosenOffer.wage + (effects.wageFlat ?? 0), 350, 2_200_000),
      morale: clamp(player.morale + (effects.morale ?? 0), 5, 100),
      fitness: clamp(player.fitness + (effects.fitness ?? 0), 20, 100),
      reputation: clamp(player.reputation + (effects.reputation ?? 0), 1, 99),
      marketValue: marketValueAfterEvent,
      pendingSummary: Prisma.DbNull,
      pendingOffers: Prisma.DbNull,
      pendingEvent: Prisma.DbNull,
      ...attrUpdate,
    },
  });

  redirect(`/carreira/${playerId}`);
}

export async function retireNow(playerId: string) {
  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });
  if (player.status !== "ACTIVE" || !canRetireVoluntarily(player.age) || player.pendingSummary) {
    redirect(`/carreira/${playerId}`);
  }

  await prisma.player.update({
    where: { id: playerId },
    data: { status: "RETIRED", retiredAge: player.age },
  });

  redirect(`/carreira/${playerId}/aposentadoria`);
}

function buildStageSummary(teamName: string, appearances: number, goals: number, assists: number, avgRating: number): string {
  return `${appearances} jogos, ${goals} gols e ${assists} assistências pelo ${teamName}, com média de ${avgRating.toFixed(1)}.`;
}
