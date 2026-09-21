import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StageSummaryCard, type PendingSummary } from "@/components/game/stage-summary-card";
import { getPlayerById } from "@/lib/queries";
import { getSessionId } from "@/lib/session";

export default async function ResultadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = await getSessionId();
  const player = await getPlayerById(id);

  if (!player || player.sessionId !== sessionId) notFound();
  if (!player.pendingSummary) notFound();

  const summary = player.pendingSummary as unknown as PendingSummary;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <StageSummaryCard summary={summary} />

      {summary.retired ? (
        <div className="space-y-3 text-center">
          <p className="text-muted-foreground">
            Sua condição física não aguenta mais o nível profissional. É hora de pendurar as chuteiras.
          </p>
          <Button size="lg" className="w-full sm:w-auto" nativeButton={false} render={<Link href={`/carreira/${id}/aposentadoria`} />}>
            Ver resumo da carreira
          </Button>
        </div>
      ) : (
        <Button size="lg" className="w-full sm:w-auto" nativeButton={false} render={<Link href={`/carreira/${id}/decisao`} />}>
          Continuar
        </Button>
      )}
    </div>
  );
}
