import type { PlayerWithComputedStats } from '../../types';

interface StatCardProps {
  player: PlayerWithComputedStats;
  rank: number;
}

export function StatCard({ player, rank }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span style={{ fontSize: 18, fontWeight: 700, color: '#4ade80', width: 30, textAlign: 'center' }}>
          #{rank}
        </span>
        {player.photo ? (
          <img
            src={player.photo}
            className="stat-avatar"
            alt={player.name}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div
            className="stat-avatar"
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
        <div>
          <div className="stat-name">{player.name}</div>
          <div className="stat-meta">{player.role} • Niveau {player.level}</div>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-item">
          <div className="stat-value">{player.stats.matches}</div>
          <div className="stat-label">Matchs</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{player.avgRating.toFixed(1)}</div>
          <div className="stat-label">Note moy.</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{player.stats.mvpCount}</div>
          <div className="stat-label">MVP</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{player.winRate.toFixed(0)}%</div>
          <div className="stat-label">Victoires</div>
        </div>
      </div>
      <div className="stat-bar">
        <div
          className="stat-bar-fill"
          style={{ width: `${Math.min(100, player.avgRating * 10)}%` }}
        />
      </div>
    </div>
  );
}
