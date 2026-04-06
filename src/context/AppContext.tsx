import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type {
  AppState, Player, Match, Team, FieldPositions,
  TabName, StatsFilter, PlayerRole,
} from '../types';
import { storage } from '../services/storage';
import { generateId } from '../utils/helpers';

// ─── Actions ───────────────────────────────────────────────
type Action =
  | { type: 'ADD_PLAYER'; payload: { name: string; photo: string | null; level: number; role: PlayerRole } }
  | { type: 'DELETE_PLAYER'; payload: string }
  | { type: 'RESET_PLAYERS' }
  | { type: 'SET_SELECTED_PLAYERS'; payload: string[] }
  | { type: 'TOGGLE_PLAYER_SELECTION'; payload: string }
  | { type: 'SET_TEAMS'; payload: { team1Players: Player[]; team2Players: Player[] } }
  | { type: 'UPDATE_TEAM'; payload: { team: 'team1' | 'team2'; updates: Partial<Team> } }
  | { type: 'RESET_TEAMS' }
  | { type: 'SET_FIELD_POSITIONS'; payload: FieldPositions }
  | { type: 'UPDATE_FIELD_POSITION'; payload: { playerId: string; x: number; y: number } }
  | { type: 'ADD_MATCH'; payload: Omit<Match, 'id'> }
  | { type: 'UPDATE_MATCH'; payload: Match }
  | { type: 'DELETE_MATCH'; payload: string }
  | { type: 'SET_TAB'; payload: TabName }
  | { type: 'SET_STATS_FILTER'; payload: StatsFilter }
  | { type: 'UPDATE_PLAYER_STATS_FROM_MATCH'; payload: { match: Match; revert?: boolean } };

// ─── Initial state ─────────────────────────────────────────
function loadInitialState(): AppState {
  const players = storage.loadPlayers();
  const matches = storage.loadMatches();
  const savedTeams = storage.loadTeams();
  const fieldPositions = storage.loadFieldPositions();

  return {
    players,
    matches,
    team1: savedTeams?.team1 ?? { name: 'Équipe 1', logo: null, color: '#22c55e', players: [] },
    team2: savedTeams?.team2 ?? { name: 'Équipe 2', logo: null, color: '#3b82f6', players: [] },
    selectedPlayers: [],
    fieldPositions,
    activeTab: 'joueurs',
    statsFilter: 'all',
  };
}

// ─── Reducer ───────────────────────────────────────────────
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_PLAYER': {
      const newPlayer: Player = {
        id: generateId(),
        name: action.payload.name,
        photo: action.payload.photo,
        level: action.payload.level,
        role: action.payload.role,
        stats: { matches: 0, totalRating: 0, mvpCount: 0, wins: 0 },
      };
      return { ...state, players: [...state.players, newPlayer] };
    }

    case 'DELETE_PLAYER': {
      const id = action.payload;
      const { [id]: _, ...restPositions } = state.fieldPositions;
      return {
        ...state,
        players: state.players.filter((p) => p.id !== id),
        selectedPlayers: state.selectedPlayers.filter((pid) => pid !== id),
        fieldPositions: restPositions,
      };
    }

    case 'RESET_PLAYERS':
      return { ...state, players: [], selectedPlayers: [], fieldPositions: {} };

    case 'SET_SELECTED_PLAYERS':
      return { ...state, selectedPlayers: action.payload };

    case 'TOGGLE_PLAYER_SELECTION': {
      const id = action.payload;
      const selected = state.selectedPlayers.includes(id)
        ? state.selectedPlayers.filter((pid) => pid !== id)
        : [...state.selectedPlayers, id];
      return { ...state, selectedPlayers: selected };
    }

    case 'SET_TEAMS':
      return {
        ...state,
        team1: { ...state.team1, players: action.payload.team1Players },
        team2: { ...state.team2, players: action.payload.team2Players },
        fieldPositions: {},
      };

    case 'UPDATE_TEAM': {
      const { team, updates } = action.payload;
      return { ...state, [team]: { ...state[team], ...updates } };
    }

    case 'RESET_TEAMS':
      return {
        ...state,
        team1: { ...state.team1, players: [] },
        team2: { ...state.team2, players: [] },
        selectedPlayers: [],
        fieldPositions: {},
      };

    case 'SET_FIELD_POSITIONS':
      return { ...state, fieldPositions: action.payload };

    case 'UPDATE_FIELD_POSITION':
      return {
        ...state,
        fieldPositions: {
          ...state.fieldPositions,
          [action.payload.playerId]: { x: action.payload.x, y: action.payload.y },
        },
      };

    case 'ADD_MATCH': {
      const match: Match = { ...action.payload, id: generateId() };
      return { ...state, matches: [...state.matches, match] };
    }

    case 'UPDATE_MATCH':
      return {
        ...state,
        matches: state.matches.map((m) =>
          m.id === action.payload.id ? action.payload : m
        ),
      };

    case 'DELETE_MATCH':
      return {
        ...state,
        matches: state.matches.filter((m) => m.id !== action.payload),
      };

    case 'UPDATE_PLAYER_STATS_FROM_MATCH': {
      const { match, revert } = action.payload;
      const factor = revert ? -1 : 1;
      const allIds = [...match.team1Players, ...match.team2Players];

      const updatedPlayers = state.players.map((player) => {
        if (!allIds.includes(player.id)) return player;

        const rating = match.ratings[player.id] ?? 5;
        const isWinner =
          (match.team1Players.includes(player.id) && match.team1Score > match.team2Score) ||
          (match.team2Players.includes(player.id) && match.team2Score > match.team1Score);
        const isMvp = match.mvpId === player.id;

        return {
          ...player,
          stats: {
            matches: player.stats.matches + factor,
            totalRating: player.stats.totalRating + rating * factor,
            mvpCount: player.stats.mvpCount + (isMvp ? factor : 0),
            wins: player.stats.wins + (isWinner ? factor : 0),
          },
        };
      });

      return { ...state, players: updatedPlayers };
    }

    case 'SET_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_STATS_FILTER':
      return { ...state, statsFilter: action.payload };

    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadInitialState);

  // Persist to localStorage on state changes
  useEffect(() => {
    storage.savePlayers(state.players);
  }, [state.players]);

  useEffect(() => {
    storage.saveMatches(state.matches);
  }, [state.matches]);

  useEffect(() => {
    storage.saveTeams(state.team1, state.team2);
  }, [state.team1, state.team2]);

  useEffect(() => {
    storage.saveFieldPositions(state.fieldPositions);
  }, [state.fieldPositions]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
