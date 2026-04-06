import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateTeams } from '../../services/teamGenerator';
import type { GenerationMode } from '../../types';
import { PlayerSelection } from './PlayerSelection';
import { TeamCard } from './TeamCard';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function TeamsTab() {
  const { state, dispatch } = useApp();
  const [playersPerTeam, setPlayersPerTeam] = useState(5);
  const [mode, setMode] = useState<GenerationMode>('random');
  const [confirmReset, setConfirmReset] = useState(false);

  const handleGenerate = () => {
    if (state.selectedPlayers.length < 6) {
      alert('Sélectionnez au moins 6 joueurs');
      return;
    }
    if (state.selectedPlayers.length < playersPerTeam * 2) {
      alert(`Vous devez sélectionner au moins ${playersPerTeam * 2} joueurs`);
      return;
    }

    const selectedPlayerObjects = state.selectedPlayers
      .map((id) => state.players.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => !!p);

    const [team1Players, team2Players] = generateTeams(selectedPlayerObjects, playersPerTeam, mode);

    dispatch({ type: 'SET_TEAMS', payload: { team1Players, team2Players } });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_TEAMS' });
    setConfirmReset(false);
  };

  const hasTeams = state.team1.players.length > 0;

  return (
    <>
      <div className="team-config">
        <h2 style={{ color: '#4ade80', marginBottom: 12, fontSize: 16 }}>Configuration d'Équipe</h2>

        <div className="form-row">
          <div className="form-group">
            <label>Joueurs par Équipe</label>
            <input
              type="number"
              min={3}
              max={11}
              value={playersPerTeam}
              onChange={(e) => setPlayersPerTeam(parseInt(e.target.value) || 5)}
            />
          </div>
          <div className="form-group">
            <label>Mode de Génération</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as GenerationMode)}>
              <option value="random">Aléatoire</option>
              <option value="balanced">Équilibré (Snake Draft)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Sélectionner des Joueurs (min: 6)</label>
          <div style={{
            maxHeight: 200, overflowY: 'auto', padding: 8,
            background: 'rgba(30, 41, 59, 0.6)', borderRadius: 8,
          }}>
            <PlayerSelection />
          </div>
        </div>

        <Button variant="primary" style={{ width: '100%' }} onClick={handleGenerate}>
          Générer les Équipes
        </Button>
      </div>

      {hasTeams ? (
        <>
          <TeamCard teamKey="team1" team={state.team1} />
          <TeamCard teamKey="team2" team={state.team2} />
        </>
      ) : (
        <EmptyState icon="🏆" message="Générez d'abord les équipes" />
      )}

      <Button
        variant="secondary"
        style={{ width: '100%', marginTop: 16 }}
        onClick={() => setConfirmReset(true)}
      >
        Réinitialiser Composition
      </Button>

      <ConfirmDialog
        open={confirmReset}
        message="Réinitialiser la composition des équipes?"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  );
}
