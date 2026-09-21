import { FORCED_RETIREMENT_AGE, VOLUNTARY_RETIREMENT_AGE } from "./constants";
import { clamp, type RandomFn } from "./rng";

export function canRetireVoluntarily(age: number): boolean {
  return age >= VOLUNTARY_RETIREMENT_AGE;
}

export function shouldForceRetire(rand: RandomFn, age: number, overall: number): boolean {
  if (age >= FORCED_RETIREMENT_AGE) return true;
  if (age >= 34) {
    const chance = clamp((age - 33) * 0.16 + (55 - overall) * 0.012, 0, 0.92);
    return rand() < chance;
  }
  return false;
}
