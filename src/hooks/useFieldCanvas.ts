import { useRef, useEffect, useCallback } from 'react';
import type { Player, Team, FieldPositions } from '../types';
import { getFormation, getFormationPosition } from '../utils/formations';
import { getInitials, clamp } from '../utils/helpers';

interface UseFieldCanvasOptions {
  team1: Team;
  team2: Team;
  fieldPositions: FieldPositions;
  onPositionChange: (playerId: string, x: number, y: number) => void;
  onDragEnd: () => void;
}

export function useFieldCanvas({
  team1, team2, fieldPositions, onPositionChange, onDragEnd,
}: UseFieldCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ player: Player; isTeam1: boolean } | null>(null);
  const isDragging = useRef(false);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  const allPlayers = [...team1.players, ...team2.players];

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const initPositions = useCallback((canvas: HTMLCanvasElement) => {
    const positions: FieldPositions = { ...fieldPositions };
    let changed = false;

    [team1.players, team2.players].forEach((teamPlayers, teamIdx) => {
      const isTeam1 = teamIdx === 0;
      const formation = getFormation(teamPlayers.length);

      teamPlayers.forEach((player, indexInTeam) => {
        if (!positions[player.id]) {
          positions[player.id] = getFormationPosition(
            formation, indexInTeam, isTeam1, canvas.width, canvas.height
          );
          changed = true;
        }
      });
    });

    if (changed) {
      Object.entries(positions).forEach(([pid, pos]) => {
        if (!fieldPositions[pid]) {
          onPositionChange(pid, pos.x, pos.y);
        }
      });
    }

    return positions;
  }, [team1.players, team2.players, fieldPositions, onPositionChange]);

  const drawField = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Grass
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Field lines
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Midline
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
    ctx.stroke();

    // Center point
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Goal areas
    const goalWidth = 120;
    const goalHeight = 60;
    const goalX = (canvas.width - goalWidth) / 2;
    ctx.strokeRect(goalX, 0, goalWidth, goalHeight);
    ctx.strokeRect(goalX, canvas.height - goalHeight, goalWidth, goalHeight);

    // Initialize positions if needed
    const positions = initPositions(canvas);

    // Draw players
    const radius = 18;
    allPlayers.forEach((player) => {
      const pos = positions[player.id] ?? fieldPositions[player.id];
      if (!pos) return;

      const isTeam1 = team1.players.some((p) => p.id === player.id);
      const teamColor = isTeam1 ? team1.color : team2.color;

      // Circle
      ctx.fillStyle = teamColor;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Photo or initials
      if (player.photo) {
        let img = imageCache.current.get(player.id);
        if (!img) {
          img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = player.photo;
          imageCache.current.set(player.id, img);
          img.onload = () => drawField();
        }
        if (img.complete && img.naturalWidth > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius - 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, pos.x - radius + 2, pos.y - radius + 2, (radius - 2) * 2, (radius - 2) * 2);
          ctx.restore();
        } else {
          drawInitials(ctx, pos.x, pos.y, player.name);
        }
      } else {
        drawInitials(ctx, pos.x, pos.y, player.name);
      }

      // Name below
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(player.name, pos.x, pos.y + radius + 16);
    });
  }, [allPlayers, team1, team2, fieldPositions, initPositions]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const width = Math.min(canvas.parentElement.clientWidth - 20, 420);
    canvas.width = width;
    canvas.height = Math.round(width * 1.5);
  }, []);

  // Draw on every relevant change
  useEffect(() => {
    resizeCanvas();
    drawField();
  }, [drawField, resizeCanvas]);

  // Drag handlers
  const findPlayer = useCallback((x: number, y: number) => {
    for (const player of allPlayers) {
      const pos = fieldPositions[player.id];
      if (pos && Math.hypot(pos.x - x, pos.y - y) < 25) {
        const isTeam1 = team1.players.some((p) => p.id === player.id);
        return { player, isTeam1 };
      }
    }
    return null;
  }, [allPlayers, fieldPositions, team1.players]);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    const { x, y } = getCanvasCoords(clientX, clientY);
    const found = findPlayer(x, y);
    if (found) {
      dragRef.current = found;
      isDragging.current = true;
    }
  }, [getCanvasCoords, findPlayer]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging.current || !dragRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoords(clientX, clientY);
    onPositionChange(
      dragRef.current.player.id,
      clamp(x, 30, canvas.width - 30),
      clamp(y, 30, canvas.height - 30)
    );
  }, [getCanvasCoords, onPositionChange]);

  const handleDragEnd = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      dragRef.current = null;
      onDragEnd();
    }
  }, [onDragEnd]);

  // Mouse events
  const onMouseDown = useCallback((e: React.MouseEvent) => handleDragStart(e.clientX, e.clientY), [handleDragStart]);
  const onMouseMove = useCallback((e: React.MouseEvent) => handleDragMove(e.clientX, e.clientY), [handleDragMove]);
  const onMouseUp = useCallback(() => handleDragEnd(), [handleDragEnd]);

  // Touch events
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  }, [handleDragStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  }, [handleDragMove]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleDragEnd();
  }, [handleDragEnd]);

  const exportPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `terrain_${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
  }, []);

  return {
    canvasRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    exportPNG,
    redraw: drawField,
    resize: resizeCanvas,
  };
}

function drawInitials(ctx: CanvasRenderingContext2D, x: number, y: number, name: string) {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(getInitials(name), x, y);
}
