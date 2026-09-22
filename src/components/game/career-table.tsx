import { TeamCrest } from "@/components/game/team-crest";
import { ovrTier } from "@/lib/game/ovrTier";
import type { PendingDecision } from "@/lib/game/decision";

const AGE_ROWS = Array.from({ length: 12 }, (_, i) => 16 + i * 2); // 16, 18, ..., 38

type StageTeam = {
  name: string;
  shortName: string;
  colorPrimary: string;
  colorSecondary: string;
  crestShape: number;
  crestInitials: string;
  crestUrl: string | null;
};

type Stage = {
  id: string;
  startAge: number;
  overallAtEnd: number;
  appearances: number;
  goals: number;
  assists: number;
  team: StageTeam;
};

function OvrBadge({ value }: { value: number }) {
  const tier = ovrTier(value);
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 font-mono text-xs font-bold"
      style={{ background: tier.background, color: tier.color }}
    >
      {value}
    </span>
  );
}

export function CareerTable({
  stages,
  pendingDecision,
  currentAge,
  currentOvr,
  currentTeam,
  isActive,
  countryFlag,
  countryName,
  totals,
}: {
  stages: Stage[];
  pendingDecision: PendingDecision | null;
  currentAge: number;
  currentOvr: number;
  currentTeam: StageTeam | null;
  isActive: boolean;
  countryFlag: string;
  countryName: string;
  totals: { appearances: number; goals: number; assists: number };
}) {
  const stageByAge = new Map(stages.map((s) => [s.startAge, s]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 text-left font-semibold">Idade</th>
            <th className="px-3 py-2 text-left font-semibold">Clube</th>
            <th className="px-3 py-2 text-right font-semibold">OVR</th>
            <th className="px-3 py-2 text-right font-semibold">Jogos</th>
            <th className="px-3 py-2 text-right font-semibold">Gols</th>
            <th className="px-3 py-2 text-right font-semibold">Ast</th>
          </tr>
        </thead>
        <tbody>
          {AGE_ROWS.map((age) => {
            const stage = stageByAge.get(age);
            const isPending = isActive && !stage && age === currentAge;

            if (stage) {
              return (
                <tr key={age} className="border-t border-border/40">
                  <td className="px-3 py-2.5 text-muted-foreground">{age}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <TeamCrest
                        colorPrimary={stage.team.colorPrimary}
                        colorSecondary={stage.team.colorSecondary}
                        crestShape={stage.team.crestShape}
                        crestInitials={stage.team.crestInitials}
                        crestUrl={stage.team.crestUrl}
                        size={22}
                      />
                      <span className="truncate font-medium">{stage.team.shortName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <OvrBadge value={stage.overallAtEnd} />
                  </td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground">{stage.appearances}</td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground">{stage.goals}</td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground">{stage.assists}</td>
                </tr>
              );
            }

            if (isPending) {
              const waitingForClub = pendingDecision?.type === "TRANSFER";
              return (
                <tr key={age} className="border-t border-border/40 bg-muted/40">
                  <td className="px-3 py-2.5 font-semibold">{age}</td>
                  <td className="px-3 py-2.5">
                    {waitingForClub || !currentTeam ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-dashed border-border text-[10px]">
                          ?
                        </span>
                        <span className="italic">Escolhendo clube...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <TeamCrest
                          colorPrimary={currentTeam.colorPrimary}
                          colorSecondary={currentTeam.colorSecondary}
                          crestShape={currentTeam.crestShape}
                          crestInitials={currentTeam.crestInitials}
                          crestUrl={currentTeam.crestUrl}
                          size={22}
                        />
                        <span className="truncate font-medium">{currentTeam.shortName}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <OvrBadge value={currentOvr} />
                  </td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground">—</td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground">—</td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground">—</td>
                </tr>
              );
            }

            return (
              <tr key={age} className="border-t border-border/40">
                <td className="px-3 py-2.5 text-muted-foreground/50">{age}</td>
                <td colSpan={5} />
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-border/60 bg-card/60">
            <td colSpan={2} className="px-3 py-3">
              <span className="flex items-center gap-2 font-semibold">
                <span className="text-base">{countryFlag}</span>
                {countryName}
              </span>
            </td>
            <td className="px-3 py-3 text-right text-muted-foreground">Total</td>
            <td className="px-3 py-3 text-right font-semibold">{totals.appearances}</td>
            <td className="px-3 py-3 text-right font-semibold">{totals.goals}</td>
            <td className="px-3 py-3 text-right font-semibold">{totals.assists}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
