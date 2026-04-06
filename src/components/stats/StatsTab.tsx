import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { StatsFilter, PlayerWithComputedStats } from '../../types';
import { StatCard } from './StatCard';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

const FILTERS: { key: StatsFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'mvp', label: 'Homme du Match' },
  { key: 'topRating', label: 'Meilleure Note' },
];

export function StatsTab() {
  const { state, dispatch } = useApp();

  const filtered = useMemo(() => {
    const withStats: PlayerWithComputedStats[] = state.players
      .filter((p) => p.stats.matches > 0)
      .map((p) => ({
        ...p,
        avgRating: p.stats.matches > 0 ? p.stats.totalRating / p.stats.matches : 0,
        winRate: p.stats.matches > 0 ? (p.stats.wins / p.stats.matches) * 100 : 0,
      }));

    switch (state.statsFilter) {
      case 'mvp':
        return withStats
          .filter((p) => p.stats.mvpCount > 0)
          .sort((a, b) => b.stats.mvpCount - a.stats.mvpCount);
      case 'topRating':
        return withStats.sort((a, b) => b.avgRating - a.avgRating);
      default:
        return withStats.sort((a, b) => b.stats.matches - a.stats.matches);
    }
  }, [state.players, state.statsFilter]);

  return (
    <>
      <h2 style={{ color: '#4ade80', fontSize: 16, marginBottom: 16 }}>Statistiques Avancées</h2>

      <div className="stats-filter">
        {FILTERS.map(({ key, label }) => (
          <Button
            key={key}
            variant="secondary"
            onClick={() => dispatch({ type: 'SET_STATS_FILTER', payload: key })}
            style={
              state.statsFilter === key
                ? { background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(74, 222, 128, 0.2))', color: '#4ade80' }
                : undefined
            }
          >
            {label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📈" message="Aucune statistique disponible" />
      ) : (
        filtered.map((player, index) => (
          <StatCard key={player.id} player={player} rank={index + 1} />
        ))
      )}
    </>
  );
}
