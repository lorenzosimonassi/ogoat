# ogoat

Simulador de carreira de futebol. Você cria um jogador aos 16 anos e, a cada
2 anos, decide sua próxima transferência e como lidar com um momento
extra-campo (patrocínio, convocação, polêmica na imprensa etc.), até se
aposentar.

## Stack

- **Front-end**: Next.js 16 (App Router, Server Components + Server Actions), TypeScript, Tailwind CSS v4, shadcn/ui (Base UI)
- **Back-end**: Prisma 6 + PostgreSQL
- **Sem API REST separada** — a UI chama Server Actions (`src/actions.ts`) diretamente, que leem/gravam no Postgres via Prisma.

Times, ligas e países são **fictícios** (brasões gerados em SVG a partir de
cores/iniciais) pra não usar marcas e escudos reais.

## Como rodar localmente

Pré-requisitos: Node 20+, Docker (pra subir o Postgres local).

```bash
# 1. instalar dependências
npm install

# 2. subir o Postgres local (porta 5433, ajustável em docker-compose.yml)
docker compose up -d

# 3. copiar o .env de exemplo (já aponta pro banco do passo 2)
cp .env.example .env

# 4. criar as tabelas
npx prisma migrate dev

# 5. popular países / ligas / times fictícios
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
prisma/seed.ts               gera países, ligas (3 divisões por país) e times fictícios
src/lib/game/                toda a lógica do jogo (atributos, evolução por idade,
                             simulação de temporada, ofertas de transferência,
                             catálogo de eventos extra-campo, aposentadoria)
src/actions.ts                Server Actions: createCareer, advanceCycle,
                             submitDecision, retireNow
src/app/                     páginas (landing, /novo, /carreira/[id] e sub-rotas)
src/components/game/         componentes de UI do jogo (crest, cards, formulários)
```

## Loop do jogo

1. `/novo` — cria o jogador (nome, nacionalidade, posição, pé) aos 16 anos num
   time da divisão de acesso do seu país.
2. `/carreira/[id]` — painel do jogador (atributos, time atual, valor de
   mercado). Botão **Avançar 2 anos** simula o ciclo.
3. `/carreira/[id]/resultado` — recap do ciclo (jogos, gols, assistências,
   nota média, conquistas).
4. `/carreira/[id]/decisao` — escolhe o evento extra-campo e a próxima
   proposta (renovar, transferir ou emprestar).
5. Repete até a aposentadoria (voluntária a partir dos 32, ou forçada por
   volta dos 34-40 conforme o declínio de atributos) →
   `/carreira/[id]/aposentadoria` com o resumo final da carreira.

Sem sistema de login: cada navegador recebe um cookie de sessão anônimo que
guarda a carreira ativa.
