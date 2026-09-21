"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { TransferOfferCard } from "@/components/game/transfer-offer-card";
import { ExtraCampoOptionCard } from "@/components/game/extra-campo-option-card";
import type { TransferOffer } from "@/lib/game/transferOffers";
import type { OptionEffects } from "@/components/game/extra-campo-option-card";

type EventOption = { key: string; label: string; description: string; effects: OptionEffects };
type PendingEvent = { key: string; title: string; description: string; options: EventOption[] };

export function DecisionForm({
  action,
  event,
  offers,
}: {
  action: (formData: FormData) => void | Promise<void>;
  event: PendingEvent;
  offers: TransferOffer[];
}) {
  const [offerKey, setOfferKey] = useState<string | null>(null);
  const [optionKey, setOptionKey] = useState<string | null>(null);

  return (
    <form action={action} className="space-y-8">
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-bold">{event.title}</h2>
          <p className="text-sm text-muted-foreground">{event.description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {event.options.map((opt) => (
            <ExtraCampoOptionCard
              key={opt.key}
              label={opt.label}
              description={opt.description}
              effects={opt.effects}
              selected={optionKey === opt.key}
              onSelect={() => setOptionKey(opt.key)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-bold">Seu próximo destino</h2>
          <p className="text-sm text-muted-foreground">Escolha entre renovar ou aceitar uma proposta.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <TransferOfferCard
              key={offer.key}
              offer={offer}
              selected={offerKey === offer.key}
              onSelect={() => setOfferKey(offer.key)}
            />
          ))}
        </div>
      </section>

      <input type="hidden" name="optionKey" value={optionKey ?? ""} />
      <input type="hidden" name="offerKey" value={offerKey ?? ""} />

      <SubmitButton disabled={!offerKey || !optionKey} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={disabled || pending} className="w-full sm:w-auto">
      {pending ? "Confirmando..." : "Confirmar e seguir carreira"}
    </Button>
  );
}
