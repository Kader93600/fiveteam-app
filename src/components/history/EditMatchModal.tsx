import { useState, useEffect } from 'react';
import type { Match, Player, MatchRatings } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface EditMatchModalProps {
  open: boolean;
  match: Match | null;
  allPlayers: Player[];
  onClose: () => void;
  onUpdate: (match: Match) => void;
  onDelete: (matchId: string) => void;
}

export function EditMatchModal({ open, match, allPlayers, onClose, onUpdate, onDelete }: EditMatchModalProps) {
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [mvpId, setMvpId] = useState('');
  const [ratings, setRatings] = useState<MatchRatings>({});

  useEffect(() => {
    if (match) {
      setTeam1Score(match.team1Score);
      setTeam2Score(match.team2Score);
      setMvpId(match.mvpId);
      setRatings({ ...match.ratings });
    }
  }, [match]);

  if (!match) return null;

  const matchPlayers = [...match.team1Players, ...match.team2Players]
    .map((id) => allPlayers.find((p) => p.id === id))
    .filter((p): p is Player => !!p);

  const handleUpdate = () => {
    onUpdate({
      ...match,
      team1Score,
      team2Score,
      mvpId,
      ratings,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(match.id);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Modifier Match"
      footer={
        <>
          <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={handleUpdate}>Sauvegarder</Button>
        </>
      }
    >
      <div className="form-group">
        <label>Équipe 1 - Score</label>
        <input type="number" min={0} value={team1Score} onChange={(e) => setTeam1Score(parseInt(e.target.value) || 0)} />
      </div>
      <div className="form-group">
        <label>Équipe 2 - Score</label>
        <input type="number" min={0} value={team2Score} onChange={(e) => setTeam2Score(parseInt(e.target.value) || 0)} />
      </div>
      <div className="form-group">
        <label>Homme du Match</label>
        <select value={mvpId} onChange={(e) => setMvpId(e.target.value)}>
          {matchPlayers.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: 12, borderTop: '1px solid rgba(148, 163, 184, 0.2)', paddingTop: 12 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
          Notes (0-10)
        </label>
        {matchPlayers.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <label style={{ flex: 1, fontSize: 13 }}>{p.name}</label>
            <input
              type="number"
              min={0}
              max={10}
              value={ratings[p.id] ?? 5}
              onChange={(e) => setRatings((prev) => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
              style={{ width: 60 }}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
}
