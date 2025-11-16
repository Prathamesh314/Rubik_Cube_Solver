// Filename: src/app/ai-room/[roomId]/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { CubeCategories, Player, PlayerState } from "@/modals/player";
import { Env } from "@/lib/env_config";
import { Room } from "@/modals/room";
import { GameEventTypes } from "@/types/game-events";
import RubiksCubeViewer, { RubiksCubeViewerHandle } from "@/components/RubiksCubeViewer";
import { Cube, FaceName } from "@/utils/cube";
import { SimpleCubeHelper } from "@/utils/cube_helper";
import WinnerPopup from "@/components/WinnerPopup";

const WS_URL = Env.NEXT_PUBLIC_WEBSOCKET_URL;

function Timer({ startTime }: { startTime: number | null }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="text-3xl font-mono font-bold text-slate-200 tabular-nums">
        {formatTime(elapsed)}
      </div>
    </div>
  );
}

export function generateScrambledCube(number_of_moves: number): { state: Cube; moves: string[] } {
  let cube = [
    [[1,1,1],[1,1,1],[1,1,1]], // Back - Red
    [[4,4,4],[4,4,4],[4,4,4]], // Up - Yellow
    [[5,5,5],[5,5,5],[5,5,5]], // Front - Orange
    [[6,6,6],[6,6,6],[6,6,6]], // Down - White
    [[2,2,2],[2,2,2],[2,2,2]], // Left - Green
    [[3,3,3],[3,3,3],[3,3,3]], // Right - Blue
  ];
  const helper = new SimpleCubeHelper();
  const faces: FaceName[] = ["U", "D", "F", "B", "L", "R"];
  const moves: string[] = [];
  let prevFace: FaceName | null = null;

  for (let i = 0; i < number_of_moves; i++) {
    let face: FaceName;
    do {
      face = faces[Math.floor(Math.random() * faces.length)];
    } while (face === prevFace);

    prevFace = face;
    const clockwise = Math.random() < 0.5;

    switch (face) {
      case "U":
        cube = helper.rotateU(cube, clockwise);
        break;
      case "D":
        cube = helper.rotateD(cube, clockwise);
        break;
      case "F":
        cube = helper.rotateF(cube, clockwise);
        break;
      case "B":
        cube = helper.rotateB(cube, clockwise);
        break;
      case "L":
        cube = helper.rotateL(cube, clockwise);
        break;
      case "R":
        cube = helper.rotateR(cube, clockwise);
        break;
    }

    moves.push(`${face}${clockwise ? '' : "'"}`);
  }

  return { state: cube, moves };
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

interface PopUpProps {
  winner: Player;
  loser: Player;
}

export default function AIRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  console.log("Room id: ", roomId);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [room, setRoom] = useState<Room | null>(null);
  const [humanPlayer, setHumanPlayer] = useState<Player | undefined>();
  const [aiPlayer, setAIPlayer] = useState<Player | undefined>();
  const [showCube, setShowCube] = useState<boolean>(false);
  const playerCubeRef = useRef<RubiksCubeViewerHandle>(null);
  const aiCubeRef = useRef<RubiksCubeViewerHandle>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const [winnerPropsData, setWinnerPopupData] = useState<PopUpProps>();
  const [showPopUp, setShowPopUp] = useState<boolean>(false);

  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [startState, setStartState] = useState<number[][][] | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(true);
  const [aiMoves, setAiMoves] = useState<string[]> ([]);

  // AI move generation
  const aiMoveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const selfPlayerId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("player");
      if (!raw) return null;
      const p = JSON.parse(raw) as Player;
      setHumanPlayer(p);

      const ai_player = {
        player_id: "ai-bot",
        username: "RubikAI",
        player_state: PlayerState.Playing, // or the PlayerState.InGame if you have enum
        rating: 2000,
        total_wins: 0,
        win_percentage: 0,
        top_speed_to_solve_cube: {},
        scrambledCube: [[[0]]]
      } as Player;

      setAIPlayer(ai_player);
      return p?.player_id ?? null;
    } catch {
      return null;
    }
  }, []);

  // WebSocket setup
  useEffect(() => {
    if (typeof window === "undefined" || !gameStarted) return;

    // Always create a new WebSocket when gameStarted changes
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsReady(true);
      // Don't use closure values here, always read the latest values when the message is sent
      console.log("Sending game started ai")
      const game_started_msg = {
        type: GameEventTypes.GameStartedAI,
        value: {
          roomId: roomId,
          // use up-to-date humanPlayer reference
          players: [humanPlayer, aiPlayer]
        }
      };
      ws.send(JSON.stringify(game_started_msg));
    };

    ws.onclose = () => {
      setWsReady(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        wsRef.current = null;
      }, 3000);
    };

    ws.onerror = () => setWsReady(false);

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      console.log("Message type: ", message.type);

      if (message.type === GameEventTypes.GameFinished) {
        console.log("Game finished");
        if (humanPlayer && aiPlayer) {
          const winner = humanPlayer.player_id === message.value.player_id_who_won ? humanPlayer : aiPlayer;
          const loser = humanPlayer.player_id === message.value.player_id_who_won ? aiPlayer : humanPlayer;
          winner.rating += 8;
          loser.rating -= 8;
          setWinnerPopupData({ winner, loser });
          setShowPopUp(true);
        }
      }

      else if (message.type === GameEventTypes.GameStartedAI) {
        console.log("Game started ai message received..")
        setLoading(false);
        setGameStarted(true)
        setGameStartTime(Date.now());
        setStartState(generateScrambledCube(20).state)
        // setGameStartTime(Date.now());
      }
    };

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
    };
    // Add humanPlayer as a dependency to pick up correct state for ws.onopen
    // This guarantees the value inside ws.onopen is current
  }, [roomId, gameStarted]);

  useEffect(() => {
    const fetchAiMoves = async () => {
        console.log("startstate: ", startState)
        if (startState === null) {
            return
        }
        const res = await fetch("http://localhost:3000/api/get_cube_sol", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scrambled_cube: startState
          }),
        });

        if (res.ok) {
            const data = await res.json()
            console.log("AI moves data: ", data);
            setAiMoves(data.data)
        } else {
            console.error("error in fetching ai moves")
        }
    }

    if (startState === undefined || startState?.length === 0) {
        setStartState(generateScrambledCube(20).state)
    }

    fetchAiMoves();
  }, [gameStarted, startState])

  // --- 
  // WEBSOCKET SENDING HELPERS (always read latest wsRef value) 
  // ---

  console.log("Ai moves: ", aiMoves)

  // Always useCallback and always read wsRef.current for the actual send!
  const sendWSMessage = useCallback((msg: any) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  // Handle keyboard input for human player
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    if (playerCubeRef.current?.IsRubikCubeSolved()) {
      // Human won
      let elapsedTime = 0;
      if (gameStartTime) {
        const totalSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        elapsedTime = minutes * 60 + seconds;
      }

      const game_finished_msg = {
        type: GameEventTypes.GameFinished,
        value: {
          roomId: roomId,
          player_id_who_won: selfPlayerId,
          end_time: elapsedTime
        }
      };

      // Use helper to send message
      sendWSMessage(game_finished_msg);

      // Stop AI moves
      if (aiMoveIntervalRef.current) {
        clearInterval(aiMoveIntervalRef.current);
      }
    }

    const message = {
      type: "KeyBoardButtonPressed",
      value: {
        roomId: roomId,
        player: humanPlayer,
        keyboardButton: e.key,
        clockwise: e.shiftKey ? "anticlockwise" : "clockwise"
      },
    };

    try {
      console.log("Sending message: ", message);
      sendWSMessage(message);
    } catch (err) {
      console.error("Failed to send keyboard event:", err);
    }
  }, [roomId, selfPlayerId, playerCubeRef, humanPlayer, aiMoveIntervalRef, gameStartTime, sendWSMessage]);

  useEffect(() => {
    if (!wsReady || !roomId || !selfPlayerId) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wsReady, roomId, selfPlayerId, handleKeyDown]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Preparing AI match…</div>
      </div>
    );
  }

  if (showPopUp && winnerPropsData) {
    const onclose = () => {
      setShowPopUp(false);
      router.push("/");
    };
    return (
      <div>
        <WinnerPopup
          isOpen={showPopUp}
          onClose={() => onclose()}
          winner={winnerPropsData.winner}
          loser={winnerPropsData.loser}
        />
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-bold mb-2">Couldn't start AI match</h2>
          <p className="text-slate-400 mb-6">{err}</p>
          <button className="underline text-indigo-300" onClick={() => router.push("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-purple-500/20 ring-1 ring-purple-500/30 flex items-center justify-center">
              <span className="text-purple-300 text-sm font-black">AI</span>
            </div>
            <div>
              <div className="text-sm text-slate-400 leading-tight">AI Match</div>
              <div className="font-semibold tracking-tight">{roomId}</div>
            </div>
            <div
              className={`ml-2 h-2 w-2 rounded-full ${wsReady ? "bg-green-500" : "bg-red-500"}`}
              title={wsReady ? "Connected" : "Disconnected"}
            />
          </div>
          <div className="flex items-center gap-3">
            <CopyButton value={String(roomId)} />
            <button
            //   onClick={handleLeaveRoom}
              className="rounded-md bg-red-600/80 px-4 py-2 text-sm font-semibold ring-1 ring-red-500/40 hover:bg-red-600 transition"
            >
              Leave
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-slate-400">
            AI Challenge
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Compete against our AI opponent
          </p>
        </div>

        {/* Timer Display */}
        <div className="mt-6 flex justify-center">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 px-8 py-2">
            <Timer startTime={gameStartTime} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
            <h3 className="text-sm font-semibold text-slate-300">Game Status</h3>
            <p className="mt-2 text-2xl font-bold text-green-400">
              Match in progress
            </p>
            <p className="mt-1 text-slate-400">
              Click your board to enable keyboard moves (U R F D L B, hold Shift for CCW).
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
            <h3 className="text-sm font-semibold text-slate-300">Rules</h3>
            <ul className="mt-2 space-y-2 text-slate-300 text-sm leading-relaxed">
              <li>Same scramble for both you and AI.</li>
              <li>First to solve wins and rating updates accordingly.</li>
              <li>Keyboard: U R F D L B (hold Shift for counter-clockwise).</li>
            </ul>
          </div>
        </div>

        <div className="my-8 flex items-center justify-center gap-3">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-xs text-slate-400">Game ready</span>
        </div>

        {/* Rubik's Cubes area */}
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 mt-8 mb-16">
          {/* Human Player */}
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-2 font-semibold text-slate-200">
              {humanPlayer?.username || "You"} (You)
            </div>
            <div ref={leftRef} className="w-full">
              <RubiksCubeViewer
                ref={playerCubeRef}
                container={leftRef.current}
                cube_options={{
                  controlsEnabled: true,
                }}
                wsRef={wsRef.current}
                player={humanPlayer}
                room={room}
                participants={[humanPlayer, aiPlayer]}
              />
            </div>
          </div>

          {/* AI Player */}
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-2 font-semibold text-slate-200 flex items-center gap-2">
              <span>{aiPlayer?.username || "AI Opponent"}</span>
              <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-400 ring-1 ring-purple-500/20">
                AI
              </span>
            </div>
            <div ref={rightRef} className="w-full">
              <RubiksCubeViewer
                ref={aiCubeRef}
                container={rightRef.current}
                cube_options={{
                  controlsEnabled: false,
                }}
                wsRef={wsRef.current}
                player={aiPlayer}
                room={room}
                participants={[humanPlayer, aiPlayer]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}