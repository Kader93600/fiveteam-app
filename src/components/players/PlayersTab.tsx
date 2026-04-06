import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import type { PlayerRole } from '../../types';
import { PlayerForm } from './PlayerForm';
import { PlayerItem } from './PlayerItem';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function PlayersTab() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [editData, setEditData] = useState<{
    name: string;
    photo: string | null;
    level: number;
    role: PlayerRole;
  } | null>(null);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return state.players.filter((p) => p.name.toLowerCase().includes(term));
  }, [state.players, search]);

  const handleEdit = useCallback((id: string) => {
    const player = state.players.find((p) => p.id === id);
    if (!player) return;
    setEditData({
      name: player.name,
      photo: player.photo,
      level: player.level,
      role: player.role,
    });
    dispatch({ type: 'DELETE_PLAYER', payload: id });
  }, [state.players, dispatch]);

  const handleDelete = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PLAYER', payload: id });
  }, [dispatch]);

  const handleSelectAll = () => {
    dispatch({ type: 'SET_SELECTED_PLAYERS', payload: state.players.map((p) => p.id) });
  };

  const handleDeselectAll = () => {
    dispatch({ type: 'SET_SELECTED_PLAYERS', payload: [] });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_PLAYERS' });
    setConfirmReset(false);
  };

  return (
    <>
      <PlayerForm
        key={editData?.name ?? 'new'}
        editData={editData}
        onClearEdit={() => setEditData(null)}
      />

      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher des joueurs..."
          style={{ marginBottom: 0, flex: 1 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="secondary" size="sm" onClick={handleSelectAll}>Tous</Button>
        <Button variant="secondary" size="sm" onClick={handleDeselectAll}>Aucun</Button>
      </div>

      <div>
        {filtered.length === 0 ? (
          <EmptyState icon="👥" message="Aucun joueur trouvé" />
        ) : (
          filtered.map((player) => (
            <PlayerItem
              key={player.id}
              player={player}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <Button
        variant="danger"
        style={{ width: '100%', marginTop: 16 }}
        onClick={() => setConfirmReset(true)}
      >
        Réinitialiser Tous les Joueurs
      </Button>

      <ConfirmDialog
        open={confirmReset}
        message="Êtes-vous sûr de vouloir supprimer tous les joueurs?"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  );
}
