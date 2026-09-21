import { prisma } from "@/lib/prisma";

const teamInclude = {
  league: { include: { country: true } },
} as const;

export function getActiveCareer(sessionId: string) {
  return prisma.player.findFirst({
    where: { sessionId, status: "ACTIVE" },
    include: { country: true, currentTeam: { include: teamInclude } },
    orderBy: { createdAt: "desc" },
  });
}

export function getPlayerById(playerId: string) {
  return prisma.player.findUnique({
    where: { id: playerId },
    include: { country: true, currentTeam: { include: teamInclude } },
  });
}

export function getFullCareer(playerId: string) {
  return prisma.player.findUnique({
    where: { id: playerId },
    include: {
      country: true,
      currentTeam: { include: teamInclude },
      stages: {
        include: { team: { include: teamInclude }, trophies: true },
        orderBy: { startAge: "asc" },
      },
      transfers: {
        include: { fromTeam: { include: teamInclude }, toTeam: { include: teamInclude } },
        orderBy: { age: "asc" },
      },
      choices: { orderBy: { age: "asc" } },
      trophies: { include: { team: { include: teamInclude } }, orderBy: { age: "asc" } },
    },
  });
}

export function getCountries() {
  return prisma.country.findMany({ orderBy: { name: "asc" } });
}

export function getRecentSessionPlayers(sessionId: string) {
  return prisma.player.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    include: { country: true, currentTeam: true },
  });
}
