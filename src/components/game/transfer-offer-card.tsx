import { TeamCrest } from "@/components/game/team-crest";
import { cn } from "@/lib/utils";
import type { TransferOffer } from "@/lib/game/transferOffers";

const KIND_LABEL: Record<TransferOffer["kind"], string> = {
  BASE: "Assinar com",
  RENEWAL: "Ficar no",
  TRANSFER: "Assinar com",
  LOAN: "Emprestado ao",
};

export function TransferOfferCard({
  offer,
  onSelect,
  disabled,
}: {
  offer: TransferOffer;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "flex w-full flex-col items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-3 py-4 text-center transition-all",
        "hover:border-primary/50 hover:bg-card disabled:opacity-50",
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{KIND_LABEL[offer.kind]}</p>
        <p className="truncate text-base font-bold leading-tight">{offer.team.shortName}</p>
      </div>

      <TeamCrest
        colorPrimary={offer.team.colorPrimary}
        colorSecondary={offer.team.colorSecondary}
        crestShape={offer.team.crestShape}
        crestInitials={offer.team.crestInitials}
        crestUrl={offer.team.crestUrl}
        size={64}
      />

      <p className="flex min-w-0 items-center justify-center gap-1 truncate text-[11px] text-muted-foreground">
        <span className="truncate">{offer.team.leagueName}</span>
        <span>·</span>
        <span className="shrink-0">
          {offer.team.countryFlag} {offer.team.countryCode}
        </span>
      </p>
    </button>
  );
}
