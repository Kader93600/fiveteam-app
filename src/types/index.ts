export interface PlayerStats {
  matches: number;
  totalRating: number;
  mvpCount: number;
  wins: number;
}

export interface Player {
  id: string;
  name: string;
  photo: string | null;
  level: number;
  role: PlayerRole;
  stats: PlayerStats;
}

export type PlayerRole = '' | 'Gardien' | 'Défenseur' | 'Milieu' | 'Attaquant';

export interface Team {
  name: string;
  logo: string | null;
  color: string;
  players: Player[];
}

export interface MatchRatings {
  [playerId: string]: number;
}

export interface Match {
  id: string;
  date: string;
  team1: string;
  team2: string;
  team1Players: string[];
  team2Players: string[];
  team1Score: number;
  team2Score: number;
  mvpId: string;
  ratings: MatchRatings;
}

export interface FieldPositions {
  [playerId: string]: { x: number; y: number };
}

export type GenerationMode = 'random' | 'balanced';

export type StatsFilter = 'all' | 'mvp' | 'topRating';

export type TabName = 'joueurs' | 'equipes' | 'terrain' | 'historique' | 'stats';

export interface AppState {
  players: Player[];
  matches: Match[];
  team1: Team;
  team2: Team;
  selectedPlayers: string[];
  fieldPositions: FieldPositions;
  activeTab: TabName;
  statsFilter: StatsFilter;
}

export interface PlayerWithComputedStats extends Player {
  avgRating: number;
  winRate: number;
}
