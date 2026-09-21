import { Badge } from "@/components/ui/badge";
import { TeamCrest } from "@/components/game/team-crest";
import { formatFee, formatWage } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TransferOffer } from "@/lib/game/transferOffers";

const KIND_LABEL: Record<TransferOffer["kind"], string> = {
  RENEWAL: "Renovação",
  TRANSFER: "Transferência",
  LOAN: "Empréstimo",
};

export function TransferOfferCard({
  offer,
  selected,
  onSelect,
}: {
  offer: TransferOffer;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-all",
        "bg-card/50 hover:border-primary/50 hover:bg-card",
        selected ? "border-primary ring-1 ring-primary bg-card" : "border-border/60",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <TeamCrest
            colorPrimary={offer.team.colorPrimary}
            colorSecondary={offer.team.colorSecondary}
            crestShape={offer.team.crestShape}
            crestInitials={offer.team.crestInitials}
            size={38}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">{offer.team.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {offer.team.leagueName} · {offer.team.countryName}
            </p>
          </div>
        </div>
        <Badge variant={offer.kind === "RENEWAL" ? "secondary" : "outline"} className="shrink-0 text-[11px]">
          {KIND_LABEL[offer.kind]}
        </Badge>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{offer.pitch}</p>

      <div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm">
        <div>
          <p className="text-[11px] uppercase text-muted-foreground">Custo</p>
          <p className="font-semibold">{formatFee(offer.fee)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase text-muted-foreground">Salário</p>
          <p className="font-semibold text-primary">{formatWage(offer.wage)}</p>
        </div>
      </div>
    </button>
  );
}
