import { PrismaClient } from "../src/generated/prisma/client";
import { mulberry32, randInt, shuffle } from "../src/lib/game/rng";
import { COUNTRY_SEED, generateTeamName, initialsFromName, type CountryCode } from "../src/lib/game/names";
import { TEAM_COLOR_PALETTE } from "../src/lib/game/constants";

const prisma = new PrismaClient();

const SEED = 1312;

const TIER_CONFIG = [
  { tier: 1, name: "Divisão de Elite", teamCount: 8, reputation: [66, 95] as [number, number] },
  { tier: 2, name: "Segunda Divisão", teamCount: 8, reputation: [42, 65] as [number, number] },
  { tier: 3, name: "Divisão de Acesso", teamCount: 6, reputation: [16, 41] as [number, number] },
];

async function main() {
  const rand = mulberry32(SEED);

  console.log("Limpando dados existentes...");
  await prisma.trophy.deleteMany();
  await prisma.transferRecord.deleteMany();
  await prisma.extraCampoChoice.deleteMany();
  await prisma.careerStage.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.league.deleteMany();
  await prisma.country.deleteMany();

  console.log("Criando países...");
  const countries = new Map<CountryCode, string>();
  for (const c of COUNTRY_SEED) {
    const country = await prisma.country.create({ data: { name: c.name, code: c.code, flag: c.flag } });
    countries.set(c.code, country.id);
  }

  let teamTotal = 0;

  for (const c of COUNTRY_SEED) {
    const countryId = countries.get(c.code)!;
    const usedNames = new Set<string>();
    const palette = shuffle(rand, TEAM_COLOR_PALETTE);
    let colorIdx = 0;

    for (const tierCfg of TIER_CONFIG) {
      const league = await prisma.league.create({
        data: { name: tierCfg.name, tier: tierCfg.tier, countryId },
      });

      for (let i = 0; i < tierCfg.teamCount; i++) {
        const { name, short } = generateTeamName(rand, c.code, usedNames);
        const [colorPrimary, colorSecondary] = palette[colorIdx % palette.length];
        colorIdx++;
        const reputation = randInt(rand, tierCfg.reputation[0], tierCfg.reputation[1]);
        const crestInitials = initialsFromName(name) || short;

        await prisma.team.create({
          data: {
            name,
            shortName: short,
            leagueId: league.id,
            reputation,
            colorPrimary,
            colorSecondary,
            crestShape: randInt(rand, 0, 5),
            crestInitials,
          },
        });
        teamTotal++;
      }
    }
    console.log(`  ${c.flag} ${c.name}: 3 divisões criadas`);
  }

  console.log(`Pronto! ${countries.size} países e ${teamTotal} times criados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
