export function formatMarketValue(valueK: number): string {
  const euros = valueK * 1000;
  if (euros >= 1_000_000) return `€ ${(euros / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  return `€ ${(euros / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
}

export function formatWage(euros: number): string {
  if (euros >= 1_000_000) return `€ ${(euros / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi/mês`;
  if (euros >= 1000) return `€ ${(euros / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil/mês`;
  return `€ ${euros.toLocaleString("pt-BR")}/mês`;
}

export function formatFee(feeK: number): string {
  if (feeK === 0) return "Livre";
  return formatMarketValue(feeK);
}
