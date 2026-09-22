import type { RandomFn } from "./rng";
import { pick } from "./rng";

// Países cujas ligas de elite estão disponíveis no plano gratuito da football-data.org
// (ver prisma/sync-football-data.ts). O code é o mesmo `area.code` (3 letras) retornado pela API.
export const COUNTRY_SEED = [
  { code: "BRA", name: "Brasil", flag: "🇧🇷" },
  { code: "ENG", name: "Inglaterra", flag: "🏴" },
  { code: "ESP", name: "Espanha", flag: "🇪🇸" },
  { code: "FRA", name: "França", flag: "🇫🇷" },
  { code: "DEU", name: "Alemanha", flag: "🇩🇪" },
  { code: "ITA", name: "Itália", flag: "🇮🇹" },
  { code: "NLD", name: "Holanda", flag: "🇳🇱" },
  { code: "POR", name: "Portugal", flag: "🇵🇹" },
] as const;

export type CountryCode = (typeof COUNTRY_SEED)[number]["code"];

const FIRST_NAMES: Record<CountryCode, string[]> = {
  BRA: ["Kaique", "Gabriel", "Matheus", "Lucas", "Vinícius", "Rafael", "Bruno", "Heitor", "Davi", "Iago", "Emerson", "Wendell"],
  ENG: ["Jack", "Harry", "Oliver", "George", "Charlie", "Jacob", "Thomas", "Alfie", "Freddie", "Archie", "Leo"],
  ESP: ["Pablo", "Álvaro", "Hugo", "Mario", "Sergio", "Adrián", "Iker", "Nico", "Marc", "Bruno", "Izan"],
  FRA: ["Kylian", "Antoine", "Ousmane", "Adrien", "Théo", "Lucas", "Hugo", "Mathis", "Enzo", "Nathan", "Rayan", "Warren"],
  DEU: ["Leon", "Jamal", "Florian", "Niklas", "Maximilian", "Julian", "Luca", "Elias", "Finn", "Noah", "Paul", "Jonas"],
  ITA: ["Federico", "Nicolò", "Lorenzo", "Gianluigi", "Alessandro", "Matteo", "Andrea", "Davide", "Riccardo", "Marco", "Giovanni", "Simone"],
  NLD: ["Virgil", "Memphis", "Frenkie", "Matthijs", "Cody", "Denzel", "Xavi", "Ryan", "Jurrien", "Noa", "Sven", "Daan"],
  POR: ["Rodrigo", "Gonçalo", "Tiago", "Diogo", "André", "Francisco", "João", "Rúben", "Nuno", "Afonso", "Bernardo"],
};

const LAST_NAMES: Record<CountryCode, string[]> = {
  BRA: ["Silva", "Souza", "Oliveira", "Santos", "Pereira", "Costa", "Ferreira", "Almeida", "Rocha", "Carvalho", "Barbosa"],
  ENG: ["Smith", "Jones", "Taylor", "Brown", "Wilson", "Evans", "Walker", "Robinson", "Wright", "Turner"],
  ESP: ["García", "Martín", "Sánchez", "Romero", "Navarro", "Torres", "Domínguez", "Vázquez", "Ramos", "Gil"],
  FRA: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent"],
  DEU: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Hoffmann", "Schulz", "Bauer", "Koch"],
  ITA: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo"],
  NLD: ["de Jong", "Jansen", "de Vries", "van den Berg", "van Dijk", "Bakker", "Visser", "Smit", "Meijer", "de Boer", "Mulder", "Dekker"],
  POR: ["Silva", "Santos", "Ferreira", "Pereira", "Costa", "Carvalho", "Gomes", "Marques", "Ribeiro", "Teixeira"],
};

export function suggestPlayerName(rand: RandomFn, country: CountryCode): string {
  return `${pick(rand, FIRST_NAMES[country])} ${pick(rand, LAST_NAMES[country])}`;
}
