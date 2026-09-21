import { ATTRIBUTE_KEYS, ATTRIBUTE_LABEL } from "@/lib/game/constants";
import type { Attributes } from "@/lib/game/attributes";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function AttributeBars({ attrs, className }: { attrs: Attributes; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {ATTRIBUTE_KEYS.map((key) => (
        <div key={key} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{ATTRIBUTE_LABEL[key]}</span>
            <span className="font-mono font-semibold tabular-nums">{attrs[key]}</span>
          </div>
          <Progress value={attrs[key]} className="h-1.5" />
        </div>
      ))}
    </div>
  );
}

export function StarRating({ stars, max = 5 }: { stars: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" title={`${stars}/${max} estrelas de potencial`}>
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={cn("size-3.5", i < stars ? "fill-primary" : "fill-muted")}
        >
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 14.9l-5.2 2.9 1-5.9L1.5 7.7l5.9-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}
