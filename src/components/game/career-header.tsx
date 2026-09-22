import { TeamCrest } from "@/components/game/team-crest";
import { POSITION_SHORT } from "@/lib/game/constants";
import { formatMarketValue, formatWage } from "@/lib/format";
import { ovrTier } from "@/lib/game/ovrTier";
import type { Position } from "@/generated/prisma/client";

type TeamInfo = {
  name: string;
  colorPrimary: string;
  colorSecondary: string;
  crestShape: number;
  crestInitials: string;
  crestUrl: string | null;
  league: { name: string; country: { name: string } };
};

export type CareerTrophy = { id: string; name: string; age: number };

export function CareerHeader({
  name,
  countryFlag,
  shirtNumber,
  position,
  age,
  ovr,
  marketValue,
  wage,
  team,
  totals,
}: {
  name: string;
  countryFlag: string;
  shirtNumber: number;
  position: Position;
  age: number;
  ovr: number;
  marketValue: number;
  wage: number;
  team: TeamInfo | null;
  totals: { appearances: number; goals: number; assists: number };
}) {
  const tier = ovrTier(ovr);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl"
            style={{ background: tier.background, color: tier.color }}
          >
            <span className="text-[8px] font-bold uppercase tracking-wide opacity-80">{tier.label}</span>
            <span className="text-2xl font-extrabold leading-none">{ovr}</span>
          </div>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span className="text-base leading-none">{countryFlag}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-foreground">#{shirtNumber}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-foreground">{POSITION_SHORT[position]}</span>
            </div>
            <p className="truncate text-lg font-extrabold leading-tight">{name}</p>
            {team ? (
              <div className="flex items-center gap-2">
                <TeamCrest
                  colorPrimary={team.colorPrimary}
                  colorSecondary={team.colorSecondary}
                  crestShape={team.crestShape}
                  crestInitials={team.crestInitials}
                  crestUrl={team.crestUrl}
                  size={20}
                />
                <span className="truncate text-sm text-muted-foreground">{team.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-border text-[10px]">?</span>
                Sem clube
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Idade</p>
          <p className="text-3xl font-extrabold leading-none">{age}</p>
          <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">Valor</p>
          <p className="text-sm font-semibold">{formatMarketValue(marketValue)}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">Salário</p>
          <p className="text-sm font-semibold text-primary">{formatWage(wage)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Jogos" icon="🎮" value={totals.appearances} />
        <StatTile label="Gols" icon="⚽" value={totals.goals} />
        <StatTile label="Ast" icon="🎯" value={totals.assists} />
      </div>
    </div>
  );
}

function StatTile({ label, icon, value }: { label: string; icon: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-center">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-extrabold">
        <span className="mr-1">{icon}</span>
        {value}
      </p>
    </div>
  );
}

export function TrophyVitrine({ trophies }: { trophies: CareerTrophy[] }) {
  if (trophies.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>🏆</span>
        Vitrine vazia
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {trophies.map((t) => (
        <span
          key={t.id}
          className="rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary"
        >
          🏆 {t.name}
        </span>
      ))}
    </div>
  );
}
