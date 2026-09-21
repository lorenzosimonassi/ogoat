import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamCrest } from "@/components/game/team-crest";
import { AttributeBars, StarRating } from "@/components/game/attribute-bars";
import { POSITION_LABEL } from "@/lib/game/constants";
import { overallFor, potentialStars, type Attributes } from "@/lib/game/attributes";
import { formatMarketValue, formatWage } from "@/lib/format";
import type { Position } from "@/generated/prisma/client";

type TeamInfo = {
  name: string;
  shortName: string;
  colorPrimary: string;
  colorSecondary: string;
  crestShape: number;
  crestInitials: string;
  reputation: number;
  league: { name: string; tier: number; country: { name: string; flag: string } };
};

export function PlayerHeaderCard({
  name,
  age,
  position,
  attrs,
  potential,
  morale,
  fitness,
  reputation,
  marketValue,
  wage,
  countryFlag,
  team,
}: {
  name: string;
  age: number;
  position: Position;
  attrs: Attributes;
  potential: number;
  morale: number;
  fitness: number;
  reputation: number;
  marketValue: number;
  wage: number;
  countryFlag: string;
  team: TeamInfo | null;
}) {
  const overall = overallFor(position, attrs);
  const stars = potentialStars(potential);

  return (
    <Card className="overflow-hidden border-border/70 pitch-glow">
      <CardContent className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl">{countryFlag}</span>
            <h2 className="text-2xl font-extrabold tracking-tight">{name}</h2>
            <Badge variant="secondary" className="font-semibold">
              {POSITION_LABEL[position]}
            </Badge>
            <Badge className="bg-primary/15 text-primary border-primary/30" variant="outline">
              {age} anos
            </Badge>
          </div>

          {team && (
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-3">
              <TeamCrest
                colorPrimary={team.colorPrimary}
                colorSecondary={team.colorSecondary}
                crestShape={team.crestShape}
                crestInitials={team.crestInitials}
                size={40}
              />
              <div className="min-w-0">
                <p className="truncate font-semibold leading-tight">{team.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {team.league.name} · {team.league.country.flag} {team.league.country.name}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatChip label="Geral" value={String(overall)} highlight />
            <StatChip label="Valor" value={formatMarketValue(marketValue)} />
            <StatChip label="Salário" value={formatWage(wage)} />
            <StatChip label="Reputação" value={`${reputation}/99`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MeterChip label="Moral" value={morale} />
            <MeterChip label="Condição física" value={fitness} />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Potencial</span>
            <StarRating stars={stars} />
          </div>
        </div>

        <div className="w-full md:w-64">
          <p className="mb-2 text-sm font-semibold text-muted-foreground">Atributos</p>
          <AttributeBars attrs={attrs} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatChip({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={highlight ? "text-lg font-extrabold text-primary" : "text-sm font-semibold"}>{value}</p>
    </div>
  );
}

function MeterChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 px-3 py-2">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.max(4, value)}%` }}
        />
      </div>
    </div>
  );
}
