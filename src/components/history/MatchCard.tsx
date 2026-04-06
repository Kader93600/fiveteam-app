import type { Match, Player } from '../../types';
import { formatDate } from '../../utils/helpers';
import { Button } from '../ui/Button';

interface MatchCardProps {
  match: Match;
  players: Player[];
  onEdit: (matchId: string) => void;
}

export function MatchCard({ match, players, onEdit }: MatchCardProps) {
  const mvpPlayer = players.find((p) => p.id === match.mvpId);

  const renderTeamPlayers = (playerIds: string[]) =>
    playerIds.map((id) => {
      const p = players.find((pl) => pl.id === id);
      return p ? <div key={id}>{p.name} ({match.ratings[id] || '-'}/10)</div> : null;
    });

  return (
    <div className="match-card">
      <div className="match-header">
        <span className="match-date">{formatDate(match.date)}</span>
        <span className="match-score">
          {match.team1Score} - {match.team2Score}
        </span>
      </div>
      <div className="match-teams">
        <div className="match-team">
          <div className="match-team-name">{match.team1}</div>
          <div className="match-players">{renderTeamPlayers(match.team1Players)}</div>
        </div>
        <div className="match-team">
          <div className="match-team-name">{match.team2}</div>
          <div className="match-players">{renderTeamPlayers(match.team2Players)}</div>
        </div>
      </div>
      {mvpPlayer && <div className="match-mvp">🏆 MVP: {mvpPlayer.name}</div>}
      <div className="match-actions">
        <Button variant="secondary" size="sm" onClick={() => onEdit(match.id)}>Modifier</Button>
      </div>
    </div>
  );
}
