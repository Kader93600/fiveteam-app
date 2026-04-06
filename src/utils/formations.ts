const FORMATIONS: Record<number, number[]> = {
  2: [1, 1],
  3: [1, 1, 1],
  4: [1, 2, 1],
  5: [1, 2, 2],
  6: [1, 2, 2, 1],
  7: [1, 2, 3, 1],
  8: [1, 3, 3, 1],
  9: [1, 3, 3, 2],
  10: [1, 3, 4, 2],
  11: [1, 4, 4, 2],
};

export function getFormation(playerCount: number): number[] {
  return FORMATIONS[Math.min(playerCount, 11)] || [1, 2, 2];
}

export function getFormationPosition(
  formation: number[],
  playerIndex: number,
  isTeam1: boolean,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  let currentIndex = 0;

  for (let i = 0; i < formation.length; i++) {
    if (playerIndex < currentIndex + formation[i]) {
      const posInRow = playerIndex - currentIndex;
      const playersInRow = formation[i];

      const xSpacing = canvasWidth / (playersInRow + 1);
      const x = xSpacing * (posInRow + 1);

      const ySpacing = (canvasHeight / 2) / (formation.length + 1);
      const y = isTeam1
        ? canvasHeight - (ySpacing * (i + 1))
        : ySpacing * (i + 1);

      return { x: Math.round(x), y: Math.round(y) };
    }
    currentIndex += formation[i];
  }

  return { x: canvasWidth / 2, y: canvasHeight / 2 };
}
