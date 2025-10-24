"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Player } from "@/modals/player";
import { Env } from "@/lib/env_config";
import { GameEvents, GameEventTypes } from "@/types/game-events";
import { Room } from "@/modals/room";
import { generateScrambledCube, initRubiksCube } from "@/components/cube";

const WS_URL = Env.NEXT_PUBLIC_WEBSOCKET_URL;

type FocusSide = "self" | "opponent" | null;

const UserIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-slate-700">
      {children}
    </span>
  );
}

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

const colorMap = {
  1: "#C41E3A", // Red
  2: "#009B48", // Green
  3: "#0051BA", // Blue
  4: "#FFD500", // Yellow
  5: "#FF5800", // Orange
  6: "#FFFFFF", // White
};

function PlayerHeader({
  username,
  rating,
  accent = "blue",
  sideLabel,
}: {
  username?: string;
  rating?: number;
  accent?: "blue" | "rose";
  sideLabel: "You" | "Opponent";
}) {
  const accentColor = accent === "blue" ? "text-blue-400 bg-blue-400/10 ring-blue-500/30" : "text-rose-400 bg-rose-400/10 ring-rose-500/30";
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-3 ring-1 ${accentColor}`}>
          <UserIcon className={`w-6 h-6 ${accent === "blue" ? "text-blue-300" : "text-rose-300"}`} />
        </div>
        <div className="leading-tight">
          <div className="text-lg font-bold text-white">{username ?? "—"}</div>
          <div className="text-xs text-slate-400">Rating • <span className="text-slate-200 font-semibold">{rating ?? "—"}</span></div>
        </div>
      </div>
      <Badge>{sideLabel}</Badge>
    </div>
  );
}

function CubeCanvas({
  state,
  interactive,
  focused,
  onFocus,
}: {
  state: number[][][] | null;
  interactive: boolean;
  focused: boolean;
  onFocus: () => void;
}) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<{ turn: (f: any, cw?: boolean) => void; dispose: () => void } | null>(null);

  useEffect(() => {
    if (!containerRef.current || !state) return;

    apiRef.current?.dispose();
    apiRef.current = initRubiksCube(containerRef.current, state, colorMap);

    const kick = () => window.dispatchEvent(new Event("resize"));
    const t1 = requestAnimationFrame(kick);
    const t2 = setTimeout(kick, 50);

    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, [state]);

  useEffect(() => {
    if (!shellRef.current) return;
    const ro = new ResizeObserver(() => {
      window.dispatchEvent(new Event("resize"));
    });
    ro.observe(shellRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDownCapture = (e: KeyboardEvent) => {
      if (!interactive || !focused) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDownCapture, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDownCapture, { capture: true });
  }, [interactive, focused]);

  return (
    <div
      ref={shellRef}
      className={[
        // ✅ Reduced height and added margin top to position cube higher
        "relative w-full h-[38vh] md:h-[42vh] lg:h-[46vh] mt-4",
        "overflow-hidden rounded-2xl ring-1 ring-slate-800/80",
        "bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(99,102,241,0.10),rgba(2,6,23,0))]",
        focused && interactive ? "outline outline-2 outline-indigo-500/60" : "",
      ].join(" ")}
      onClick={onFocus}
    >
      {interactive && (
        <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-black/40 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-200">
          {focused ? "Keyboard Active" : "Click to Control"}
        </div>
      )}

      {/* ✅ Added padding top to the cube container to position it higher */}
      <div ref={containerRef} className="absolute inset-0 pt-4" />

      {!state && (
        <div className="absolute inset-0 grid place-items-center text-slate-500 text-sm">
          Waiting for start state…
        </div>
      )}

      {/* ✅ Reduced the height of the bottom gradient since cube is positioned higher */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
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

  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const [startState, setStartState] = useState<number[][][] | null>(null);
  const [focusSide, setFocusSide] = useState<FocusSide>(null);

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

        if ((data?.players?.length ?? 0) >= 2) {
          if (!startState) {
            const { state, moves } = generateScrambledCube(20);
            setStartState(state);

            const msg: GameEvents = {
              type: GameEventTypes.GameStarted,
              value: {
                base_values: {
                  room: data,
                  participants: data.players as any,
                },
                start_time: new Date().toISOString(),
                scrambled_cube: state,
              },
            };
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify(msg));
            }
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
  }, [roomId, selfPlayerId, startState]);

  useEffect(() => {
    if (wsReady || typeof window === "undefined") return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => setWsReady(true);
    ws.onclose = () => setWsReady(false);
    ws.onerror = () => setWsReady(false);
    ws.onmessage = (e) => {
      // future: handle opponent turns / timers here
    };

    return () => ws.close();
  }, [wsReady]);

  useEffect(() => {
    if (startState && playerA) {
      setFocusSide("self");
    }
  }, [startState, playerA]);

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

      <div className="mx-auto max-w-7xl px-4 pt-6"> {/* ✅ Reduced top padding */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
            Match Room
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Variant: <span className="text-slate-200 font-medium">{room?.variant ?? "—"}</span>
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2"> {/* ✅ Reduced top margin */}
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

        {/* ✅ Reduced top margin for boards */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: Self */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
            <PlayerHeader
              username={playerA?.username}
              rating={playerA?.rating}
              accent="blue"
              sideLabel="You"
            />
            <CubeCanvas
              state={startState}
              interactive={true}
              focused={focusSide === "self"}
              onFocus={() => setFocusSide("self")}
            />
          </div>

          {/* Right: Opponent */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
            <PlayerHeader
              username={playerB?.username ?? "Waiting…"}
              rating={playerB?.rating}
              accent="rose"
              sideLabel="Opponent"
            />
            <CubeCanvas
              state={startState}
              interactive={false}
              focused={focusSide === "opponent"}
              onFocus={() => setFocusSide("opponent")}
            />
            {!playerB && (
              <div className="mt-3 text-center text-sm text-slate-500">Searching for an opponent…</div>
            )}
          </div>
        </div>

        <div className="my-8 flex items-center justify-center gap-3"> {/* ✅ Reduced margin */}
          <span className={`h-2 w-2 rounded-full ${bothReady ? "bg-green-400" : "bg-slate-600"}`} />
          <span className="text-xs text-slate-400">
            {bothReady ? "Game ready" : "Waiting for opponent"}
          </span>
        </div>
      </div>
    </div>
  );
}