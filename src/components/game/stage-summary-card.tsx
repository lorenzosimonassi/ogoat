import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type PendingSummary = {
  teamName: string;
  startAge: number;
  endAge: number;
  appearances: number;
  goals: number;
  assists: number;
  avgRating: number;
  injuries: number;
  trophies: string[];
  overallBefore: number;
  overallAfter: number;
  retired: boolean;
};

export function StageSummaryCard({ summary }: { summary: PendingSummary }) {
  const delta = summary.overallAfter - summary.overallBefore;

  return (
    <Card className="border-border/70">
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {summary.startAge} → {summary.endAge} anos · {summary.teamName}
            </p>
            <h2 className="text-xl font-extrabold">Resumo do ciclo</h2>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Geral</p>
            <p className="text-2xl font-extrabold text-primary">
              {summary.overallAfter}{" "}
              <span className="text-sm font-semibold text-muted-foreground">
                ({delta >= 0 ? "+" : ""}
                {delta})
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Jogos" value={summary.appearances} />
          <Stat label="Gols" value={summary.goals} />
          <Stat label="Assistências" value={summary.assists} />
          <Stat label="Nota média" value={summary.avgRating.toFixed(1)} />
        </div>

        {summary.injuries > 0 && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {summary.injuries === 1 ? "Você sofreu 1 lesão" : `Você sofreu ${summary.injuries} lesões`} nesse ciclo.
          </p>
        )}

        {summary.trophies.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">Conquistas do ciclo</p>
            <div className="flex flex-wrap gap-2">
              {summary.trophies.map((t) => (
                <Badge key={t} className="bg-primary/15 text-primary border-primary/30" variant="outline">
                  🏆 {t}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-center">
      <p className="text-lg font-extrabold">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
