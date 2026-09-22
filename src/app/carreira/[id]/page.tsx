import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CareerHeader, TrophyVitrine } from "@/components/game/career-header";
import { CareerTable } from "@/components/game/career-table";
import { DecisionPanel } from "@/components/game/decision-panel";
import { getFullCareer } from "@/lib/queries";
import { getSessionId } from "@/lib/session";
import { submitDecision, retireNow } from "@/actions";
import { overallFor } from "@/lib/game/attributes";
import { canRetireVoluntarily } from "@/lib/game/retirement";
import { POSITION_LABEL } from "@/lib/game/constants";
import type { PendingDecision } from "@/lib/game/decision";

export default async function CarreiraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = await getSessionId();
  const career = await getFullCareer(id);

  if (!career || career.sessionId !== sessionId) notFound();
  if (career.status === "ABANDONED") notFound();

  const ovr = overallFor(career.position, {
    pace: career.pace,
    shooting: career.shooting,
    passing: career.passing,
    dribbling: career.dribbling,
    defending: career.defending,
    physical: career.physical,
  });

  const totals = career.stages.reduce(
    (acc, s) => ({
      appearances: acc.appearances + s.appearances,
      goals: acc.goals + s.goals,
      assists: acc.assists + s.assists,
    }),
    { appearances: 0, goals: 0, assists: 0 },
  );

  const isActive = career.status === "ACTIVE";
  const pendingDecision = career.pendingDecision as unknown as PendingDecision | null;
  const canRetire = isActive && canRetireVoluntarily(career.age);
  const clubs = Array.from(new Set(career.stages.map((s) => s.team.name)));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[400px_1fr] lg:items-start">
        <Card className="border-border/70 pitch-glow">
          <CardContent className="space-y-5">
            <CareerHeader
              name={career.name}
              countryFlag={career.country.flag}
              shirtNumber={career.shirtNumber}
              position={career.position}
              age={career.age}
              ovr={ovr}
              marketValue={career.marketValue}
              wage={career.wage}
              team={career.currentTeam}
              totals={totals}
            />

            <Separator />
            <TrophyVitrine trophies={career.trophies} />
            <Separator />

            {isActive && pendingDecision ? (
              <DecisionPanel action={submitDecision.bind(null, id)} decision={pendingDecision} />
            ) : (
              <div className="space-y-3 text-center">
                <p className="text-lg font-bold">🐐 Carreira encerrada</p>
                <p className="text-sm text-muted-foreground">
                  {POSITION_LABEL[career.position]} · aposentado aos {career.retiredAge} anos
                  {clubs.length > 0 && <> · defendeu {clubs.join(" → ")}</>}
                </p>
                <Button size="lg" className="w-full" nativeButton={false} render={<Link href="/novo" />}>
                  Começar nova carreira
                </Button>
              </div>
            )}

            {canRetire && (
              <form action={retireNow.bind(null, id)}>
                <Button type="submit" variant="ghost" className="w-full text-muted-foreground">
                  Pendurar as chuteiras
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-0">
            <CareerTable
              stages={career.stages}
              pendingDecision={pendingDecision}
              currentAge={career.age}
              currentOvr={ovr}
              currentTeam={career.currentTeam}
              isActive={isActive}
              countryFlag={career.country.flag}
              countryName={career.country.name}
              totals={totals}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
