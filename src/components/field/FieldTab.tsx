import { useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useFieldCanvas } from '../../hooks/useFieldCanvas';
import { Button } from '../ui/Button';

export function FieldTab() {
  const { state, dispatch } = useApp();

  const onPositionChange = useCallback(
    (playerId: string, x: number, y: number) => {
      dispatch({ type: 'UPDATE_FIELD_POSITION', payload: { playerId, x, y } });
    },
    [dispatch]
  );

  const onDragEnd = useCallback(() => {
    // Positions are already persisted via the useEffect in AppContext
  }, []);

  const {
    canvasRef,
    onMouseDown, onMouseMove, onMouseUp,
    onTouchStart, onTouchMove, onTouchEnd,
    exportPNG,
  } = useFieldCanvas({
    team1: state.team1,
    team2: state.team2,
    fieldPositions: state.fieldPositions,
    onPositionChange,
    onDragEnd,
  });

  return (
    <div className="field-container">
      <div className="field-info">
        <div>
          <span className="accent">Terrain Visuel</span> - Déplacez les joueurs sur le terrain
        </div>
        <Button variant="primary" size="sm" onClick={exportPNG}>Exporter PNG</Button>
      </div>
      <div className="field-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="field-canvas"
          width={400}
          height={600}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
        Maintenez et glissez pour déplacer les joueurs
      </div>
    </div>
  );
}
