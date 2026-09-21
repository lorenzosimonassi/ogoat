import { Position } from "@/generated/prisma/client";

export const START_AGE = 16;
export const CYCLE_YEARS = 2;
export const VOLUNTARY_RETIREMENT_AGE = 32;
export const FORCED_RETIREMENT_AGE = 40;

export const POSITION_LABEL: Record<Position, string> = {
  GOL: "Goleiro",
  ZAG: "Zagueiro",
  LAT: "Lateral",
  VOL: "Volante",
  MEI: "Meia",
  PON: "Ponta",
  ATA: "Atacante",
};

export const POSITION_SHORT: Record<Position, string> = {
  GOL: "GOL",
  ZAG: "ZAG",
  LAT: "LAT",
  VOL: "VOL",
  MEI: "MEI",
  PON: "PON",
  ATA: "ATA",
};

export const POSITIONS: Position[] = ["GOL", "ZAG", "LAT", "VOL", "MEI", "PON", "ATA"];

// peso de cada atributo (0-1) na nota geral (overall), por posição
export const POSITION_WEIGHTS: Record<
  Position,
  { pace: number; shooting: number; passing: number; dribbling: number; defending: number; physical: number }
> = {
  GOL: { pace: 0.05, shooting: 0, passing: 0.1, dribbling: 0.05, defending: 0.5, physical: 0.3 },
  ZAG: { pace: 0.15, shooting: 0, passing: 0.15, dribbling: 0.05, defending: 0.45, physical: 0.2 },
  LAT: { pace: 0.25, shooting: 0.05, passing: 0.2, dribbling: 0.1, defending: 0.3, physical: 0.1 },
  VOL: { pace: 0.1, shooting: 0.05, passing: 0.3, dribbling: 0.1, defending: 0.3, physical: 0.15 },
  MEI: { pace: 0.15, shooting: 0.15, passing: 0.35, dribbling: 0.25, defending: 0.05, physical: 0.05 },
  PON: { pace: 0.3, shooting: 0.2, passing: 0.1, dribbling: 0.3, defending: 0.02, physical: 0.08 },
  ATA: { pace: 0.2, shooting: 0.4, passing: 0.05, dribbling: 0.2, defending: 0, physical: 0.15 },
};

export const ATTRIBUTE_LABEL = {
  pace: "Ritmo",
  shooting: "Finalização",
  passing: "Passe",
  dribbling: "Drible",
  defending: "Defesa",
  physical: "Físico",
} as const;

export type AttributeKey = keyof typeof ATTRIBUTE_LABEL;
export const ATTRIBUTE_KEYS: AttributeKey[] = [
  "pace",
  "shooting",
  "passing",
  "dribbling",
  "defending",
  "physical",
];

export const TEAM_COLOR_PALETTE: [string, string][] = [
  ["#16a34a", "#0a0a0a"],
  ["#15803d", "#f5f5f5"],
  ["#166534", "#eab308"],
  ["#0a0a0a", "#22c55e"],
  ["#1f2937", "#4ade80"],
  ["#052e16", "#bbf7d0"],
  ["#065f46", "#f5f5f5"],
  ["#111827", "#facc15"],
  ["#14532d", "#e2e8f0"],
  ["#0f172a", "#34d399"],
  ["#7f1d1d", "#f5f5f5"],
  ["#1e3a8a", "#f5f5f5"],
  ["#78350f", "#f5f5f5"],
  ["#4c0519", "#e2e8f0"],
  ["#312e81", "#e2e8f0"],
];
