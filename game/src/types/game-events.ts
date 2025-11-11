// Filename: src/types/game-events.ts
import type { Room } from '@/modals/room';
import type { Player, THREE_SIDE_CUBE_MOVES } from '@/modals/player';

export enum GameEventTypes {
  GameStarted = 'GameStarted',
  GameFinished = 'GameFinished',
  CubeMoved = 'CubeMoved',
  KeyBoardButtonPressed = 'KeyBoardButtonPressed',
  PlayerMove = 'PLAYER_MOVE',
  JoinRoom = 'JOIN_ROOM',
  LeaveRoom = 'LEAVE_ROOM',
  RoomJoined = 'ROOM_JOINED',
  Error = 'ERROR'
}

export interface BaseMessageValues {
  room: Room | undefined;
  participants: Array<Player | undefined>;
}

export interface GameStartEventMessageValues {
  base_values: BaseMessageValues;
  start_time: Date
}

export interface GameEndEventMessageValues {
  base_values: BaseMessageValues;
  player_id_who_won: string;
  end_time: string;
}
  
export interface CubeMovedEventMessageValues {
  base_values: BaseMessageValues;
  move: keyof typeof THREE_SIDE_CUBE_MOVES;
}

export interface KeyboardButtonPressedMessageValues {
  room: Room | undefined;
  player: Player;
  keyboardButton: string;
}

export interface JoinRoomMessage {
  type: GameEventTypes.JoinRoom;
  room_id: string;
  player_id: string;
  player?: Player;
}

export interface LeaveRoomMessage {
  type: GameEventTypes.LeaveRoom;
  room_id: string;
  player_id: string;
}

export interface PlayerMoveMessage {
  type: GameEventTypes.PlayerMove;
  room_id: string;
  player_id: string;
  move: string;
  timestamp: string;
}

export type GameEvents =
  | { type: GameEventTypes.GameStarted; value: GameStartEventMessageValues }
  | { type: GameEventTypes.GameFinished; value: GameEndEventMessageValues }
  | { type: GameEventTypes.CubeMoved; value: CubeMovedEventMessageValues }
  | { type: GameEventTypes.KeyBoardButtonPressed; value: KeyboardButtonPressedMessageValues }
  | { type: GameEventTypes.JoinRoom; value: JoinRoomMessage}
  | { type: GameEventTypes.LeaveRoom; value: LeaveRoomMessage}
  | { type: GameEventTypes.PlayerMove; value: PlayerMoveMessage};