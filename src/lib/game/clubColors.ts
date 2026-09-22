// Converte a string de cores oficiais que a football-data.org retorna (ex: "Red / White")
// pra um par de hex usado no brasão SVG gerado localmente.
const COLOR_WORD_HEX: Record<string, string> = {
  red: "#dc2626",
  scarlet: "#e11d48",
  crimson: "#be123c",
  claret: "#7f1d1d",
  maroon: "#7f1d1d",
  burgundy: "#5b1a29",
  wine: "#5b1a29",
  bordeaux: "#5b1a29",
  pink: "#ec4899",
  orange: "#ea580c",
  amber: "#f59e0b",
  gold: "#eab308",
  yellow: "#facc15",
  green: "#16a34a",
  "dark green": "#14532d",
  teal: "#0d9488",
  turquoise: "#14b8a6",
  blue: "#2563eb",
  "sky blue": "#38bdf8",
  "light blue": "#38bdf8",
  "royal blue": "#1d4ed8",
  "navy blue": "#1e3a8a",
  navy: "#1e3a8a",
  "dark blue": "#1e3a8a",
  purple: "#7c3aed",
  violet: "#7c3aed",
  black: "#0a0a0a",
  white: "#f5f5f5",
  cream: "#f5f0e1",
  beige: "#e7d9b8",
  grey: "#6b7280",
  gray: "#6b7280",
  silver: "#cbd5e1",
  brown: "#78350f",
};

function hexForColorWord(word: string): string | null {
  const key = word.trim().toLowerCase();
  if (COLOR_WORD_HEX[key]) return COLOR_WORD_HEX[key];
  // tenta a última palavra (ex: "Sky Blue" já cobre, mas "Light Navy" cairia aqui em "navy")
  const lastWord = key.split(" ").pop();
  if (lastWord && COLOR_WORD_HEX[lastWord]) return COLOR_WORD_HEX[lastWord];
  return null;
}

// clubColors vem como "Red / White" ou "Red / White / Black" — usamos as duas primeiras
// cores reconhecidas como (primária, secundária).
export function parseClubColors(clubColors: string | null | undefined): [string, string] | null {
  if (!clubColors) return null;
  const words = clubColors.split("/").map((w) => w.trim()).filter(Boolean);
  const hexes = words.map(hexForColorWord).filter((h): h is string => h !== null);
  if (hexes.length < 2) return null;
  if (hexes[0] === hexes[1]) return null;
  return [hexes[0], hexes[1]];
}
