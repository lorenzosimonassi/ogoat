import type { TransferOffer } from "./transferOffers";

export type PendingTransferDecision = {
  type: "TRANSFER";
  heading: string;
  subheading: string;
  offers: TransferOffer[];
};

export type PendingExtraCampoDecision = {
  type: "EXTRA_CAMPO";
  key: string;
  title: string;
  description: string;
  options: { key: string; label: string; description: string; ovrDelta: number }[];
};

export type PendingDecision = PendingTransferDecision | PendingExtraCampoDecision;

// 70% das vezes a decisão é uma transferência (3 times), 30% é um momento extra-campo
// que só mexe no OVR (pra cima ou pra baixo).
export function rollNextDecisionType(rand: () => number): "TRANSFER" | "EXTRA_CAMPO" {
  return rand() < 0.7 ? "TRANSFER" : "EXTRA_CAMPO";
}
