import type { Player, GenerationMode } from '../types';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function snakeDraft(players: Player[], playersPerTeam: number): [Player[], Player[]] {
  const sorted = [...players].sort((a, b) => b.level - a.level);
  const team1: Player[] = [];
  const team2: Player[] = [];

  let direction = true;
  let pickCount = 0;

  for (const player of sorted) {
    if (team1.length >= playersPerTeam && team2.length >= playersPerTeam) break;

    const pickTeam1 = direction;

    if (pickTeam1 && team1.length < playersPerTeam) {
      team1.push(player);
    } else if (!pickTeam1 && team2.length < playersPerTeam) {
      team2.push(player);
    } else if (team1.length < playersPerTeam) {
      team1.push(player);
    } else {
      team2.push(player);
    }

    pickCount++;
    if (pickCount % 2 === 0) {
      direction = !direction;
    }
  }

  return [team1, team2];
}

function randomDraft(players: Player[], playersPerTeam: number): [Player[], Player[]] {
  const shuffled = shuffle(players);
  return [
    shuffled.slice(0, playersPerTeam),
    shuffled.slice(playersPerTeam, playersPerTeam * 2),
  ];
}

export function generateTeams(
  players: Player[],
  playersPerTeam: number,
  mode: GenerationMode
): [Player[], Player[]] {
  if (mode === 'balanced') {
    return snakeDraft(players, playersPerTeam);
  }
  return randomDraft(players, playersPerTeam);
}
