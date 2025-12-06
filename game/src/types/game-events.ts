import { z } from "zod";
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
  PlayerStatusUpdate = 'PLAYER_STATUS_UPDATE',
  SendFriendRequest = "SendFriendRequest",
  FriendRequestReceived = "FriendRequestReceived",
  FriendChallenge = "FriendChallenge",
  FriendChallengeRejected = "FriendChallengeRejected",
  Error = 'ERROR'
}

// Zod schemas - UPDATED with proper types
export const BaseMessageValuesSchema = z.object({
  room: z.any().optional(),
  participants: z.array(z.any().optional()).optional(),
});

export const GameStartEventMessageValuesSchema = z.object({
  roomId: z.string(),
  player: z.any(), // Player object
  start_time: z.string().optional(), // Changed from z.date() to z.string()
});

export const GameStartAIEventMessageValuesSchema = z.object({
  roomId: z.string(),
  players: z.array(z.any()),
  start_time: z.string().optional(), // Changed from z.date() to z.string()
});

export const GameEndEventMessageValuesSchema = z.object({
  roomId: z.string(),
  player_id_who_won: z.string(),
  end_time: z.string(),
});

export const CubeMovedEventMessageValuesSchema = z.object({
  base_values: BaseMessageValuesSchema.optional(),
  move: z.string(),
});

export const KeyboardButtonPressedMessageValuesSchema = z.object({
  roomId: z.string().optional(), // Added roomId
  room: z.any().optional(),
  player: z.any(),
  keyboardButton: z.string(),
  direction: z.string(),
  clockwise: z.boolean().optional(), // Added for backwards compatibility
});

export const JoinRoomMessageSchema = z.object({
  type: z.literal(GameEventTypes.JoinRoom),
  room_id: z.string(),
  player_id: z.string(),
  player: z.any().optional(),
});

export const LeaveRoomMessageSchema = z.object({
  type: z.literal(GameEventTypes.LeaveRoom),
  room_id: z.string(),
  player_id: z.string(),
});

export const PlayerMoveMessageSchema = z.object({
  type: z.literal(GameEventTypes.PlayerMove),
  room_id: z.string(),
  player_id: z.string(),
  move: z.string(),
  timestamp: z.string(),
});

export const PlayerActiveStatusMessageSchema = z.object({
  playerId: z.string(),
});

export const FriendRequestPayloadSchema = z.object({
  fromUserId: z.string(),
  fromUsername: z.string(),
  toUserId: z.string(),
});

export const FriendUpdateMessageSchema = z.object({
  userId: z.string(),
  status: z.enum(["offline", "online"]),
});

export const FriendChallengeMessageSchema = z.object({
  playerId: z.string().nullish(),
  opponentPlayerId: z.string().nullish(),
  roomId: z.string().nullish(),
});

// Union types for message values
export const GameEventsMessageSchema = z.union([
  GameStartEventMessageValuesSchema,
  GameStartAIEventMessageValuesSchema,
  GameEndEventMessageValuesSchema,
  CubeMovedEventMessageValuesSchema,
  KeyboardButtonPressedMessageValuesSchema,
  JoinRoomMessageSchema,
  LeaveRoomMessageSchema,
  PlayerActiveStatusMessageSchema,
  FriendRequestPayloadSchema,
  FriendUpdateMessageSchema,
  FriendChallengeMessageSchema,
  PlayerMoveMessageSchema,
]);

// Main events schema
export const GameEventsSchema = z.union([
  z.object({ 
    type: z.literal(GameEventTypes.GameStarted), 
    value: GameStartEventMessageValuesSchema 
  }),
  z.object({ 
    type: z.literal(GameEventTypes.GameStartedAI), 
    value: GameStartAIEventMessageValuesSchema 
  }),
  z.object({ 
    type: z.literal(GameEventTypes.GameFinished), 
    value: GameEndEventMessageValuesSchema 
  }),
  z.object({ 
    type: z.literal(GameEventTypes.CubeMoved), 
    value: CubeMovedEventMessageValuesSchema 
  }),
  z.object({ 
    type: z.literal(GameEventTypes.KeyBoardButtonPressed), 
    value: KeyboardButtonPressedMessageValuesSchema 
  }),
  z.object({ 
    type: z.literal(GameEventTypes.JoinRoom), 
    value: JoinRoomMessageSchema 
  }),
  z.object({ 
    type: z.literal(GameEventTypes.LeaveRoom), 
    value: LeaveRoomMessageSchema 
  }),
  z.object({ 
    type: z.literal(GameEventTypes.PlayerOnline), 
    value: PlayerActiveStatusMessageSchema 
  }),
  z.object({ 
    type: z.literal(GameEventTypes.PlayerOffline), 
    value: PlayerActiveStatusMessageSchema 
  }),
  z.object({ 
    type: z.literal(GameEventTypes.FriendRequestReceived), 
    value: FriendRequestPayloadSchema 
  }),
  z.object({ 
    type: z.literal(GameEventTypes.SendFriendRequest), 
    value: FriendRequestPayloadSchema 
  }),
  z.object({ 
    type: z.literal(GameEventTypes.PlayerStatusUpdate), 
    value: FriendUpdateMessageSchema 
  }),
  z.object({ 
    type: z.literal(GameEventTypes.FriendChallenge), 
    value: FriendChallengeMessageSchema 
  }),
  z.object({ 
    type: z.literal(GameEventTypes.FriendChallengeRejected), 
    value: FriendChallengeMessageSchema 
  }),
  z.object({ 
    type: z.literal(GameEventTypes.PlayerMove), 
    value: PlayerMoveMessageSchema 
  }),
]);

// Types from schemas
export type BaseMessageValues = z.infer<typeof BaseMessageValuesSchema>;
export type GameStartEventMessageValues = z.infer<typeof GameStartEventMessageValuesSchema>;
export type GameStartAIEventMessageValues = z.infer<typeof GameStartAIEventMessageValuesSchema>;
export type GameEndEventMessageValues = z.infer<typeof GameEndEventMessageValuesSchema>;
export type CubeMovedEventMessageValues = z.infer<typeof CubeMovedEventMessageValuesSchema>;
export type KeyboardButtonPressedMessageValues = z.infer<typeof KeyboardButtonPressedMessageValuesSchema>;
export type JoinRoomMessage = z.infer<typeof JoinRoomMessageSchema>;
export type LeaveRoomMessage = z.infer<typeof LeaveRoomMessageSchema>;
export type PlayerMoveMessage = z.infer<typeof PlayerMoveMessageSchema>;
export type PlayerActiveStatusMessage = z.infer<typeof PlayerActiveStatusMessageSchema>;
export type FriendRequestPayload = z.infer<typeof FriendRequestPayloadSchema>;
export type FriendUpdateMessage = z.infer<typeof FriendUpdateMessageSchema>;
export type FriendChallengeMessage = z.infer<typeof FriendChallengeMessageSchema>;
export type GameEventsMessage = z.infer<typeof GameEventsMessageSchema>;
export type GameEvents = z.infer<typeof GameEventsSchema>;