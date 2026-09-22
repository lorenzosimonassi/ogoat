import { Position } from "@/generated/prisma/client";
import { ATTRIBUTE_KEYS, POSITION_WEIGHTS } from "./constants";
import { clamp, randInt, type RandomFn } from "./rng";

export type Attributes = {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
};

export function overallFor(position: Position, attrs: Attributes): number {
  const weights = POSITION_WEIGHTS[position];
  const raw = ATTRIBUTE_KEYS.reduce((sum, key) => sum + attrs[key] * weights[key], 0);
  return Math.round(clamp(raw, 1, 99));
}

// 16 anos: todo jogador começa com OVR 50 — só varia a "forma" dos atributos
// (mais rápido, mais técnico etc.), nunca o total.
export function generateInitialAttributes(rand: RandomFn, position: Position): Attributes {
  const weights = POSITION_WEIGHTS[position];
  const base: Attributes = {
    pace: randInt(rand, 40, 60),
    shooting: randInt(rand, 35, 55),
    passing: randInt(rand, 38, 58),
    dribbling: randInt(rand, 38, 60),
    defending: randInt(rand, 35, 55),
    physical: randInt(rand, 42, 62),
  };
  for (const key of ATTRIBUTE_KEYS) {
    if (weights[key] >= 0.25) {
      base[key] = clamp(base[key] + randInt(rand, 3, 8), 1, 80);
    }
  }
  return applyOvrDelta(base, 50 - overallFor(position, base));
}

export function generatePotential(rand: RandomFn, currentOverall: number): number {
  // teto acima do overall inicial (50) — a maioria vira um jogador bom a ótimo,
  // com chance real de virar craque mundial (90+) e uma fatia menor de carreira mais modesta
  const roll = rand();
  let ceiling: number;
  if (roll < 0.15) ceiling = randInt(rand, 10, 20); // 60-70: discreto
  else if (roll < 0.55) ceiling = randInt(rand, 20, 32); // 70-82: bom profissional
  else if (roll < 0.85) ceiling = randInt(rand, 32, 42); // 82-92: craque
  else ceiling = randInt(rand, 42, 49); // 92-99: fenômeno
  return clamp(currentOverall + ceiling, 1, 99);
}

// aplica um delta uniforme em todos os atributos — como os pesos por posição somam 1,
// o OVR resultante se move exatamente por `delta` (respeitados os limites 1-99)
export function applyOvrDelta(attrs: Attributes, delta: number): Attributes {
  const next = { ...attrs };
  for (const key of ATTRIBUTE_KEYS) next[key] = clamp(attrs[key] + delta, 1, 99);
  return next;
}

export function potentialStars(potential: number): number {
  if (potential < 55) return 1;
  if (potential < 68) return 2;
  if (potential < 80) return 3;
  if (potential < 90) return 4;
  return 5;
}
