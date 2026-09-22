// Sincroniza países, ligas e times REAIS a partir da football-data.org (plano gratuito).
// Guarda o crest oficial (PNG) de cada time; o brasão em SVG local vira só fallback
// pra quando a API não retorna um crest pro time.
import { PrismaClient } from "../src/generated/prisma/client";
import { mulberry32, randInt } from "../src/lib/game/rng";
import { COUNTRY_SEED } from "../src/lib/game/names";
import { TEAM_COLOR_PALETTE } from "../src/lib/game/constants";
import { parseClubColors } from "../src/lib/game/clubColors";

const prisma = new PrismaClient();

const API_BASE = "https://api.football-data.org/v4";
const TOKEN = process.env.FOOTBALL_DATA_API_TOKEN;

// Ligas de elite cobertas pelo plano gratuito (TIER_ONE) que têm clubes (fora copas/seleções).
// reputationRange é heurístico (o free tier não dá classificação/orçamento) — reflete o
// prestígio aproximado da competição, com variação determinística por time.
const LEAGUES: { code: string; tier: number; reputationRange: [number, number] }[] = [
  { code: "PL", tier: 1, reputationRange: [78, 96] }, // Inglaterra - elite
  { code: "ELC", tier: 2, reputationRange: [40, 62] }, // Inglaterra - Championship
  { code: "PD", tier: 1, reputationRange: [76, 95] }, // Espanha
  { code: "SA", tier: 1, reputationRange: [74, 94] }, // Itália
  { code: "BL1", tier: 1, reputationRange: [72, 93] }, // Alemanha
  { code: "FL1", tier: 1, reputationRange: [68, 90] }, // França
  { code: "DED", tier: 1, reputationRange: [58, 82] }, // Holanda
  { code: "PPL", tier: 1, reputationRange: [58, 82] }, // Portugal
  { code: "BSA", tier: 1, reputationRange: [62, 88] }, // Brasil
];

const COUNTRY_BY_AREA_CODE = new Map<string, (typeof COUNTRY_SEED)[number]>(COUNTRY_SEED.map((c) => [c.code, c]));

type ApiTeam = {
  id: number;
  name: string;
  shortName: string | null;
  tla: string | null;
  clubColors: string | null;
  crest: string | null;
  area: { code: string };
};

type ApiTeamsResponse = {
  competition: { name: string };
  teams: ApiTeam[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// hash simples e estável só pra semear o PRNG determinístico por liga (sem depender de Math.random)
function hashSeed(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  return h;
}

async function fetchTeams(leagueCode: string): Promise<ApiTeamsResponse> {
  const res = await fetch(`${API_BASE}/competitions/${leagueCode}/teams`, {
    headers: { "X-Auth-Token": TOKEN! },
  });

  if (res.status === 429) {
    console.log("  Rate limit atingido, aguardando 60s...");
    await sleep(60_000);
    return fetchTeams(leagueCode);
  }
  if (!res.ok) {
    throw new Error(`football-data.org respondeu ${res.status} pra ${leagueCode}: ${await res.text()}`);
  }

  const remaining = res.headers.get("x-requests-available-minute");
  if (remaining !== null && Number(remaining) <= 1) {
    console.log("  Perto do limite de requisições/min, aguardando 60s...");
    await sleep(60_000);
  }

  return res.json();
}

async function main() {
  if (!TOKEN) {
    throw new Error(
      "Defina FOOTBALL_DATA_API_TOKEN no .env (cadastro grátis em https://www.football-data.org/client/register).",
    );
  }

  console.log("Limpando dados existentes...");
  await prisma.trophy.deleteMany();
  await prisma.transferRecord.deleteMany();
  await prisma.extraCampoChoice.deleteMany();
  await prisma.careerStage.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.league.deleteMany();
  await prisma.country.deleteMany();

  const countryIdByAreaCode = new Map<string, string>();
  let teamTotal = 0;

  for (let i = 0; i < LEAGUES.length; i++) {
    const leagueDef = LEAGUES[i];
    if (i > 0) await sleep(6_500); // free tier: 10 req/min

    console.log(`Buscando ${leagueDef.code} na football-data.org...`);
    const data = await fetchTeams(leagueDef.code);
    if (data.teams.length === 0) {
      console.log(`  ${leagueDef.code}: nenhum time retornado, pulando.`);
      continue;
    }

    const areaCode = data.teams[0].area.code;
    const countryMeta = COUNTRY_BY_AREA_CODE.get(areaCode);
    if (!countryMeta) {
      throw new Error(`País '${areaCode}' (de ${leagueDef.code}) não está em COUNTRY_SEED (src/lib/game/names.ts).`);
    }

    let countryId = countryIdByAreaCode.get(areaCode);
    if (!countryId) {
      const country = await prisma.country.create({
        data: { name: countryMeta.name, code: areaCode, flag: countryMeta.flag },
      });
      countryId = country.id;
      countryIdByAreaCode.set(areaCode, countryId);
    }

    const league = await prisma.league.create({
      data: { name: data.competition.name, tier: leagueDef.tier, countryId },
    });

    const rand = mulberry32(hashSeed(leagueDef.code));

    for (const team of data.teams) {
      const parsedColors = parseClubColors(team.clubColors);
      const [colorPrimary, colorSecondary] = parsedColors ?? TEAM_COLOR_PALETTE[randInt(rand, 0, TEAM_COLOR_PALETTE.length - 1)];
      const shortName = team.shortName || team.tla || team.name.slice(0, 20);
      const crestInitials = (team.tla || shortName.slice(0, 3)).toUpperCase();

      await prisma.team.create({
        data: {
          name: team.name,
          shortName,
          leagueId: league.id,
          reputation: randInt(rand, leagueDef.reputationRange[0], leagueDef.reputationRange[1]),
          colorPrimary,
          colorSecondary,
          crestShape: randInt(rand, 0, 5),
          crestInitials,
          crestUrl: team.crest || null,
        },
      });
      teamTotal++;
    }

    console.log(`  ${countryMeta.flag} ${data.competition.name}: ${data.teams.length} times`);
  }

  console.log(`Pronto! ${countryIdByAreaCode.size} países e ${teamTotal} times sincronizados da football-data.org.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
