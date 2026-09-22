import { Position } from "@/generated/prisma/client";
import { clamp, randFloat, randInt, type RandomFn } from "./rng";

const GOAL_RATE_BY_POSITION: Record<Position, number> = {
  GOL: 0.002,
  ZAG: 0.05,
  LAT: 0.06,
  VOL: 0.08,
  MEI: 0.16,
  PON: 0.28,
  ATA: 0.42,
};

const ASSIST_RATE_BY_POSITION: Record<Position, number> = {
  GOL: 0.002,
  ZAG: 0.04,
  LAT: 0.14,
  VOL: 0.12,
  MEI: 0.22,
  PON: 0.24,
  ATA: 0.16,
};

const CLEAN_SHEET_TROPHY_RATE: Record<Position, number> = {
  GOL: 1,
  ZAG: 0.6,
  LAT: 0.3,
  VOL: 0.1,
  MEI: 0.05,
  PON: 0.05,
  ATA: 0.02,
};

// ~2 temporadas de até ~55 jogos cada (liga + copas nacionais + competição continental
// pra quem é titular absoluto de um time grande) — bem menos pra reservas e pra base
const MAX_GAMES_PER_CYCLE = 110;

export type CycleResult = {
  appearances: number;
  goals: number;
  assists: number;
  avgRating: number;
  injuries: number;
  trophies: string[];
  moraleDrift: number;
  fitnessAfter: number;
};

export function simulateCycle(
  rand: RandomFn,
  opts: {
    position: Position;
    overall: number;
    age: number;
    teamReputation: number;
    leagueName: string;
    leagueTier: number;
    morale: number;
    fitness: number;
  },
): CycleResult {
  const { position, overall, age, teamReputation, leagueName, morale, fitness } = opts;

  const gap = overall - teamReputation; // positivo = jogador é melhor que o nível do time
  const ageFactor = age < 18 ? 0.55 : age < 20 ? 0.75 : age > 34 ? 0.6 : 1;
  const moraleFactor = clamp(0.7 + (morale / 100) * 0.5, 0.6, 1.2);

  let injuries = 0;
  let missedGames = 0;
  const injuryChance = clamp(0.1 + (100 - opts.fitness) * 0.003 + (age > 30 ? 0.06 : 0), 0.03, 0.45);
  if (rand() < injuryChance) {
    injuries = randInt(rand, 1, age > 30 ? 3 : 2);
    missedGames = injuries * randInt(rand, 4, 12);
  }

  // quanto maior o OVR (em relação ao nível do time), mais minutos — a diferença entre
  // ser reserva e titular indiscutível fica bem mais marcada
  const minutesShare = clamp(0.3 + gap / 90 + (moraleFactor - 1) * 0.3, 0.05, 0.98) * ageFactor;
  const appearances = clamp(Math.round(MAX_GAMES_PER_CYCLE * minutesShare) - missedGames, 0, MAX_GAMES_PER_CYCLE);

  // produção (gols/assistências) escala com o OVR absoluto, não só com o gap pro time —
  // um jogador de 90 OVR claramente produz muito mais que um de 50, em qualquer time
  const productionMultiplier = clamp(0.55 + (overall - 50) / 40, 0.3, 2.2);
  const goalRate = GOAL_RATE_BY_POSITION[position] * productionMultiplier;
  const assistRate = ASSIST_RATE_BY_POSITION[position] * productionMultiplier;
  const goals = Math.round(appearances * goalRate * randFloat(rand, 0.7, 1.35));
  const assists = Math.round(appearances * assistRate * randFloat(rand, 0.7, 1.35));

  const ratingBase = 6.1 + gap / 45 + (moraleFactor - 1) * 0.6;
  const avgRating = clamp(ratingBase + randFloat(rand, -0.35, 0.35), 4.8, 9.4);

  const fitnessAfter = clamp(fitness - injuries * 8 + randInt(rand, -4, 6), 25, 100);
  const moraleDrift = randInt(rand, -6, avgRating >= 7.3 ? 12 : 4);

  const trophies: string[] = [];
  if (appearances >= MAX_GAMES_PER_CYCLE * 0.35) {
    const titleChance = clamp(0.1 + (teamReputation - 40) / 120 + (avgRating - 6.5) / 15, 0.02, 0.55);
    if (rand() < titleChance) trophies.push(`Campeão(ã) — ${leagueName}`);

    if (goals >= 14 && rand() < 0.3 + goalRate) trophies.push(`Artilheiro(a) — ${leagueName}`);

    if (avgRating >= 8.1 && rand() < 0.25) trophies.push(`Craque da Temporada`);

    if (rand() < CLEAN_SHEET_TROPHY_RATE[position] * 0.12 && avgRating >= 7.4) {
      trophies.push(`Melhor Defesa da Liga`);
    }
  }

  return { appearances, goals, assists, avgRating, injuries, trophies, moraleDrift, fitnessAfter };
}
