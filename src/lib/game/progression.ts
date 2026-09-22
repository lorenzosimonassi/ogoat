import type { Position } from "@/generated/prisma/client";
import { clamp, randFloat, randInt, type RandomFn } from "./rng";
import { applyOvrDelta, overallFor, type Attributes } from "./attributes";

// fração do gap-até-o-potencial fechada em cada ciclo de 2 anos — alto na base/começo de
// carreira, cai perto do prime (onde o jogador já chegou perto do teto e só oscila)
function growthPaceForAge(age: number): number {
  if (age < 18) return 0.3;
  if (age < 20) return 0.34;
  if (age < 22) return 0.3;
  if (age < 24) return 0.26;
  if (age < 26) return 0.16;
  if (age < 28) return 0.1;
  return 0.06; // 28-30: já perto do potencial, últimos ajustes finos
}

// prime (até 30) é estável; depois disso o corpo cobra — declínio acelera com a idade
function declineRangeForAge(age: number): [number, number] {
  if (age < 32) return [-1, 1];
  if (age < 34) return [-3, -1];
  if (age < 36) return [-4, -1];
  if (age < 38) return [-7, -3];
  return [-9, -4];
}

export function growAttributes(
  rand: RandomFn,
  attrs: Attributes,
  position: Position,
  age: number,
  potential: number,
  morale: number,
  fitness: number,
): Attributes {
  const currentOverall = overallFor(position, attrs);
  let delta: number;

  if (age < 30) {
    const gap = potential - currentOverall;
    const pace = growthPaceForAge(age);
    const variance = randFloat(rand, 0.5, 1.7); // % de evoluir muito ou pouco no ciclo
    delta = Math.round(gap * pace * variance);
    if (rand() < 0.1) delta += randInt(rand, 3, 8); // salto de temporada (disparada)
    if (rand() < 0.08) delta -= randInt(rand, 2, 5); // ciclo ruim / lesão atrapalhando
  } else {
    const [min, max] = declineRangeForAge(age);
    delta = randInt(rand, min, max);
  }

  if (delta > 0) {
    const moraleFactor = clamp(0.85 + (morale / 100) * 0.3, 0.8, 1.15);
    const fitnessFactor = clamp(0.85 + (fitness / 100) * 0.25, 0.8, 1.1);
    delta = Math.round(delta * moraleFactor * fitnessFactor);
  }

  return applyOvrDelta(attrs, delta);
}
