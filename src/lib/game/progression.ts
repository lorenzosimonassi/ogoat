import { ATTRIBUTE_KEYS } from "./constants";
import { clamp, randInt, type RandomFn } from "./rng";
import type { Attributes } from "./attributes";

// faixa de variação de crescimento (pode ser negativa = declínio) por atributo, por faixa de idade,
// aplicada ao fim de cada ciclo de 2 anos (idade = idade ANTES do envelhecimento)
function growthRangeForAge(age: number): [number, number] {
  if (age < 20) return [3, 8];
  if (age < 24) return [1, 6];
  if (age < 28) return [-1, 3];
  if (age < 31) return [-3, 1];
  if (age < 34) return [-5, -1];
  return [-8, -3];
}

export function growAttributes(
  rand: RandomFn,
  attrs: Attributes,
  age: number,
  potential: number,
  morale: number,
  fitness: number,
): Attributes {
  const [min, max] = growthRangeForAge(age);
  const moraleFactor = clamp(0.7 + (morale / 100) * 0.6, 0.6, 1.3);
  const fitnessFactor = clamp(0.75 + (fitness / 100) * 0.5, 0.7, 1.25);

  const next = { ...attrs };
  for (const key of ATTRIBUTE_KEYS) {
    let delta = randInt(rand, min, max);
    if (delta > 0) {
      const room = clamp(potential - attrs[key], 0, 99);
      const roomFactor = room <= 0 ? 0.15 : clamp(room / 20, 0.2, 1.4);
      delta = Math.round(delta * moraleFactor * fitnessFactor * roomFactor);
    }
    next[key] = clamp(attrs[key] + delta, 1, 99);
  }
  return next;
}
