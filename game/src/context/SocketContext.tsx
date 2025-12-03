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

  // let pages tell the provider who the user is
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
  const userIdRef = useRef<string | null>(null);

  // reconnection controls
  const shouldReconnectRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // On first mount, try to read userId from sessionStorage (if already logged in)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("userId");
    if (stored) {
      console.log("[SocketProvider] Initial userId from sessionStorage:", stored);
      _setUserId(stored);
      userIdRef.current = stored;
    }
  }, []);

  const setUserId = useCallback((id: string | null) => {
    console.log("[SocketProvider] setUserId called with:", id);
    _setUserId(id);
    userIdRef.current = id;
  }, []);

  // Keep userIdRef in sync
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Core connect function with auto-reconnect
  useEffect(() => {
    if (typeof window === "undefined") return;

    // if no userId → ensure we close and stop reconnecting
    if (!userId) {
      console.log("[SocketProvider] No userId, closing WS and disabling reconnect");
      shouldReconnectRef.current = false;

      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      setIsReady(false);
      setSocket(null);
      return;
    }

    shouldReconnectRef.current = true;

    const connect = () => {
      if (!shouldReconnectRef.current) {
        console.log("[SocketProvider] Reconnect disabled, not connecting");
        return;
      }

      const existing = wsRef.current;
      if (
        existing &&
        (existing.readyState === WebSocket.OPEN ||
          existing.readyState === WebSocket.CONNECTING)
      ) {
        console.log("[SocketProvider] WS already open/connecting, skipping connect");
        return;
      }

      console.log("[SocketProvider] Creating WebSocket connection to", WS_URL);
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        const pid = userIdRef.current;
        console.log(
          "[SocketProvider] WebSocket open, sending PlayerOnline for",
          pid
        );
        reconnectAttemptsRef.current = 0;
        setIsReady(true);
        setSocket(ws);

        if (pid) {
          ws.send(
            JSON.stringify({
              type: GameEventTypes.PlayerOnline,
              value: { playerId: pid },
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as AnyWSMessage;
          listenersRef.current.forEach((cb) => cb(msg));

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

      ws.onclose = (event) => {
        console.log(
          "[SocketProvider] WebSocket closed",
          "code=",
          event.code,
          "reason=",
          event.reason || "(none)"
        );
        setIsReady(false);
        setSocket(null);
        wsRef.current = null;

        if (!shouldReconnectRef.current) {
          console.log("[SocketProvider] Not reconnecting (flag disabled)");
          return;
        }

        const attempt = reconnectAttemptsRef.current++;
        const delay = Math.min(1000 * 2 ** attempt, 10000); // 1s, 2s, 4s, ... max 10s
        console.log(
          `[SocketProvider] Scheduling reconnect in ${delay}ms (attempt ${
            attempt + 1
          })`
        );

        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, delay);
      };

      ws.onerror = (err) => {
        console.error("[SocketProvider] WS Error:", err);
        // don't force-close here; let onclose handle reconnection if server closes
      };
    };

    // initial connect when userId becomes available
    connect();

    // cleanup when component unmounts or userId changes
    return () => {
      console.log("[SocketProvider] Cleanup effect for WS (userId change/unmount)");
      shouldReconnectRef.current = false;

      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      setIsReady(false);
      setSocket(null);
    };
  }, [userId]);

  const send = useCallback((msg: AnyWSMessage) => {
    const s = wsRef.current;
    if (!s || s.readyState !== WebSocket.OPEN) {
      console.warn(
        "[SocketProvider] send called but socket not open; dropping message",
        msg
      );
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
