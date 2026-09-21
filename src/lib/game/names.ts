import type { RandomFn } from "./rng";
import { pick } from "./rng";

export const COUNTRY_SEED = [
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "EN", name: "Inglaterra", flag: "🏴" },
  { code: "ES", name: "Espanha", flag: "🇪🇸" },
] as const;

export type CountryCode = (typeof COUNTRY_SEED)[number]["code"];

const FIRST_NAMES: Record<CountryCode, string[]> = {
  BR: ["Kaique", "Gabriel", "Matheus", "Lucas", "Vinícius", "Rafael", "Bruno", "Heitor", "Davi", "Iago", "Emerson", "Wendell"],
  AR: ["Thiago", "Nahuel", "Franco", "Matías", "Ezequiel", "Rodrigo", "Julián", "Santiago", "Bruno", "Lautaro", "Ignacio"],
  PT: ["Rodrigo", "Gonçalo", "Tiago", "Diogo", "André", "Francisco", "João", "Rúben", "Nuno", "Afonso", "Bernardo"],
  EN: ["Jack", "Harry", "Oliver", "George", "Charlie", "Jacob", "Thomas", "Alfie", "Freddie", "Archie", "Leo"],
  ES: ["Pablo", "Álvaro", "Hugo", "Mario", "Sergio", "Adrián", "Iker", "Nico", "Marc", "Bruno", "Izan"],
};

const LAST_NAMES: Record<CountryCode, string[]> = {
  BR: ["Silva", "Souza", "Oliveira", "Santos", "Pereira", "Costa", "Ferreira", "Almeida", "Rocha", "Carvalho", "Barbosa"],
  AR: ["González", "Rodríguez", "Fernández", "López", "Martínez", "Pérez", "Sosa", "Romero", "Díaz", "Acosta"],
  PT: ["Silva", "Santos", "Ferreira", "Pereira", "Costa", "Carvalho", "Gomes", "Marques", "Ribeiro", "Teixeira"],
  EN: ["Smith", "Jones", "Taylor", "Brown", "Wilson", "Evans", "Walker", "Robinson", "Wright", "Turner"],
  ES: ["García", "Martín", "Sánchez", "Romero", "Navarro", "Torres", "Domínguez", "Vázquez", "Ramos", "Gil"],
};

export function suggestPlayerName(rand: RandomFn, country: CountryCode): string {
  return `${pick(rand, FIRST_NAMES[country])} ${pick(rand, LAST_NAMES[country])}`;
}

// ---------- Geração de nomes de clube ----------

const CITY_BY_COUNTRY: Record<CountryCode, string[]> = {
  BR: ["Porto Novo", "Serra Alta", "Vale Verde", "Baía do Sul", "Campo Grande", "Rio Fundo", "Monte Azul", "Litoral Norte", "Bela Vista", "Pedra Branca", "Alto da Serra", "Vila Real do Sul"],
  AR: ["Costa Brava", "San Ramón", "Villa Nueva", "Puerto Sur", "Monte Alto", "Río Seco", "San Telmo Chico", "La Bahía", "Cerro Grande", "Nueva Esperanza"],
  PT: ["Vilanova", "Serra d'Ouro", "Porto Fundo", "Águas Claras", "Monte Real", "Costa do Norte", "Ribeira Alta", "Vale do Tejo", "Cabo Verde do Sul", "Alto Douro"],
  EN: ["Ashford", "Millbrook", "Redcliff", "Stonebridge", "Kingswood", "Fairmont", "Blackfriars", "Whitmoor", "Eastvale", "Northgate"],
  ES: ["Puerto Alto", "Villareal Norte", "Costa Serena", "Sierra Nueva", "Vega Dorada", "Monteclaro", "Ribadeo Sur", "Campomar", "Torreblanca", "Alcalá Vieja"],
};

const CLUB_SUFFIX: Record<CountryCode, string[]> = {
  BR: ["Esporte Clube", "Atlético", "Futebol Clube", "Clube Atlético", "Esportivo"],
  AR: ["Club Atlético", "Deportivo", "Atlético", "Club Social y Deportivo"],
  PT: ["Futebol Clube", "Sport Clube", "Grupo Desportivo", "Clube Desportivo"],
  EN: ["FC", "United", "City", "Town", "Athletic"],
  ES: ["Club Deportivo", "Real", "Unión Deportiva", "Atlético"],
};

export function generateTeamName(rand: RandomFn, country: CountryCode, usedNames: Set<string>): { name: string; short: string } {
  const cities = CITY_BY_COUNTRY[country];
  const suffixes = CLUB_SUFFIX[country];
  for (let attempt = 0; attempt < 50; attempt++) {
    const city = pick(rand, cities);
    const suffix = pick(rand, suffixes);
    const name = country === "EN" ? `${city} ${suffix}` : `${suffix} ${city}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      const short = city
        .split(" ")
        .map((w) => w.slice(0, 1))
        .join("")
        .toUpperCase()
        .slice(0, 3) || city.slice(0, 3).toUpperCase();
      return { name, short: short.length >= 2 ? short : city.slice(0, 3).toUpperCase() };
    }
  }
  const fallback = `${pick(rand, suffixes)} ${pick(rand, cities)} ${usedNames.size}`;
  usedNames.add(fallback);
  return { name: fallback, short: fallback.slice(0, 3).toUpperCase() };
}

export function initialsFromName(name: string): string {
  const words = name.replace(/^(Esporte Clube|Clube Atlético|Club Atlético|Club Social y Deportivo|Futebol Clube|Sport Clube|Grupo Desportivo|Clube Desportivo|Club Deportivo|Unión Deportiva|Atlético|Real|Deportivo|Esportivo)\s+/i, "").split(" ");
  const letters = words.map((w) => w[0]).join("");
  return letters.slice(0, 3).toUpperCase();
}
