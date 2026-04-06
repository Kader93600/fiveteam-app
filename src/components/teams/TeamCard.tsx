import { useRef } from 'react';
import type { Team } from '../../types';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

interface TeamCardProps {
  teamKey: 'team1' | 'team2';
  team: Team;
}

export function TeamCard({ teamKey, team }: TeamCardProps) {
  const { dispatch } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avg = team.players.length > 0
    ? (team.players.reduce((sum, p) => sum + p.level, 0) / team.players.length).toFixed(1)
    : '0';

  const handleLogoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      dispatch({
        type: 'UPDATE_TEAM',
        payload: { team: teamKey, updates: { logo: ev.target?.result as string } },
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="team-card" style={{ borderColor: team.color }}>
      <h3 style={{ color: team.color }}>
        {team.logo ? (
          <img src={team.logo} style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} alt="Logo" />
        ) : '🏆'}
        <input
          type="text"
          className="team-card-input"
          value={team.name}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_TEAM',
              payload: { team: teamKey, updates: { name: e.target.value || (teamKey === 'team1' ? 'Équipe 1' : 'Équipe 2') } },
            })
          }
          placeholder="Nom équipe"
        />
      </h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <Button variant="secondary" size="sm" onClick={handleLogoUpload}>Logo</Button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        <label
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
            background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: 6, cursor: 'pointer', fontSize: 12,
          }}
        >
          Couleur:
          <input
            type="color"
            value={team.color}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_TEAM', payload: { team: teamKey, updates: { color: e.target.value } } })
            }
            style={{ width: 30, height: 30, cursor: 'pointer', border: 'none', borderRadius: 4 }}
          />
        </label>
      </div>

      <div className="team-stats">
        <div className="team-stat-item">
          <span className="team-stat-value">{team.players.length}</span>
          <span className="team-stat-label">Joueurs</span>
        </div>
        <div className="team-stat-item">
          <span className="team-stat-value">{avg}</span>
          <span className="team-stat-label">Niveau moy.</span>
        </div>
      </div>

      <div className="team-players">
        {team.players.map((p) => (
          <div key={p.id}>
            ⚽ <span className="player-name">{p.name}</span>{' '}
            <span style={{ color: '#94a3b8' }}>({p.role})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
