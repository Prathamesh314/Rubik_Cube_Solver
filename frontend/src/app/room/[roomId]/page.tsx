// Filename: src/app/room/[roomId]/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Player } from "@/modals/player";
import { Env } from "@/lib/env_config";
import { Room } from "@/modals/room";
import {GameEventTypes} from "@/types/game-events";

const WS_URL = Env.NEXT_PUBLIC_WEBSOCKET_URL;

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200 ring-1 ring-slate-700 hover:bg-slate-700 transition"
      title="Copy Room ID"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [room, setRoom] = useState<Room | null>(null);
  const [playerA, setPlayerA] = useState<Player | undefined>();
  const [playerB, setPlayerB] = useState<Player | undefined>();
  const [roomSize, setRoomSize] = useState<number>(0);

  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [startState, setStartState] = useState<number[][][] | null>(null);
  const [selfCubeState, setSelfCubeState] = useState<number[][][] | null>(null);
  const [opponentCubeState, setOpponentCubeState] = useState<number[][][] | null>(null);

  const selfPlayerId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("player");
      if (!raw) return null;
      const p = JSON.parse(raw) as Player;
      return p?.player_id ?? null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/room/${roomId}`);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(`HTTP ${res.status}${j?.error ? ` (${j.error})` : ""}`);
        }
        const data: Room = await res.json();
        if (!mounted) return;

        setRoom(data);
        if (data.players.length == 1){
          setRoomSize(1);
        }else if (data.players.length == 2){
          setRoomSize(2);
        }

        if (data?.players?.length) {
          const me = data.players.find((p: any) => p.player_id === selfPlayerId) as Player | undefined;
          if (me) {
            setPlayerA(me);
            const opp = data.players.find((p: any) => p.player_id !== me.player_id) as Player | undefined;
            setPlayerB(opp);
          } else {
            setPlayerA(data.players[0] as Player);
            setPlayerB(data.players[1] as Player | undefined);
          }
        }
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRoomData();
    return () => {
      mounted = false;
    };
  }, [roomId, selfPlayerId]);

  // WebSocket connection effect - runs only once
  useEffect(() => {
    if (typeof window === "undefined" || !roomId || !selfPlayerId) return;

    // Don't create a new connection if one already exists
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    console.log('Establishing WebSocket connection...');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsReady(true);
      
      // Join the room
      ws.send(JSON.stringify({
        type: 'JOIN_ROOM',
        room_id: roomId,
        player_id: selfPlayerId
      }));
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsReady(false);
      
      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        // Trigger re-render which will create new connection
        wsRef.current = null;
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsReady(false);
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log("Data received client side: ", data);
        switch (data.type) {
          case GameEventTypes.KeyBoardButtonPressed:
            console.log("Data recived for keyboard pressed event on client side: ", data);
            break
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    return () => {
      console.log('Cleaning up WebSocket connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [roomId, selfPlayerId]); // Only depend on stable identifiers

  // Keyboard event listener - separate effect
  useEffect(() => {
    if (!wsReady || !roomId || !selfPlayerId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const message = {
        type: 'KeyBoardButtonPressed',
        value: {
          room: { id: roomId, ...room },
          player: selfPlayerId === playerA?.player_id ? playerA : playerB,
          keyboardButton: e.key
        }
      };

      try {
        console.log("Message: ", message)
        ws.send(JSON.stringify(message));
      } catch (err) {
        console.error('Failed to send keyboard event:', err);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [wsReady, roomId, selfPlayerId, playerA, playerB]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading room…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-bold mb-2">Couldn't load the room</h2>
          <p className="text-slate-400 mb-6">{err}</p>
          <button className="underline text-indigo-300" onClick={() => router.push("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const bothReady = !!playerA && !!playerB && !!startState;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-indigo-500/20 ring-1 ring-indigo-500/30 flex items-center justify-center">
              <span className="text-indigo-300 text-sm font-black">RC</span>
            </div>
            <div>
              <div className="text-sm text-slate-400 leading-tight">Room</div>
              <div className="font-semibold tracking-tight">{roomId}</div>
            </div>
            {/* WebSocket connection status indicator */}
            <div 
              className={`ml-2 h-2 w-2 rounded-full ${wsReady ? 'bg-green-500' : 'bg-red-500'}`}
              title={wsReady ? 'Connected' : 'Disconnected'}
            />
          </div>
          <div className="flex items-center gap-3">
            <CopyButton value={String(roomId)} />
            <button
              onClick={() => router.push("/")}
              className="rounded-md bg-red-600/80 px-4 py-2 text-sm font-semibold ring-1 ring-red-500/40 hover:bg-red-600 transition"
            >
              Leave
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
            Match Room
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Variant: <span className="text-slate-200 font-medium">{room?.variant ?? "—"}</span>
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
            <h3 className="text-sm font-semibold text-slate-300">Game Status</h3>
            <p className={`mt-2 text-2xl font-bold ${bothReady ? "text-green-400" : "text-slate-400"}`}>
              {bothReady ? "Both players connected" : "Waiting for opponent…"}
            </p>
            <p className="mt-1 text-slate-400">
              {bothReady ? "Click your board to enable keyboard moves (U R F D L B, hold Shift for CCW)." : "We'll start once the opponent joins."}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
            <h3 className="text-sm font-semibold text-slate-300">Rules</h3>
            <ul className="mt-2 space-y-2 text-slate-300 text-sm leading-relaxed">
              <li>Same scramble for both players.</li>
              <li>First to solve wins and rating updates accordingly.</li>
              <li>Keyboard: U R F D L B (hold Shift for counter-clockwise).</li>
            </ul>
          </div>
        </div>

        <div className="my-8 flex items-center justify-center gap-3">
          <span className={`h-2 w-2 rounded-full ${bothReady ? "bg-green-400" : "bg-slate-600"}`} />
          <span className="text-xs text-slate-400">
            {bothReady ? "Game ready" : "Waiting for opponent"}
          </span>
        </div>
      </div>
    </div>
  );
}