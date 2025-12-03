// src/context/SocketContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
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
  send: (msg: AnyWSMessage) => boolean;
  onMessage: (cb: (msg: AnyWSMessage) => void) => () => void;
  sendFriendRequest: (targetUserId: string) => void;
  clearNotifications: () => void;

  // NEW: let pages tell the provider who the user is
  setUserId: (id: string | null) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // listeners for incoming messages
  const listenersRef = useRef(new Set<(m: AnyWSMessage) => void>());

  // userId that controls whether we connect
  const [userId, _setUserId] = useState<string | null>(null);

  // On first mount, try to read userId from sessionStorage (if already logged in)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("userId");
    if (stored) {
      console.log("[SocketProvider] Initial userId from sessionStorage:", stored);
      _setUserId(stored);
    }
  }, []);

  const setUserId = useCallback((id: string | null) => {
    console.log("[SocketProvider] setUserId called with:", id);
    _setUserId(id);
  }, []);

  // Connect websocket whenever we have a userId
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!userId) {
      console.log("[SocketProvider] No userId yet, not connecting WS");
      return;
    }
    if (wsRef.current) {
      console.log("[SocketProvider] WS already exists, skipping connect");
      return;
    }

    console.log("[SocketProvider] Creating WebSocket connection to", WS_URL);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[SocketProvider] WebSocket open, sending PlayerOnline for", userId);
      setIsReady(true);
      setSocket(ws);

      // announce online once from provider
      ws.send(
        JSON.stringify({
          type: GameEventTypes.PlayerOnline,
          value: { playerId: userId },
        })
      );
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
        console.error("[SocketProvider] WS parse error", e);
      }
    };

    ws.onclose = () => {
      console.log("[SocketProvider] WebSocket closed");
      setIsReady(false);
      setSocket(null);
      wsRef.current = null;
    };

    ws.onerror = (err) => {
      console.error("[SocketProvider] WS Error:", err);
      ws.close();
    };

    return () => {
      console.log("[SocketProvider] Cleanup effect for WS");
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [userId]);

  const send = useCallback((msg: AnyWSMessage) => {
    const s = wsRef.current;
    if (!s || s.readyState !== WebSocket.OPEN) {
      console.warn("[SocketProvider] send called but socket not open");
      return false;
    }
    s.send(JSON.stringify(msg));
    return true;
  }, []);

  const onMessage = useCallback((cb: (msg: AnyWSMessage) => void) => {
    listenersRef.current.add(cb);
    return () => {
      listenersRef.current.delete(cb);
    };
  }, []);

  const sendFriendRequest = useCallback(
    (targetUserId: string) => {
      const myUserId =
        typeof window !== "undefined"
          ? sessionStorage.getItem("userId")
          : null;
      const myUsername =
        typeof window !== "undefined"
          ? sessionStorage.getItem("username") ?? "Unknown"
          : "Unknown";

      if (
        !send({
          type: GameEventTypes.SendFriendRequest,
          value: {
            fromUserId: myUserId,
            fromUsername: myUsername,
            toUserId: targetUserId,
          },
        })
      ) {
        console.warn("[SocketProvider] Socket not ready or user not logged in");
      }
    },
    [send]
  );

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const value = useMemo(
    () => ({
      socket,
      isReady,
      notifications,
      send,
      onMessage,
      sendFriendRequest,
      clearNotifications,
      setUserId,
    }),
    [
      socket,
      isReady,
      notifications,
      send,
      onMessage,
      sendFriendRequest,
      clearNotifications,
      setUserId,
    ]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
