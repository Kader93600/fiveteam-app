import type { Player, Match, Team, FieldPositions } from '../types';

const STORAGE_KEYS = {
  players: 'fiveteam_players',
  matches: 'fiveteam_matches',
  teams: 'fiveteam_teams',
  fieldPositions: 'fiveteam_fieldPositions',
} as const;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save to localStorage (key: ${key}):`, e);
  }
}

export const storage = {
  loadPlayers(): Player[] {
    return safeGet<Player[]>(STORAGE_KEYS.players, []);
  },

  savePlayers(players: Player[]): void {
    safeSet(STORAGE_KEYS.players, players);
  },

  loadMatches(): Match[] {
    return safeGet<Match[]>(STORAGE_KEYS.matches, []);
  },

  saveMatches(matches: Match[]): void {
    safeSet(STORAGE_KEYS.matches, matches);
  },

  loadTeams(): { team1: Team; team2: Team } | null {
    return safeGet<{ team1: Team; team2: Team } | null>(STORAGE_KEYS.teams, null);
  },

  saveTeams(team1: Team, team2: Team): void {
    safeSet(STORAGE_KEYS.teams, { team1, team2 });
  },

  loadFieldPositions(): FieldPositions {
    return safeGet<FieldPositions>(STORAGE_KEYS.fieldPositions, {});
  },

  saveFieldPositions(positions: FieldPositions): void {
    safeSet(STORAGE_KEYS.fieldPositions, positions);
  },
};
