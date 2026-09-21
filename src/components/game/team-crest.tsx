const SHAPE_PATHS = [
  // 0 - escudo
  "M50 4 L90 16 L90 55 Q90 85 50 97 Q10 85 10 55 L10 16 Z",
  // 1 - círculo
  "M50 4 A46 46 0 1 1 49.99 4 Z",
  // 2 - hexágono
  "M50 4 L92 27 L92 73 L50 96 L8 73 L8 27 Z",
  // 3 - quadrado arredondado
  "M26 8 H74 A18 18 0 0 1 92 26 V74 A18 18 0 0 1 74 92 H26 A18 18 0 0 1 8 74 V26 A18 18 0 0 1 26 8 Z",
  // 4 - pentágono
  "M50 4 L95 38 L78 92 L22 92 L5 38 Z",
  // 5 - losango
  "M50 4 L95 50 L50 96 L5 50 Z",
];

export type TeamCrestProps = {
  colorPrimary: string;
  colorSecondary: string;
  crestShape: number;
  crestInitials: string;
  size?: number;
  className?: string;
};

export function TeamCrest({ colorPrimary, colorSecondary, crestShape, crestInitials, size = 40, className }: TeamCrestProps) {
  const path = SHAPE_PATHS[crestShape % SHAPE_PATHS.length];
  const gradId = `crest-grad-${colorPrimary.replace("#", "")}-${colorSecondary.replace("#", "")}-${crestShape}`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colorPrimary} />
          <stop offset="100%" stopColor={colorPrimary} stopOpacity={0.78} />
        </linearGradient>
      </defs>
      <path d={path} fill={`url(#${gradId})`} stroke={colorSecondary} strokeWidth={3} strokeOpacity={0.9} />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="34"
        fontWeight={800}
        fill={colorSecondary}
        fontFamily="var(--font-sans, sans-serif)"
      >
        {crestInitials.slice(0, 3)}
      </text>
    </svg>
  );
}
