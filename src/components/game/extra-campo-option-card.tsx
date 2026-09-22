import { cn } from "@/lib/utils";

export function ExtraCampoOptionCard({
  label,
  ovrDelta,
  onSelect,
  disabled,
}: {
  label: string;
  ovrDelta: number;
  onSelect: () => void;
  disabled?: boolean;
}) {
  const positive = ovrDelta > 0;
  const negative = ovrDelta < 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/50 p-4 text-left transition-all",
        "hover:border-primary/50 hover:bg-card disabled:opacity-50",
      )}
    >
      <p className="text-sm font-semibold">{label}</p>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
          positive && "bg-primary/15 text-primary",
          negative && "bg-destructive/15 text-destructive",
          !positive && !negative && "bg-muted text-muted-foreground",
        )}
      >
        {ovrDelta > 0 ? `+${ovrDelta} OVR` : ovrDelta < 0 ? `${ovrDelta} OVR` : "0 OVR"}
      </span>
    </button>
  );
}
