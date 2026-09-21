import { computeWage } from "./marketValue";
import { clamp, randFloat, shuffle, type RandomFn } from "./rng";

export type OfferTeam = {
  id: string;
  name: string;
  shortName: string;
  reputation: number;
  colorPrimary: string;
  colorSecondary: string;
  crestShape: number;
  crestInitials: string;
  leagueName: string;
  leagueTier: number;
  countryName: string;
};

export type TransferOffer = {
  key: string;
  kind: "RENEWAL" | "TRANSFER" | "LOAN";
  team: OfferTeam;
  fee: number;
  wage: number;
  pitch: string;
};

const PITCHES_UP = [
  "Um projeto ambicioso te quer como peça-chave.",
  "A diretoria enxerga em você o próximo ídolo do clube.",
  "Uma chance de dar um salto grande na carreira.",
  "O técnico ligou pessoalmente pra te convencer.",
];
const PITCHES_LATERAL = [
  "Uma proposta sólida, com minutos garantidos.",
  "O clube promete protagonismo imediato.",
  "Uma mudança de ares que pode fazer bem.",
  "Contrato competitivo e um elenco equilibrado.",
];
const PITCHES_DOWN = [
  "Uma oportunidade de recomeçar em outro ambiente.",
  "Menos badalação, mas protagonismo garantido.",
  "Um convite pra reencontrar seu melhor futebol.",
];
const PITCHES_LOAN = [
  "Empréstimo pra ganhar ritmo de jogo.",
  "Uma temporada fora pra amadurecer longe dos holofotes.",
];

export function generateTransferOffers(
  rand: RandomFn,
  opts: {
    currentTeam: OfferTeam;
    currentWage: number;
    overall: number;
    reputation: number;
    marketValue: number;
    age: number;
    lastAvgRating: number | null;
    candidates: OfferTeam[];
  },
): TransferOffer[] {
  const { currentTeam, currentWage, overall, reputation, marketValue, age, lastAvgRating, candidates } = opts;

  const offers: TransferOffer[] = [];

  const renewalWage = Math.round(currentWage * randFloat(rand, 1.08, 1.3));
  offers.push({
    key: `renew-${currentTeam.id}`,
    kind: "RENEWAL",
    team: currentTeam,
    fee: 0,
    wage: renewalWage,
    pitch: "O clube quer estender seu vínculo e valorizar seu salário.",
  });

  const playerPower = Math.round(overall * 0.7 + reputation * 0.3);
  const pool = candidates.filter((t) => t.id !== currentTeam.id);

  const lateral = pool.filter((t) => t.reputation - playerPower >= -12 && t.reputation - playerPower <= 8);
  const aspirational = pool.filter((t) => t.reputation - playerPower > 8 && t.reputation - playerPower <= 26);
  const downward = pool.filter((t) => t.reputation - playerPower < -12 && t.reputation - playerPower >= -32);

  const struggling = (lastAvgRating !== null && lastAvgRating < 6.3) || age >= 33;
  const wantsLoan = age <= 20 && rand() < 0.35;

  const chosenTeams: { team: OfferTeam; kind: "TRANSFER" | "LOAN" }[] = [];

  if (wantsLoan && lateral.length > 0) {
    chosenTeams.push({ team: pick(rand, lateral), kind: "LOAN" });
  } else if (aspirational.length > 0 && rand() < 0.55 && !struggling) {
    chosenTeams.push({ team: pick(rand, aspirational), kind: "TRANSFER" });
  } else if (struggling && downward.length > 0 && rand() < 0.6) {
    chosenTeams.push({ team: pick(rand, downward), kind: "TRANSFER" });
  } else if (lateral.length > 0) {
    chosenTeams.push({ team: pick(rand, lateral), kind: "TRANSFER" });
  }

  const remainingPool = shuffle(rand, pool.filter((t) => !chosenTeams.some((c) => c.team.id === t.id)));
  const secondPool = lateral.length > 0 ? shuffle(rand, lateral.filter((t) => !chosenTeams.some((c) => c.team.id === t.id))) : remainingPool;
  const second = secondPool[0] ?? remainingPool[0];
  if (second) chosenTeams.push({ team: second, kind: "TRANSFER" });

  for (const { team, kind } of chosenTeams.slice(0, 2)) {
    const diff = team.reputation - playerPower;
    const feeMultiplier = randFloat(rand, 0.75, 1.35);
    const fee = kind === "LOAN" ? 0 : Math.round(Math.max(marketValue * feeMultiplier, 15));
    const baseWage = computeWage(marketValue, team.reputation);
    const wage = kind === "LOAN" ? Math.round(baseWage * 0.6) : Math.round(baseWage * randFloat(rand, 0.95, 1.2));
    const pitchList = kind === "LOAN" ? PITCHES_LOAN : diff > 8 ? PITCHES_UP : diff < -12 ? PITCHES_DOWN : PITCHES_LATERAL;

    offers.push({
      key: `${kind.toLowerCase()}-${team.id}`,
      kind,
      team,
      fee,
      wage: clamp(wage, 350, 2_200_000),
      pitch: pick(rand, pitchList),
    });
  }

  return offers;
}

function pick<T>(rand: RandomFn, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
