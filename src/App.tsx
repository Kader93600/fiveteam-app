import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { TabNavigation } from './components/layout/TabNavigation';
import { PlayersTab } from './components/players/PlayersTab';
import { TeamsTab } from './components/teams/TeamsTab';
import { FieldTab } from './components/field/FieldTab';
import { HistoryTab } from './components/history/HistoryTab';
import { StatsTab } from './components/stats/StatsTab';

function AppContent() {
  const { state } = useApp();

  const renderTab = () => {
    switch (state.activeTab) {
      case 'joueurs': return <PlayersTab />;
      case 'equipes': return <TeamsTab />;
      case 'terrain': return <FieldTab />;
      case 'historique': return <HistoryTab />;
      case 'stats': return <StatsTab />;
    }
  };

  return (
    <div className="container">
      <Header />
      <div className="content">
        <div className="tab-content" key={state.activeTab}>
          {renderTab()}
        </div>
      </div>
      <TabNavigation />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
