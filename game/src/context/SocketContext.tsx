// src/context/SocketContext.tsx
"use client";

import React, {
  createContext, useContext, useEffect, useRef, useState, useCallback, useMemo
} from "react";
import { GameEventTypes } from "@/types/game-events";

const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? "ws://localhost:8002";

type AnyWSMessage = { type: string; value?: any };

interface Notification {
  id: string;
  fromUsername: string;
  fromUserId: string;
  timestamp: string;
}

interface SocketContextType {
  socket: WebSocket | null;
  isReady: boolean;
  notifications: Notification[];
  send: (msg: AnyWSMessage) => boolean;              // ✅ generic sender
  onMessage: (cb: (msg: AnyWSMessage) => void) => () => void; // ✅ subscribe API (returns unsubscribe)
  sendFriendRequest: (targetUserId: string) => void;
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // listeners for incoming messages
  const listenersRef = useRef(new Set<(m: AnyWSMessage) => void>());

  // track userId, only connect when present
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const load = () => setUserId(sessionStorage.getItem("userId"));
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!userId) return;
    if (wsRef.current) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsReady(true);
      setSocket(ws);
      // announce online once from provider
      ws.send(JSON.stringify({ type: GameEventTypes.PlayerOnline, value: { playerId: userId } }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as AnyWSMessage;
        // fan out to subscribers
        listenersRef.current.forEach((cb) => cb(msg));

        // optional: route some messages into notifications
        if (msg.type === "FriendRequestReceived" && msg.value) {
          const n: Notification = {
            id: crypto.randomUUID(),
            fromUsername: msg.value.fromUsername,
            fromUserId: msg.value.fromUserId,
            timestamp: new Date().toISOString(),
          };
          setNotifications((p) => [n, ...p]);
        }
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    ws.onclose = () => {
      setIsReady(false);
      setSocket(null);
      wsRef.current = null;
    };

    ws.onerror = (err) => {
      console.error("WS Error:", err);
      ws.close();
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [userId]);

  const send = useCallback((msg: AnyWSMessage) => {
    const s = wsRef.current;
    if (!s || s.readyState !== WebSocket.OPEN) return false;
    s.send(JSON.stringify(msg));
    return true;
  }, []);

  const onMessage = useCallback((cb: (msg: AnyWSMessage) => void) => {
    listenersRef.current.add(cb);
    return () => listenersRef.current.delete(cb);
  }, []);

  const sendFriendRequest = useCallback((targetUserId: string) => {
    const myUserId = sessionStorage.getItem("userId");
    const myUsername = sessionStorage.getItem("username") ?? "Unknown";
    if (!send({ type: GameEventTypes.SendFriendRequest, value: { fromUserId: myUserId, fromUsername: myUsername, toUserId: targetUserId } })) {
      console.warn("Socket not ready or user not logged in");
    }
  }, [send]);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const value = useMemo(() => ({
    socket, isReady, notifications, send, onMessage, sendFriendRequest, clearNotifications
  }), [socket, isReady, notifications, send, onMessage, sendFriendRequest, clearNotifications]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
