import { useState, useMemo } from 'react';
import type { Player, MatchRatings } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface SaveMatchModalProps {
  open: boolean;
  onClose: () => void;
  allPlayers: Player[];
  onSave: (data: {
    team1Score: number;
    team2Score: number;
    mvpId: string;
    ratings: MatchRatings;
  }) => void;
}

export function SaveMatchModal({ open, onClose, allPlayers, onSave }: SaveMatchModalProps) {
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [mvpId, setMvpId] = useState(allPlayers[0]?.id ?? '');
  const [ratings, setRatings] = useState<MatchRatings>(() => {
    const r: MatchRatings = {};
    allPlayers.forEach((p) => { r[p.id] = 5; });
    return r;
  });

  // Reset when modal opens with new players
  useMemo(() => {
    if (open && allPlayers.length > 0) {
      setMvpId(allPlayers[0].id);
      const r: MatchRatings = {};
      allPlayers.forEach((p) => { r[p.id] = 5; });
      setRatings(r);
      setTeam1Score(0);
      setTeam2Score(0);
    }
  }, [open, allPlayers]);

  const handleSave = () => {
    onSave({ team1Score, team2Score, mvpId, ratings });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sauvegarder Match"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={handleSave}>Sauvegarder</Button>
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
          {allPlayers.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: 12, borderTop: '1px solid rgba(148, 163, 184, 0.2)', paddingTop: 12 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
          Notes (0-10)
        </label>
        {allPlayers.map((p) => (
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
