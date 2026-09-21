import { clamp } from "./rng";

// valor de mercado em milhares de euros
export function computeMarketValue(overall: number, potential: number, age: number, reputation: number): number {
  const overallBase = Math.pow(Math.max(overall - 38, 1), 2.15) * 1.8;
  const potentialBoost = 1 + Math.max(potential - overall, 0) * 0.018;
  const ageMultiplier = ageValueMultiplier(age);
  const reputationMultiplier = 0.75 + (reputation / 100) * 0.6;
  const value = overallBase * potentialBoost * ageMultiplier * reputationMultiplier;
  return Math.round(clamp(value, 15, 250_000));
}

function ageValueMultiplier(age: number): number {
  if (age <= 19) return 1.15;
  if (age <= 23) return 1.3;
  if (age <= 27) return 1.15;
  if (age <= 30) return 0.9;
  if (age <= 33) return 0.55;
  return 0.25;
}

// salário mensal em euros, a partir do valor de mercado (em milhares)
export function computeWage(marketValueK: number, reputation: number): number {
  const wage = marketValueK * (18 + reputation * 0.4);
  return Math.round(clamp(wage, 350, 2_200_000));
}
