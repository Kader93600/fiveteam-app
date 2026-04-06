import { useApp } from '../../context/AppContext';
import type { TabName } from '../../types';

const TABS: { name: TabName; icon: string; label: string }[] = [
  { name: 'joueurs', icon: '👥', label: 'Joueurs' },
  { name: 'equipes', icon: '🏆', label: 'Équipes' },
  { name: 'terrain', icon: '⚽', label: 'Terrain' },
  { name: 'historique', icon: '📊', label: 'Historique' },
  { name: 'stats', icon: '📈', label: 'Stats' },
];

export function TabNavigation() {
  const { state, dispatch } = useApp();

  return (
    <div className="tab-container">
      {TABS.map((tab) => (
        <button
          key={tab.name}
          className={`tab-btn ${state.activeTab === tab.name ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_TAB', payload: tab.name })}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
}
