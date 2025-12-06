import { Env } from '@/lib/env_config';

export const WEBSOCKET_PORT = Env.WEBSOCKET_PORT;
export const WEBSOCKET_URL = Env.NEXT_PUBLIC_WEBSOCKET_URL;

export const VALID_KEY_PRESSES = [
    "u", "f", "b", "d", "l", "r", 
    "U", "F", "B", "D", "L", "R"
] as const;

export const RATING_INCREMENT = 8;