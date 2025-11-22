// Filename: src/types/game-events.ts
import type { Room } from '@/modals/room';
import type { Player, THREE_SIDE_CUBE_MOVES } from '@/modals/player';

export enum GameEventTypes {
  GameStarted = 'GameStarted',
  GameStartedAI = 'GameStartedAI',
  GameFinished = 'GameFinished',
  CubeMoved = 'CubeMoved',
  KeyBoardButtonPressed = 'KeyBoardButtonPressed',
  PlayerMove = 'PLAYER_MOVE',
  JoinRoom = 'JOIN_ROOM',
  LeaveRoom = 'LEAVE_ROOM',
  RoomJoined = 'ROOM_JOINED',
  PlayerOnline = 'PLAYER_ONLINE',
  PlayerOffline = 'PLAYER_OFFLINE',
  // New types for friend requests
  PlayerStatusUpdate= 'PLAYER_STATUS_UPDATE',
  SendFriendRequest = "SendFriendRequest",
  FriendRequestReceived = "FriendRequestReceived",
  Error = 'ERROR'
}

export interface BaseMessageValues {
  room: Room | undefined;
  participants: Array<Player | undefined>;
}

export interface GameStartEventMessageValues {
  // base_values: BaseMessageValues;
  roomId: string
  player: Player
  start_time: Date
}

export interface GameStartAIEventMessageValues {
  // base_values: BaseMessageValues;
  roomId: string
  players: Array<Player>
  start_time: Date
}

export interface GameEndEventMessageValues {
  // base_values: BaseMessageValues;
  roomId: string
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
  direction: string;
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

export interface PlayerActiveStatusMessage {
  playerId: string;
}

export interface FriendRequestPayload {
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
}

export interface FriendUpdateMessage {
  userId: string;
  status: "offline" | "online"
}

export type GameEvents =
  | { type: GameEventTypes.GameStarted; value: GameStartEventMessageValues }
  | { type: GameEventTypes.GameStartedAI; value: GameStartAIEventMessageValues }
  | { type: GameEventTypes.GameFinished; value: GameEndEventMessageValues }
  | { type: GameEventTypes.CubeMoved; value: CubeMovedEventMessageValues }
  | { type: GameEventTypes.KeyBoardButtonPressed; value: KeyboardButtonPressedMessageValues }
  | { type: GameEventTypes.JoinRoom; value: JoinRoomMessage }
  | { type: GameEventTypes.LeaveRoom; value: LeaveRoomMessage }
  | { type: GameEventTypes.PlayerOnline; value: PlayerActiveStatusMessage }
  | { type: GameEventTypes.PlayerOffline; value: PlayerActiveStatusMessage}
  | { type: GameEventTypes.FriendRequestReceived; value: FriendRequestPayload }
  | { type: GameEventTypes.SendFriendRequest; value: FriendRequestPayload }
  | { type: GameEventTypes.PlayerStatusUpdate; value: FriendUpdateMessage }
  | { type: GameEventTypes.PlayerMove; value: PlayerMoveMessage };