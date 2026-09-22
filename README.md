# ogoat

Simulador de carreira de futebol. Você cria um jogador aos 16 anos e, a cada
2 anos, recebe uma decisão: 70% das vezes é uma proposta de transferência
(3 clubes, incluindo renovar com o atual), 30% é um momento extra-campo
(patrocínio, convocação, polêmica na imprensa etc.) que mexe direto no seu
OVR — até se aposentar.

## Stack

- **Front-end**: Next.js 16 (App Router, Server Components + Server Actions), TypeScript, Tailwind CSS v4, shadcn/ui (Base UI)
- **Back-end**: Prisma 6 + PostgreSQL
- **Sem API REST separada** — a UI chama Server Actions (`src/actions.ts`) diretamente, que leem/gravam no Postgres via Prisma.

Times, ligas e países são **reais**, sincronizados da
[football-data.org](https://www.football-data.org/) (plano gratuito: 9 ligas
de elite — Premier League, Championship, La Liga, Serie A, Bundesliga,
Ligue 1, Eredivisie, Primeira Liga e Brasileirão Série A), incluindo o
escudo oficial de cada clube. Quando a API não retorna um crest pro time, cai
pra um brasão gerado em SVG localmente (nome/cores oficiais).

## Como rodar localmente

Pré-requisitos: Node 20+, Docker (pra subir o Postgres local), uma API key
gratuita da football-data.org (cadastro instantâneo em
https://www.football-data.org/client/register).

```bash
# 1. instalar dependências
npm install

# 2. subir o Postgres local (porta 5433, ajustável em docker-compose.yml)
docker compose up -d

# 3. copiar o .env de exemplo (já aponta pro banco do passo 2) e colar sua
#    FOOTBALL_DATA_API_TOKEN
cp .env.example .env

# 4. criar as tabelas
npx prisma migrate dev

# 5. sincronizar países / ligas / times reais da football-data.org
#    (respeita o rate limit do plano free, leva ~1min)
npx prisma db seed

# 6. rodar o app
npm run dev
```

Abra http://localhost:3000.

Se a porta 5433 já estiver em uso, troque em `docker-compose.yml` (`ports`)
e em `.env`/`.env.example` (`DATABASE_URL`).

## Estrutura

```
prisma/schema.prisma        modelo de dados (Player, Team, League, Country,
                             CareerStage, TransferRecord, ExtraCampoChoice, Trophy)
prisma/seed.ts               sincroniza países, ligas e times reais da football-data.org
src/lib/game/                toda a lógica do jogo (atributos, evolução por idade,
                             simulação de temporada, ofertas de transferência,
                             catálogo de eventos extra-campo, aposentadoria)
src/actions.ts                Server Actions: createCareer, submitDecision, retireNow
src/app/                     páginas (landing, /novo, /carreira/[id])
src/components/game/         componentes de UI do jogo (crest, header, tabela, decisão)
```

## Loop do jogo

1. `/novo` — cria o jogador (nome, nacionalidade, posição, pé) aos 16 anos.
2. `/carreira/[id]` — página única: header (OVR, time, camisa, posição, idade,
   valor, salário, totais de jogos/gols/assistências), a decisão pendente
   logo abaixo, e a tabela de temporadas (2 em 2 anos, dos 16 aos 38) à
   direita.
3. A primeira decisão é sempre a "oferta de base" (3 clubes do país da
   nacionalidade escolhida, sem clube atual). Daí em diante, cada decisão é
   sorteada: 70% transferência (3 propostas — 1 renovação + 2 clubes novos,
   de qualquer país), 30% extra-campo (2 opções que só afetam o OVR, pra
   cima ou pra baixo). Os cards mostram só o escudo real do time e a ação
   ("Renovar com X", "Ir pro Y").
4. Clicar num card já decide, simula o ciclo de 2 anos na hora (usando o
   clube escolhido ou o efeito no OVR) e gera a próxima decisão — sem botão
   de confirmar, sem botão de avançar. A tabela atualiza sozinha.
5. Repete até a aposentadoria (voluntária a partir dos 32, com o botão
   "Pendurar as chuteiras", ou forçada por volta dos 34-40 conforme o
   declínio de atributos), que substitui a decisão pendente por um resumo
   da carreira na mesma página.

Sem sistema de login: cada navegador recebe um cookie de sessão anônimo que
guarda a carreira ativa.
