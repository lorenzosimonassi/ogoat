import { pickWeighted, type RandomFn } from "./rng";

export type ExtraCampoOption = {
  key: string;
  label: string;
  description: string;
  ovrDelta: number; // efeito direto no OVR (positivo ou negativo)
};

export type ExtraCampoEvent = {
  key: string;
  title: string;
  description: string;
  minAge?: number;
  maxAge?: number;
  minReputation?: number;
  requiresRecentInjury?: boolean;
  weight: number;
  options: ExtraCampoOption[];
};

export const EXTRA_CAMPO_EVENTS: ExtraCampoEvent[] = [
  {
    key: "sponsor_boots",
    title: "Proposta de patrocínio",
    description: "Uma marca de material esportivo ofereceu um contrato de patrocínio pessoal.",
    weight: 3,
    options: [
      { key: "sign", label: "Assinar o contrato", description: "Mais grana e visibilidade, mas menos foco nos treinos.", ovrDelta: -1 },
      { key: "decline", label: "Recusar e focar em campo", description: "Prioriza o desempenho esportivo.", ovrDelta: 2 },
    ],
  },
  {
    key: "viral_moment",
    title: "Viralizou nas redes",
    description: "Um lance seu (ou uma comemoração) viralizou nas redes sociais.",
    weight: 3,
    options: [
      { key: "embrace", label: "Aproveitar o momento", description: "Curte a repercussão e interage com os fãs.", ovrDelta: -1 },
      { key: "ignore", label: "Manter a rotina normal", description: "Não deixa a badalação afetar a semana de trabalho.", ovrDelta: 1 },
    ],
  },
  {
    key: "national_team_call",
    title: "Convocação para a seleção",
    description: "A comissão técnica da seleção nacional te chamou para os próximos amistosos.",
    minReputation: 38,
    weight: 4,
    options: [
      { key: "accept", label: "Aceitar e defender o país", description: "Nível de jogo mais alto, grande salto de repertório.", ovrDelta: 3 },
      { key: "decline", label: "Pedir dispensa por cansaço", description: "Prioriza a recuperação física.", ovrDelta: 0 },
    ],
  },
  {
    key: "charity_event",
    title: "Convite para evento beneficente",
    description: "Uma instituição social pediu sua presença em uma ação com a comunidade.",
    weight: 2,
    options: [
      { key: "join", label: "Participar do evento", description: "Fortalece sua imagem, mas tira tempo de treino.", ovrDelta: 0 },
      { key: "skip", label: "Agradecer e recusar", description: "Usa o tempo livre pra treinar mais.", ovrDelta: 1 },
    ],
  },
  {
    key: "nightlife_temptation",
    title: "Convite para uma festa badalada",
    description: "Colegas de elenco te chamaram pra uma festa na véspera de uma semana decisiva.",
    weight: 3,
    options: [
      { key: "go", label: "Ir mesmo assim", description: "Relaxa a cabeça, mas o corpo cobra o preço.", ovrDelta: -3 },
      { key: "stay", label: "Ficar em casa, focado", description: "Descansa pensando na próxima janela de decisões.", ovrDelta: 1 },
    ],
  },
  {
    key: "investment_offer",
    title: "Oportunidade de investimento",
    description: "Um agente financeiro sugeriu investir parte do seu salário em um novo negócio.",
    weight: 2,
    options: [
      { key: "invest", label: "Investir uma parte do salário", description: "A cabeça fica ocupada com outra coisa que não futebol.", ovrDelta: -1 },
      { key: "save", label: "Guardar com segurança", description: "Sem riscos, sem distrações.", ovrDelta: 0 },
    ],
  },
  {
    key: "controversial_interview",
    title: "Entrevista polêmica",
    description: "Um jornalista te provocou sobre um rival direto durante a coletiva.",
    weight: 2,
    options: [
      { key: "fire_back", label: "Provocar de volta", description: "A torcida ama, mas gera ruído em volta do elenco.", ovrDelta: -1 },
      { key: "diplomatic", label: "Resposta diplomática", description: "Evita polêmica e mantém a cabeça fria.", ovrDelta: 0 },
    ],
  },
  {
    key: "injury_comeback",
    title: "Volta de lesão",
    description: "O departamento médico avalia sua recuperação da última contusão.",
    requiresRecentInjury: true,
    weight: 5,
    options: [
      { key: "rush", label: "Antecipar o retorno", description: "Volta antes do previsto pra não perder espaço.", ovrDelta: -2 },
      { key: "respect_timeline", label: "Respeitar o prazo médico", description: "Recuperação completa, sem atalhos.", ovrDelta: 2 },
    ],
  },
  {
    key: "community_project",
    title: "Projeto social na base",
    description: "O clube te convidou para apadrinhar um projeto social com jovens da categoria de base.",
    weight: 2,
    options: [
      { key: "embrace", label: "Abraçar o projeto", description: "Bonito gesto, mas divide sua atenção.", ovrDelta: 0 },
      { key: "pass", label: "Recusar por falta de tempo", description: "Mantém o foco 100% nos treinos.", ovrDelta: 1 },
    ],
  },
  {
    key: "new_agent",
    title: "Proposta de novo empresário",
    description: "Um agente mais agressivo no mercado quer assumir sua carreira.",
    minReputation: 25,
    weight: 2,
    options: [
      { key: "switch", label: "Trocar de empresário", description: "Promete mais, mas mexe com sua cabeça no curto prazo.", ovrDelta: -1 },
      { key: "loyalty", label: "Manter o atual", description: "Confia em quem te trouxe até aqui.", ovrDelta: 1 },
    ],
  },
  {
    key: "documentary_offer",
    title: "Convite para um documentário",
    description: "Uma produtora quer contar sua trajetória em uma série documental.",
    minReputation: 45,
    weight: 2,
    options: [
      { key: "accept", label: "Topar o projeto", description: "Grande exposição de mídia, mas rotina mais corrida.", ovrDelta: -1 },
      { key: "decline", label: "Preservar a privacidade", description: "Prefere deixar o futebol falar por si.", ovrDelta: 1 },
    ],
  },
  {
    key: "fan_pressure",
    title: "Cobrança da torcida",
    description: "As redes sociais do clube estão pegando fogo cobrando um resultado melhor.",
    weight: 3,
    options: [
      { key: "respond_work", label: "Responder trabalhando calado", description: "Deixa o campo falar — a melhor resposta possível.", ovrDelta: 2 },
      { key: "respond_social", label: "Responder nas redes", description: "Ganha visibilidade, mas tira o foco.", ovrDelta: -1 },
    ],
  },
  {
    key: "fashion_invite",
    title: "Convite para desfile de moda",
    description: "Uma grife local te convidou pra ser a atração de um desfile beneficente.",
    minReputation: 30,
    weight: 1,
    options: [
      { key: "accept", label: "Aceitar o convite", description: "Mais uma faceta pública da sua imagem.", ovrDelta: -1 },
      { key: "decline", label: "Recusar, futebol em primeiro lugar", description: "Sem distrações fora de campo.", ovrDelta: 1 },
    ],
  },
  {
    key: "family_balance",
    title: "Tempo em família",
    description: "A pré-temporada terminou e você tem alguns dias de folga antes da estreia.",
    weight: 3,
    options: [
      { key: "rest", label: "Descansar com a família", description: "Recarrega as energias de verdade.", ovrDelta: 2 },
      { key: "extra_training", label: "Treino extra nas férias", description: "Sacrifica o descanso e acaba sobrecarregando.", ovrDelta: -1 },
    ],
  },
  {
    key: "captain_armband",
    title: "Braçadeira de capitão",
    description: "O técnico sugeriu seu nome pra vestir a braçadeira de capitão do time.",
    minReputation: 55,
    weight: 2,
    options: [
      { key: "accept", label: "Aceitar a responsabilidade", description: "Vira referência e liderança do elenco.", ovrDelta: 2 },
      { key: "decline", label: "Preferir não assumir agora", description: "Ainda não se sente pronto pro papel.", ovrDelta: 0 },
    ],
  },
  {
    key: "transfer_rumor",
    title: "Rumor de transferência na imprensa",
    description: "Veículos esportivos especulam sobre seu futuro sem confirmação do clube.",
    weight: 2,
    options: [
      { key: "demand_clarity", label: "Cobrar clareza da diretoria", description: "Reduz a ansiedade, mas gera atrito interno.", ovrDelta: -1 },
      { key: "ignore_rumor", label: "Ignorar e focar nos jogos", description: "Não alimenta a especulação.", ovrDelta: 1 },
    ],
  },
  {
    key: "risky_sponsorship",
    title: "Patrocínio de uma fintech duvidosa",
    description: "Uma empresa pouco conhecida oferece uma bolada pra você divulgar o produto.",
    weight: 2,
    options: [
      { key: "accept", label: "Aceitar o dinheiro fácil", description: "Encorpa a conta, mas tira o sono e o foco.", ovrDelta: -2 },
      { key: "decline", label: "Recusar por precaução", description: "Protege sua rotina e sua cabeça no longo prazo.", ovrDelta: 1 },
    ],
  },
];

export function pickExtraCampoEvent(
  rand: RandomFn,
  ctx: { age: number; reputation: number; recentInjury: boolean; excludeKeys: Set<string> },
): ExtraCampoEvent {
  const available = EXTRA_CAMPO_EVENTS.filter((e) => {
    if (ctx.excludeKeys.has(e.key)) return false;
    if (e.minAge && ctx.age < e.minAge) return false;
    if (e.maxAge && ctx.age > e.maxAge) return false;
    if (e.minReputation && ctx.reputation < e.minReputation) return false;
    if (e.requiresRecentInjury && !ctx.recentInjury) return false;
    return true;
  });

  const pool = available.length > 0 ? available : EXTRA_CAMPO_EVENTS.filter((e) => !e.minReputation && !e.requiresRecentInjury);
  return pickWeighted(
    rand,
    pool.map((e) => [e, e.weight] as [ExtraCampoEvent, number]),
  );
}
