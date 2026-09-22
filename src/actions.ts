"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureSessionId } from "@/lib/session";
import { Foot, Position, Prisma } from "@/generated/prisma/client";
import { generateInitialAttributes, generatePotential, overallFor, applyOvrDelta, type Attributes } from "@/lib/game/attributes";
import { computeMarketValue } from "@/lib/game/marketValue";
import { growAttributes } from "@/lib/game/progression";
import { simulateCycle } from "@/lib/game/simulateCycle";
import { shouldForceRetire, canRetireVoluntarily } from "@/lib/game/retirement";
import { generateInitialOffers, generateTransferOffers, type OfferTeam } from "@/lib/game/transferOffers";
import { pickExtraCampoEvent } from "@/lib/game/extraCampoEvents";
import { rollNextDecisionType, type PendingDecision } from "@/lib/game/decision";
import type { RandomFn } from "@/lib/game/rng";
import { clamp, randInt } from "@/lib/game/rng";
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
  crestUrl: string | null;
  league: { name: string; tier: number; country: { name: string; flag: string; code: string } };
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
    crestUrl: team.crestUrl,
    leagueName: team.league.name,
    leagueTier: team.league.tier,
    countryName: team.league.country.name,
    countryFlag: team.league.country.flag,
    countryCode: team.league.country.code,
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

  const attrs = generateInitialAttributes(rand, position);
  const overall = overallFor(position, attrs);
  const potential = generatePotential(rand, overall);
  const reputation = 5;
  const marketValue = computeMarketValue(overall, potential, 16, reputation);

  const candidateTeams = await prisma.team.findMany({
    where: { league: { countryId } },
    include: { league: { include: { country: true } } },
  });
  if (candidateTeams.length === 0) throw new Error("Não há times cadastrados pra esse país. Rode `npx prisma db seed`.");

  const offers = generateInitialOffers(rand, { overall, candidates: candidateTeams.map(toOfferTeam) });

  const pendingDecision: PendingDecision = {
    type: "TRANSFER",
    heading: "Oferta de base",
    subheading: "Três clubes querem te incluir no projeto de base. Escolha onde sua carreira começa.",
    offers,
  };

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
      wage: 0,
      shirtNumber: randInt(rand, 1, 99),
      currentTeamId: null,
      pendingDecision,
    },
  });

  redirect(`/carreira/${player.id}`);
}

