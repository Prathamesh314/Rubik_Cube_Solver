import { WebSocket } from 'ws';
import type { Player } from '@/modals/player';

export interface PlayerConnection {
    ws: WebSocket;
    player_id: string;
    player: Player;
}

export interface GameServerState {
    rooms: Map<string, PlayerConnection[]>;
    onlinePlayers: Map<string, WebSocket>;
}