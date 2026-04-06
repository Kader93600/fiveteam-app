import type { Player } from '../../types';
import { starsString } from '../../utils/helpers';
import { Button } from '../ui/Button';

interface PlayerItemProps {
  player: Player;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PlayerItem({ player, onEdit, onDelete }: PlayerItemProps) {
  return (
    <div className="player-item">
      <div className="player-info">
        {player.photo ? (
          <img
            src={player.photo}
            className="player-avatar"
            alt={player.name}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div
            className="player-avatar"
            style={{
              background: 'rgba(34, 197, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            👤
          </div>
        )}
        <div className="player-details">
          <div className="player-name">{player.name}</div>
          <div className="player-meta">
            <span className="player-level">{starsString(player.level)}</span>
            <span style={{ color: '#cbd5e1', margin: '0 4px' }}>•</span>
            <span style={{ color: '#cbd5e1' }}>{player.role || 'Aucune'}</span>
          </div>
        </div>
      </div>
      <div className="player-actions">
        <Button variant="secondary" size="sm" onClick={() => onEdit(player.id)}>✎</Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(player.id)}>✕</Button>
      </div>
    </div>
  );
}
