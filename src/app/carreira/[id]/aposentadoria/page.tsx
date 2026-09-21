import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFullCareer } from "@/lib/queries";
import { getSessionId } from "@/lib/session";
import { POSITION_LABEL } from "@/lib/game/constants";
import { formatMarketValue } from "@/lib/format";

export default async function AposentadoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = await getSessionId();
  const career = await getFullCareer(id);

  if (!career || career.sessionId !== sessionId) notFound();
  if (career.status !== "RETIRED") notFound();

  const totals = career.stages.reduce(
    (acc, s) => ({
      appearances: acc.appearances + s.appearances,
      goals: acc.goals + s.goals,
      assists: acc.assists + s.assists,
    }),
    { appearances: 0, goals: 0, assists: 0 },
  );
  const peakOverall = career.stages.reduce((max, s) => Math.max(max, s.overallAtEnd), 0);
  const clubs = Array.from(new Set(career.stages.map((s) => s.team.name)));

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-14 text-center">
      <div>
        <span className="text-5xl">🐐</span>
        <h1 className="mt-4 text-3xl font-extrabold">{career.name}</h1>
        <p className="mt-1 text-muted-foreground">
          {POSITION_LABEL[career.position]} · carreira encerrada aos {career.retiredAge} anos
        </p>
      </div>

      <Card className="border-border/70 text-left">
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Jogos" value={totals.appearances} />
            <Stat label="Gols" value={totals.goals} />
            <Stat label="Assistências" value={totals.assists} />
            <Stat label="Overall de pico" value={peakOverall} />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">Valor de mercado ao se aposentar</p>
            <p className="text-2xl font-extrabold text-primary">{formatMarketValue(career.marketValue)}</p>
          </div>

          {career.trophies.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-muted-foreground">Conquistas</p>
              <div className="flex flex-wrap gap-2">
                {career.trophies.map((t) => (
                  <Badge key={t.id} className="bg-primary/15 text-primary border-primary/30" variant="outline">
                    🏆 {t.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">Clubes defendidos</p>
            <p className="text-sm">{clubs.join(" → ")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button size="lg" variant="outline" nativeButton={false} render={<Link href={`/carreira/${id}/historico`} />}>
          Ver histórico completo
        </Button>
        <Button size="lg" nativeButton={false} render={<Link href="/novo" />}>
          Começar nova carreira
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 px-3 py-3 text-center">
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
