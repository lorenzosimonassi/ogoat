"use client";

import { useTransition } from "react";
import { TransferOfferCard } from "@/components/game/transfer-offer-card";
import { ExtraCampoOptionCard } from "@/components/game/extra-campo-option-card";
import type { PendingDecision } from "@/lib/game/decision";

const MIN_SIMULATION_MS = 900;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function DecisionPanel({
  action,
  decision,
}: {
  action: (formData: FormData) => void | Promise<void>;
  decision: PendingDecision;
}) {
  const [isPending, startTransition] = useTransition();

  function choose(fieldName: "offerKey" | "optionKey", key: string) {
    const formData = new FormData();
    formData.set(fieldName, key);
    startTransition(async () => {
      await Promise.all([action(formData), sleep(MIN_SIMULATION_MS)]);
    });
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="animate-pulse text-sm font-semibold text-muted-foreground">Simulando temporada...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-bold">{decision.type === "TRANSFER" ? decision.heading : decision.title}</h2>
        <p className="text-xs text-muted-foreground">
          {decision.type === "TRANSFER" ? decision.subheading : decision.description}
        </p>
      </div>

      {decision.type === "TRANSFER" ? (
        <div className="flex flex-wrap justify-center gap-3">
          {decision.offers.map((offer) => (
            <div key={offer.key} className="w-[46%] min-w-[130px]">
              <TransferOfferCard offer={offer} onSelect={() => choose("offerKey", offer.key)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {decision.options.map((opt) => (
            <ExtraCampoOptionCard key={opt.key} label={opt.label} ovrDelta={opt.ovrDelta} onSelect={() => choose("optionKey", opt.key)} />
          ))}
        </div>
      )}
    </div>
  );
}
