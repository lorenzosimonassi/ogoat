import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlayerHeaderCard } from "@/components/game/player-header-card";
import { getPlayerById } from "@/lib/queries";
import { getSessionId } from "@/lib/session";
import { advanceCycle, retireNow } from "@/actions";
import { canRetireVoluntarily } from "@/lib/game/retirement";

export default async function CarreiraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = await getSessionId();
  const player = await getPlayerById(id);

  if (!player || player.sessionId !== sessionId) notFound();
  if (player.status === "RETIRED") redirect(`/carreira/${id}/aposentadoria`);
  if (player.status === "ABANDONED") notFound();
  if (player.pendingOffers && player.pendingEvent) redirect(`/carreira/${id}/decisao`);

  const canRetire = canRetireVoluntarily(player.age);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10">
      <PlayerHeaderCard
        name={player.name}
        age={player.age}
        position={player.position}
        attrs={{
          pace: player.pace,
          shooting: player.shooting,
          passing: player.passing,
          dribbling: player.dribbling,
          defending: player.defending,
          physical: player.physical,
        }}
        potential={player.potential}
        morale={player.morale}
        fitness={player.fitness}
        reputation={player.reputation}
        marketValue={player.marketValue}
        wage={player.wage}
        countryFlag={player.country.flag}
        team={player.currentTeam}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" className="text-muted-foreground" nativeButton={false} render={<Link href={`/carreira/${id}/historico`} />}>
          Ver histórico da carreira →
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row">
          {canRetire && (
            <form action={retireNow.bind(null, id)}>
              <Button type="submit" variant="outline">
                Pendurar as chuteiras
              </Button>
            </form>
          )}
          <form action={advanceCycle.bind(null, id)}>
            <Button type="submit" size="lg">
              Avançar 2 anos ({player.age} → {player.age + 2})
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
