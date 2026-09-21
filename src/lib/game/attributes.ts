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

// 16 anos: base baixa (revelação da base), com um leve boost no atributo-chave da posição
export function generateInitialAttributes(rand: RandomFn, position: Position): Attributes {
  const weights = POSITION_WEIGHTS[position];
  const base: Attributes = {
    pace: randInt(rand, 32, 52),
    shooting: randInt(rand, 25, 48),
    passing: randInt(rand, 30, 50),
    dribbling: randInt(rand, 30, 52),
    defending: randInt(rand, 25, 48),
    physical: randInt(rand, 35, 55),
  };
  for (const key of ATTRIBUTE_KEYS) {
    if (weights[key] >= 0.25) {
      base[key] = clamp(base[key] + randInt(rand, 4, 10), 1, 70);
    }
  }
  return base;
}

export function generatePotential(rand: RandomFn, currentOverall: number): number {
  // teto entre +8 e +45 acima do overall inicial, com viés pra faixa "boa promessa"
  const roll = rand();
  let ceiling: number;
  if (roll < 0.5) ceiling = randInt(rand, 8, 20);
  else if (roll < 0.82) ceiling = randInt(rand, 20, 32);
  else if (roll < 0.96) ceiling = randInt(rand, 32, 42);
  else ceiling = randInt(rand, 42, 50);
  return clamp(currentOverall + ceiling, 1, 99);
}

export function potentialStars(potential: number): number {
  if (potential < 55) return 1;
  if (potential < 68) return 2;
  if (potential < 80) return 3;
  if (potential < 90) return 4;
  return 5;
}
