import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamCrest } from "@/components/game/team-crest";
import { getFullCareer } from "@/lib/queries";
import { getSessionId } from "@/lib/session";
import { formatFee, formatWage } from "@/lib/format";

const TRANSFER_TYPE_LABEL: Record<string, string> = {
  TRANSFER: "Transferência",
  RENEWAL: "Renovação",
  FREE: "Livre",
  LOAN: "Empréstimo",
  YOUTH_PROMOTION: "Promoção da base",
};

export default async function HistoricoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = await getSessionId();
  const career = await getFullCareer(id);

  if (!career || career.sessionId !== sessionId) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 px-4 py-10">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Histórico</p>
        <h1 className="text-2xl font-extrabold">{career.name}</h1>
      </div>

      {career.trophies.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Conquistas</h2>
          <div className="flex flex-wrap gap-2">
            {career.trophies.map((t) => (
              <Badge key={t.id} className="bg-primary/15 text-primary border-primary/30" variant="outline">
                🏆 {t.name} · {t.age} anos
              </Badge>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">Temporadas</h2>
        <div className="space-y-3">
          {career.stages.length === 0 && (
            <p className="text-sm text-muted-foreground">Ainda não há ciclos concluídos.</p>
          )}
          {career.stages.map((stage) => (
            <Card key={stage.id} className="border-border/60">
              <CardContent className="flex flex-wrap items-center gap-4">
                <TeamCrest
                  colorPrimary={stage.team.colorPrimary}
                  colorSecondary={stage.team.colorSecondary}
                  crestShape={stage.team.crestShape}
                  crestInitials={stage.team.crestInitials}
                  size={36}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {stage.team.name}{" "}
                    <span className="font-normal text-muted-foreground">
                      ({stage.startAge}–{stage.endAge} anos)
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">{stage.summary}</p>
                  {stage.trophies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {stage.trophies.map((t) => (
                        <Badge key={t.id} variant="secondary" className="text-[11px]">
                          🏆 {t.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-primary">{stage.overallAtEnd}</p>
                  <p className="text-[11px] uppercase text-muted-foreground">Geral</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Transferências</h2>
        <div className="space-y-2">
          {career.transfers.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada ainda.</p>
          )}
          {career.transfers.map((t) => (
            <div
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t.age} anos</span>
                <span className="font-medium">
                  {t.fromTeam ? t.fromTeam.shortName : "—"} → {t.toTeam.shortName}
                </span>
                <Badge variant="outline" className="text-[11px]">
                  {TRANSFER_TYPE_LABEL[t.type]}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>{formatFee(t.fee)}</span>
                <span>{formatWage(t.wage)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {career.choices.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Momentos extra-campo</h2>
          <div className="space-y-2">
            {career.choices.map((c) => (
              <div key={c.id} className="rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-sm">
                <p className="font-medium">
                  {c.eventTitle} <span className="text-muted-foreground">· {c.age} anos</span>
                </p>
                <p className="text-muted-foreground">{c.optionLabel}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
