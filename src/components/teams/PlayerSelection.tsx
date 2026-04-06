import { useApp } from '../../context/AppContext';
import { starsString } from '../../utils/helpers';

export function PlayerSelection() {
  const { state, dispatch } = useApp();

  if (state.players.length === 0) {
    return (
      <p style={{ color: '#94a3b8', textAlign: 'center' }}>Aucun joueur disponible</p>
    );
  }

  return (
    <>
      {state.players.map((player) => (
        <label
          key={player.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 8,
            cursor: 'pointer',
            borderRadius: 6,
            transition: 'background 0.2s ease',
          }}
          onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(34, 197, 94, 0.1)'; }}
          onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
        >
          <input
            type="checkbox"
            checked={state.selectedPlayers.includes(player.id)}
            onChange={() => dispatch({ type: 'TOGGLE_PLAYER_SELECTION', payload: player.id })}
          />
          <span style={{ flex: 1 }}>{player.name}</span>
          <span style={{ color: '#94a3b8', fontSize: 12 }}>{starsString(player.level)}</span>
        </label>
      ))}
    </>
  );
}
