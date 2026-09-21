import { cn } from "@/lib/utils";
import { ATTRIBUTE_LABEL, type AttributeKey } from "@/lib/game/constants";

export type OptionEffects = {
  morale?: number;
  reputation?: number;
  fitness?: number;
  marketValuePct?: number;
  wageFlat?: number;
  attribute?: { key: AttributeKey; amount: number };
};

function effectBadges(effects: OptionEffects): { label: string; positive: boolean }[] {
  const badges: { label: string; positive: boolean }[] = [];
  if (effects.morale) badges.push({ label: `${signed(effects.morale)} moral`, positive: effects.morale > 0 });
  if (effects.reputation) badges.push({ label: `${signed(effects.reputation)} reputação`, positive: effects.reputation > 0 });
  if (effects.fitness) badges.push({ label: `${signed(effects.fitness)} condição física`, positive: effects.fitness > 0 });
  if (effects.marketValuePct) badges.push({ label: `${signed(effects.marketValuePct)}% valor de mercado`, positive: effects.marketValuePct > 0 });
  if (effects.wageFlat) badges.push({ label: `${signed(effects.wageFlat)} €/mês`, positive: effects.wageFlat > 0 });
  if (effects.attribute) {
    badges.push({
      label: `${signed(effects.attribute.amount)} ${ATTRIBUTE_LABEL[effects.attribute.key]}`,
      positive: effects.attribute.amount > 0,
    });
  }
  return badges;
}

function signed(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}

export function ExtraCampoOptionCard({
  label,
  description,
  effects,
  selected,
  onSelect,
}: {
  label: string;
  description: string;
  effects: OptionEffects;
  selected: boolean;
  onSelect: () => void;
}) {
  const badges = effectBadges(effects);

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
      <p className="mb-1 font-semibold">{label}</p>
      <p className="mb-3 text-sm text-muted-foreground">{description}</p>
      {badges.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <span
              key={b.label}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                b.positive ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive",
              )}
            >
              {b.label}
            </span>
          ))}
        </div>
      ) : (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          Sem efeito direto
        </span>
      )}
    </button>
  );
}
