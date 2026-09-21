import { notFound } from "next/navigation";
import { DecisionForm } from "@/components/game/decision-form";
import { getPlayerById } from "@/lib/queries";
import { getSessionId } from "@/lib/session";
import { submitDecision } from "@/actions";
import type { TransferOffer } from "@/lib/game/transferOffers";
import type { OptionEffects } from "@/components/game/extra-campo-option-card";

type PendingEvent = {
  key: string;
  title: string;
  description: string;
  options: { key: string; label: string; description: string; effects: OptionEffects }[];
};

export default async function DecisaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = await getSessionId();
  const player = await getPlayerById(id);

  if (!player || player.sessionId !== sessionId) notFound();
  if (!player.pendingOffers || !player.pendingEvent) notFound();

  const offers = player.pendingOffers as unknown as TransferOffer[];
  const event = player.pendingEvent as unknown as PendingEvent;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-2 px-4 py-10">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{player.age} anos</p>
        <h1 className="text-2xl font-extrabold">Hora de decidir</h1>
      </div>
      <DecisionForm action={submitDecision.bind(null, id)} event={event} offers={offers} />
    </div>
  );
}
