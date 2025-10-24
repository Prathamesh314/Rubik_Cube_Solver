// src/types/game-events.ts
import type { Room } from '@/modals/room';
import type { Player, THREE_SIDE_CUBE_MOVES } from '@/modals/player';

export enum GameEventTypes {
  GameStarted = 'GameStarted',
  GameFinished = 'GameFinished',
  CubeMoved = 'CubeMoved',
}

export interface BaseMessageValues {
  room: Room | undefined;
  participants: Array<Player | undefined>;
}

export interface GameStartEventMessageValues {
  base_values: BaseMessageValues;
  scrambled_cube: number[][][];
  start_time: string;
}

export interface GameEndEventMessageValues {
  base_values: BaseMessageValues;
  end_time: string;
}

export interface CubeMovedEventMessageValues {
  base_values: BaseMessageValues;
  move: keyof typeof THREE_SIDE_CUBE_MOVES;
}

export type GameEvents =
  | { type: GameEventTypes.GameStarted; value: GameStartEventMessageValues }
  | { type: GameEventTypes.GameFinished; value: GameEndEventMessageValues }
  | { type: GameEventTypes.CubeMoved; value: CubeMovedEventMessageValues };