export type OvrTier = {
  label: string;
  background: string; // valor CSS (cor sólida ou gradiente)
  color: string;
};

export function ovrTier(ovr: number): OvrTier {
  if (ovr >= 95) return { label: "GOAT", background: "linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)", color: "#0a0a0a" };
  if (ovr >= 90) return { label: "Diamante", background: "linear-gradient(135deg, #67e8f9, #38bdf8)", color: "#0a0a0a" };
  if (ovr >= 80) return { label: "Ouro", background: "#eab308", color: "#0a0a0a" };
  if (ovr >= 70) return { label: "Prata", background: "#94a3b8", color: "#0a0a0a" };
  return { label: "Bronze", background: "#b45309", color: "#fff7ed" };
}
