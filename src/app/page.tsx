import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TeamCrest } from "@/components/game/team-crest";
import { getSessionId } from "@/lib/session";
import { getActiveCareer, getRecentSessionPlayers } from "@/lib/queries";
import { POSITION_LABEL } from "@/lib/game/constants";

export default async function Home() {
  const sessionId = await getSessionId();
  const active = sessionId ? await getActiveCareer(sessionId) : null;
  const recent = sessionId ? await getRecentSessionPlayers(sessionId) : [];
  const retiredCareers = recent.filter((p) => p.status === "RETIRED").slice(0, 3);

  return (
    <div className="flex flex-1 flex-col">
      <section className="pitch-lines pitch-glow border-b border-border/60">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            16 anos. Uma base. Um sonho.
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Construa a lenda do <span className="text-primary">seu</span> jogador
          </h1>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground">
            Comece aos 16 anos em um time da base. A cada 2 anos, escolha sua próxima transferência e decida como
            lidar com os momentos fora de campo — até o dia da aposentadoria.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {active ? (
              <Button size="lg" nativeButton={false} render={<Link href={`/carreira/${active.id}`} />}>
                Continuar carreira de {active.name}
              </Button>
            ) : (
              <Button size="lg" nativeButton={false} render={<Link href="/novo" />}>
                Começar carreira
              </Button>
            )}
            {active && (
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/novo" />}>
                Começar nova carreira
              </Button>
            )}
          </div>
          {active && (
            <p className="text-xs text-muted-foreground">
              Iniciar uma nova carreira encerra a carreira ativa de {active.name}.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-16 sm:grid-cols-3">
        <FeatureCard
          emoji="🌱"
          title="Comece do zero"
          description="Escolha nome, posição, nacionalidade e pé preferido. Aos 16 anos, três clubes de base disputam sua assinatura."
        />
        <FeatureCard
          emoji="🔁"
          title="Ciclos de 2 em 2 anos"
          description="Cada decisão já simula os 2 anos seguintes na hora — sua tabela de temporadas vai se atualizando sozinha."
        />
        <FeatureCard
          emoji="⚖️"
          title="Transferência ou extra-campo"
          description="70% das vezes você escolhe entre 3 propostas de transferência; 30% é um momento extra-campo que mexe direto no seu OVR."
        />
      </section>

      {retiredCareers.length > 0 && (
        <section className="mx-auto w-full max-w-5xl px-4 pb-20">
          <h2 className="mb-4 text-lg font-bold">Suas carreiras encerradas</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {retiredCareers.map((p) => (
              <Link key={p.id} href={`/carreira/${p.id}`}>
                <Card className="h-full border-border/60 transition-colors hover:border-primary/50">
                  <CardContent className="flex items-center gap-3">
                    {p.currentTeam && (
                      <TeamCrest
                        colorPrimary={p.currentTeam.colorPrimary}
                        colorSecondary={p.currentTeam.colorSecondary}
                        crestShape={p.currentTeam.crestShape}
                        crestInitials={p.currentTeam.crestInitials}
                        size={34}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {POSITION_LABEL[p.position]} · aposentado aos {p.retiredAge} anos
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <Card className="border-border/60 bg-card/40">
      <CardContent>
        <div className="mb-3 text-3xl">{emoji}</div>
        <h3 className="mb-1 font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
