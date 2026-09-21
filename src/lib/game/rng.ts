// PRNG determinístico (mulberry32) — usado no seed pra gerar sempre o mesmo mundo,
// e disponível em runtime pra qualquer simulação que precise ser reproduzível.
export function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type RandomFn = () => number;

export function randInt(rand: RandomFn, min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function randFloat(rand: RandomFn, min: number, max: number) {
  return rand() * (max - min) + min;
}

export function pick<T>(rand: RandomFn, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function pickWeighted<T>(rand: RandomFn, entries: [T, number][]): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rand() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

export function shuffle<T>(rand: RandomFn, arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
