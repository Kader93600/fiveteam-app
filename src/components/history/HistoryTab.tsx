import { useState, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { Match, MatchRatings } from '../../types';
import { MatchCard } from './MatchCard';
import { SaveMatchModal } from './SaveMatchModal';
import { EditMatchModal } from './EditMatchModal';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export function HistoryTab() {
  const { state, dispatch } = useApp();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  const allTeamPlayers = useMemo(
    () => [...state.team1.players, ...state.team2.players],
    [state.team1.players, state.team2.players]
  );

  const editingMatch = useMemo(
    () => state.matches.find((m) => m.id === editingMatchId) ?? null,
    [state.matches, editingMatchId]
  );

  const handleShowSave = () => {
    if (state.team1.players.length === 0) {
      alert("Générez d'abord une composition d'équipes");
      return;
    }
    setSaveModalOpen(true);
  };

  const handleSaveMatch = useCallback((data: {
    team1Score: number;
    team2Score: number;
    mvpId: string;
    ratings: MatchRatings;
  }) => {
    const matchData = {
      date: new Date().toISOString(),
      team1: state.team1.name,
      team2: state.team2.name,
      team1Players: state.team1.players.map((p) => p.id),
      team2Players: state.team2.players.map((p) => p.id),
      ...data,
    };

    dispatch({ type: 'ADD_MATCH', payload: matchData });

    // Find the match that was just added (it's the last one after dispatch)
    // We need to build the match object to update stats
    const match: Match = { ...matchData, id: '' }; // id doesn't matter for stats
    dispatch({ type: 'UPDATE_PLAYER_STATS_FROM_MATCH', payload: { match } });
  }, [state.team1, state.team2, dispatch]);

  const handleUpdateMatch = useCallback((updatedMatch: Match) => {
    const oldMatch = state.matches.find((m) => m.id === updatedMatch.id);
    if (!oldMatch) return;

    // Revert old stats, apply new
    dispatch({ type: 'UPDATE_PLAYER_STATS_FROM_MATCH', payload: { match: oldMatch, revert: true } });
    dispatch({ type: 'UPDATE_MATCH', payload: updatedMatch });
    dispatch({ type: 'UPDATE_PLAYER_STATS_FROM_MATCH', payload: { match: updatedMatch } });
  }, [state.matches, dispatch]);

  const handleDeleteMatch = useCallback((matchId: string) => {
    const match = state.matches.find((m) => m.id === matchId);
    if (match) {
      dispatch({ type: 'UPDATE_PLAYER_STATS_FROM_MATCH', payload: { match, revert: true } });
    }
    dispatch({ type: 'DELETE_MATCH', payload: matchId });
  }, [state.matches, dispatch]);

  return (
    <>
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <h2 style={{ color: '#4ade80', fontSize: 16 }}>Historique des Matchs</h2>
        <Button variant="primary" size="sm" onClick={handleShowSave}>Sauvegarder Match</Button>
      </div>

      {state.matches.length === 0 ? (
        <EmptyState icon="📊" message="Aucun match sauvegardé" />
      ) : (
        state.matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            players={state.players}
            onEdit={setEditingMatchId}
          />
        ))
      )}

      <SaveMatchModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        allPlayers={allTeamPlayers}
        onSave={handleSaveMatch}
      />

      <EditMatchModal
        open={!!editingMatchId}
        match={editingMatch}
        allPlayers={state.players}
        onClose={() => setEditingMatchId(null)}
        onUpdate={handleUpdateMatch}
        onDelete={handleDeleteMatch}
      />
    </>
  );
}