export async function submitDecision(playerId: string, formData: FormData) {
  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });
  if (player.status !== "ACTIVE" || !player.pendingDecision) redirect(`/carreira/${playerId}`);

  const decision = player.pendingDecision as unknown as PendingDecision;

  let attrs: Attributes = {
    pace: player.pace,
    shooting: player.shooting,
    passing: player.passing,
    dribbling: player.dribbling,
    defending: player.defending,
    physical: player.physical,
  };
  let currentTeamId = player.currentTeamId;
  let wage = player.wage;

  if (decision.type === "TRANSFER") {
    const offerKey = String(formData.get("offerKey") ?? "");
    const chosenOffer = decision.offers.find((o) => o.key === offerKey) ?? decision.offers[0];

    await prisma.transferRecord.create({
      data: {
        playerId,
        fromTeamId: currentTeamId,
        toTeamId: chosenOffer.team.id,
        age: player.age,
        fee: chosenOffer.fee,
        wage: chosenOffer.wage,
        type:
          chosenOffer.kind === "BASE"
            ? "YOUTH_PROMOTION"
            : chosenOffer.kind === "RENEWAL"
              ? "RENEWAL"
              : chosenOffer.kind === "LOAN"
                ? "LOAN"
                : "TRANSFER",
      },
    });

    currentTeamId = chosenOffer.team.id;
    wage = chosenOffer.wage;
  } else {
    const optionKey = String(formData.get("optionKey") ?? "");
    const chosenOption = decision.options.find((o) => o.key === optionKey) ?? decision.options[0];

    attrs = applyOvrDelta(attrs, chosenOption.ovrDelta);

    await prisma.extraCampoChoice.create({
      data: {
        playerId,
        age: player.age,
        eventKey: decision.key,
        eventTitle: decision.title,
        optionKey: chosenOption.key,
        optionLabel: chosenOption.label,
        effects: { ovrDelta: chosenOption.ovrDelta },
      },
    });
  }

  const team = await prisma.team.findUniqueOrThrow({
    where: { id: currentTeamId! },
    include: { league: { include: { country: true } } },
  });

  const startAge = player.age;
  const endAge = startAge + CYCLE_YEARS;
  const overallForCycle = overallFor(player.position, attrs);

  const cycle = simulateCycle(rand, {
    position: player.position,
    overall: overallForCycle,
    age: startAge,
    teamReputation: team.reputation,
    leagueName: team.league.name,
    leagueTier: team.league.tier,
    morale: player.morale,
    fitness: player.fitness,
  });

  const attrsAfter = growAttributes(rand, attrs, player.position, startAge, player.potential, player.morale, player.fitness);
  const overallAfter = overallFor(player.position, attrsAfter);

  const newMorale = clamp(player.morale + cycle.moraleDrift, 5, 100);
  const newFitness = clamp(cycle.fitnessAfter, 20, 100);
  const reputationGain = (cycle.trophies.length > 0 ? 4 : 0) + Math.round((cycle.avgRating - 6.5) * 2.2);
  const newReputation = clamp(player.reputation + reputationGain, 1, 99);
  const newMarketValue = computeMarketValue(overallAfter, player.potential, endAge, newReputation);

  const stage = await prisma.careerStage.create({
    data: {
      playerId,
      teamId: team.id,
      startAge,
      endAge,
      appearances: cycle.appearances,
      goals: cycle.goals,
      assists: cycle.assists,
      avgRating: Math.round(cycle.avgRating * 100) / 100,
      injuries: cycle.injuries,
      overallAtEnd: overallAfter,
      summary: buildStageSummary(team.name, cycle.appearances, cycle.goals, cycle.assists, cycle.avgRating),
    },
  });

  if (cycle.trophies.length > 0) {
    await prisma.trophy.createMany({
      data: cycle.trophies.map((name) => ({ playerId, stageId: stage.id, teamId: team.id, name, age: endAge })),
    });
  }

  const forceRetire = shouldForceRetire(rand, endAge, overallAfter);

  if (forceRetire) {
    await prisma.player.update({
      where: { id: playerId },
      data: {
        ...attrsAfter,
        age: endAge,
        morale: newMorale,
        fitness: newFitness,
        reputation: newReputation,
        marketValue: newMarketValue,
        currentTeamId,
        wage,
        status: "RETIRED",
        retiredAge: endAge,
        pendingDecision: Prisma.DbNull,
      },
    });
    redirect(`/carreira/${playerId}`);
  }

  const nextType = rollNextDecisionType(rand);
  let nextDecision: PendingDecision;

  if (nextType === "TRANSFER") {
    const candidateTeams = await prisma.team.findMany({
      where: { id: { not: team.id } },
      include: { league: { include: { country: true } } },
    });
    const offers = generateTransferOffers(rand, {
      currentTeam: toOfferTeam(team),
      currentWage: wage,
      overall: overallAfter,
      reputation: newReputation,
      marketValue: newMarketValue,
      age: endAge,
      lastAvgRating: cycle.avgRating,
      candidates: candidateTeams.map(toOfferTeam),
    });
    nextDecision = {
      type: "TRANSFER",
      heading: "Janela de transferências",
      subheading: "Chegaram ofertas depois do seu último trecho de carreira. Você pode aceitar uma ou ficar no clube.",
      offers,
    };
  } else {
    const recentChoices = await prisma.extraCampoChoice.findMany({
      where: { playerId },
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
    nextDecision = {
      type: "EXTRA_CAMPO",
      key: event.key,
      title: event.title,
      description: event.description,
      options: event.options.map((o) => ({ key: o.key, label: o.label, description: o.description, ovrDelta: o.ovrDelta })),
    };
  }

  await prisma.player.update({
    where: { id: playerId },
    data: {
      ...attrsAfter,
      age: endAge,
      morale: newMorale,
      fitness: newFitness,
      reputation: newReputation,
      marketValue: newMarketValue,
      currentTeamId,
      wage,
      pendingDecision: nextDecision,
    },
  });

  redirect(`/carreira/${playerId}`);
}

export async function retireNow(playerId: string) {
  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });
  if (player.status !== "ACTIVE" || !canRetireVoluntarily(player.age)) {
    redirect(`/carreira/${playerId}`);
  }

  await prisma.player.update({
    where: { id: playerId },
    data: { status: "RETIRED", retiredAge: player.age, pendingDecision: Prisma.DbNull },
  });

  redirect(`/carreira/${playerId}`);
}

function buildStageSummary(teamName: string, appearances: number, goals: number, assists: number, avgRating: number): string {
  return `${appearances} jogos, ${goals} gols e ${assists} assistências pelo ${teamName}, com média de ${avgRating.toFixed(1)}.`;
}
