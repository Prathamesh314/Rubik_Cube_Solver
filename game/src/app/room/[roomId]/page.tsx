// Filename: src/app/room/[roomId]/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Player } from "@/modals/player";
import { Room } from "@/modals/room";
import { GameEvents, GameEventTypes } from "@/types/game-events";
import RubiksCubeViewer, { RubiksCubeViewerHandle } from "@/components/RubiksCubeViewer";
import WinnerPopup from "@/components/WinnerPopup";

const WS_URL = "ws://localhost:8002";
const WS_PORT = 8002;

function Timer({ startTime }: { startTime: number | null }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 100); // Update every 100ms for smooth display

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
  loser: Player
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
  const [showCube, setShowCube] = useState<boolean>(false);
  const playerCubeRef = useRef<RubiksCubeViewerHandle>(null);
  const opponentCubeRef = useRef<RubiksCubeViewerHandle>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const [winnerPropsData, setWinnerPopupData] = useState<PopUpProps>()
  const [showPopUp, setShowPopUp] = useState<boolean>(false)
  const [showGameAbortedPopup, setShowGameAbortedPopUp] = useState<boolean> (false);

  const [wsReady, setWsReady] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [startState, setStartState] = useState<number[][][] | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

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

  async function handleLeaveRoom() {
    if (!roomId || !selfPlayerId) return;
    try {
      if(wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        let elapsedTime = 0;
        if (gameStartTime) {
          const totalSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          elapsedTime = minutes * 60 + seconds;
        }

        // Ensure we have valid opponent data
        const opponentId = selfPlayerId === playerA?.player_id 
          ? playerB?.player_id 
          : playerA?.player_id;

        if (!opponentId) {
          console.warn("Cannot send game finished: opponent not found");
          // Just close the connection without sending game finished
          wsRef.current.close();
          localStorage.removeItem("player");
          router.push("/");
          return;
        }

        const gameFinishedMessage: GameEvents = {
          type: GameEventTypes.GameFinished,
          value: {
            roomId: roomId,
            player_id_who_won: opponentId,
            end_time: elapsedTime.toString(),
          },
        };

        console.log("Game finished event sent because of leaving room: ", gameFinishedMessage);
        wsRef.current.send(JSON.stringify(gameFinishedMessage));
        
        // Wait a bit for the message to be sent
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      localStorage.removeItem("player");
      router.push("/");
    } catch (e) {
      console.error("Failed to leave room:", e);
      localStorage.removeItem("player");
      router.push("/");
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only send game finished if game is actually in progress
      if (wsRef.current && 
          wsRef.current.readyState === WebSocket.OPEN && 
          roomId && 
          selfPlayerId &&
          gameStartTime) {  // Only if game has started
        
        const opponentId = selfPlayerId === playerA?.player_id 
          ? playerB?.player_id 
          : playerA?.player_id;

        if (opponentId) {
          let elapsedTime = 0;
          if (gameStartTime) {
            const totalSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            elapsedTime = minutes * 60 + seconds;
          }

          const gameFinishedMessage: GameEvents = {
            type: GameEventTypes.GameFinished,
            value: {
              roomId: roomId,
              player_id_who_won: opponentId,
              end_time: elapsedTime.toString(),
            },
          };

          // Use sendBeacon for more reliable delivery on page unload
          const blob = new Blob([JSON.stringify(gameFinishedMessage)], {
            type: 'application/json'
          });
          
          // Try WebSocket first
          try {
            wsRef.current.send(JSON.stringify(gameFinishedMessage));
          } catch (err) {
            console.error("Failed to send via WebSocket on unload:", err);
          }
        }
      }

      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId, selfPlayerId, playerA, playerB, gameStartTime]); // Add dependencies

  const [hasSentGameFinished, setHasSentGameFinished] = useState(false);

  const handleCubeSolved = () => {
    if (hasSentGameFinished) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!selfPlayerId) return;
  
    let elapsedTime = 0;
    if (gameStartTime) {
      const totalSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      elapsedTime = minutes * 60 + seconds;
    }
  
    const gameFinishedMessage: GameEvents = {
      type: GameEventTypes.GameFinished,
      value: {
        roomId: roomId,
        player_id_who_won: selfPlayerId,
        end_time: elapsedTime.toString(),
      },
    };

    console.log("Sending game finished message because cube is solved: ", gameFinishedMessage)  
    wsRef.current.send(JSON.stringify(gameFinishedMessage));
    setHasSentGameFinished(true);
  };
  

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
        setRoomSize(data.players.length);

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

  const handleKeyDown = (e: KeyboardEvent) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const keyboardButtonMessage: GameEvents = {
      type: GameEventTypes.KeyBoardButtonPressed,
      value: {
        room: room ?? undefined,
        player: selfPlayerId === playerA?.player_id ? playerA : playerB,
        keyboardButton: e.key,
        direction: e.shiftKey ? "anticlockwise" : "clockwise",
      },
    };

    try {
      ws.send(JSON.stringify(keyboardButtonMessage));
    } catch (err) {
      console.error("Failed to send keyboard event:", err);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !roomId || !playerA) return;

    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsReady(true);
      const gameStartedMessage: GameEvents = {
        type: GameEventTypes.GameStarted,
        value: {
          roomId: roomId,
          player: selfPlayerId === playerA?.player_id ? playerA : playerB,
          start_time: new Date().toISOString(),
        },
      };

      console.log("Started the game: ", gameStartedMessage)
      ws.send(JSON.stringify(gameStartedMessage))
    };

    ws.onclose = () => {
      setWsReady(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        wsRef.current = null; // allow effect to run again
      }, 3000);
    };

    ws.onerror = () => setWsReady(false);

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      if (message.type === GameEventTypes.GameStarted) {
        console.log("Game started event received: ", message);
        const connections = message.value;
        console.log("Connections: ", connections)
        const playersInGame = connections.map((conn: any) => conn.player);

        const opponent = playersInGame.find((p: Player) => p.player_id !== selfPlayerId);

        if (opponent) {
          setPlayerB(opponent);
        }

        setRoom((prev) => {
          if (!prev) return null;
          setStartState(prev.initialState);
          return { ...prev, players: playersInGame };
        });

        console.log("Room: ", room)

        setGameStartTime(Math.floor(Date.now() / 1000) * 1000);
      }

      else if (message.type === GameEventTypes.GameFinished) {
        console.log("Game finished event received ", message)
        if (playerA && playerB) {
          const winner = playerA.player_id === message.value.player_id_who_won ? playerA : playerB;
          const loser = playerA.player_id === message.value.player_id_who_won ? playerB : playerA;
          winner.rating += 8
          loser.rating -= 8
          setWinnerPopupData({ winner, loser });
          setShowPopUp(true);
        }
        return;
      }
      else if (message.type === GameEventTypes.KeyBoardButtonPressed) {
        const player = message.value.player as Player;
        const keybutton_pressed = message.value.keybutton_pressed;
        const clockwise = true? message.value.clockwise === "clockwise": false;

        if (player.player_id !== selfPlayerId) {
          const faceName = keybutton_pressed.toUpperCase()
          opponentCubeRef.current?.applyMove(faceName, clockwise)
        }

      }
      else if (message.type === GameEventTypes.FriendChallengeRejected) {
        const playerId = message.value.playerId
        const roomid = message.value.roomId

        // make an api request to /api/remove_player with body {playerId, roomId}
        fetch("/api/remove_player", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ playerId, roomId: roomid })
        })
        .then(res => {
          if (!res.ok) {
            console.error("Failed to remove player from room");
          }
        })
        .catch(err => {
          console.error("Error while removing player from room:", err);
        });

        setShowGameAbortedPopUp(true);
      }
    };

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
    };
  }, [playerA, roomId, selfPlayerId]);

  // Keyboard -> send to WS
  useEffect(() => {
    if (!wsReady || !roomId || !selfPlayerId) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wsReady, roomId, selfPlayerId, playerA, playerB, room]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading room…</div>
      </div>
    );
  }

  if (showGameAbortedPopup) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur">
        <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm p-6 relative">
          {/* Close/Cross Button */}
          <button
            onClick={() => router.push("/")}
            aria-label="Close"
            className="absolute top-3 right-3 text-slate-400 hover:text-white transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
              fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <div className="flex flex-col items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-pink-600/10 border border-pink-600/40 flex items-center justify-center">
                <svg className="h-8 w-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.36 6.64a9 9 0 11-12.73 0M15 11a3 3 0 01-6 0"/>
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-pink-400">Game Aborted</h2>
            <p className="text-center text-slate-400">The game was aborted. The other player declined or left.</p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 mt-2 rounded bg-pink-600/80 text-white hover:bg-pink-500 transition font-medium"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showPopUp && winnerPropsData) {
    const onclose = () => {
      setShowPopUp(false);
      router.push("/")
    }
    return (
      <div>
        {/* <WinnerPopup winner={winnerPropsData.winner} loser={winnerPropsData.loser} /> */}
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
      {/* Header */}
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
            <div
              className={`ml-2 h-2 w-2 rounded-full ${wsReady ? "bg-green-500" : "bg-red-500"}`}
              title={wsReady ? "Connected" : "Disconnected"}
            />
          </div>
          <div className="flex items-center gap-3">
            <CopyButton value={String(roomId)} />
            <button
              onClick={handleLeaveRoom}
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

        {/* Timer Display */}
        <div className="mt-6 flex justify-center">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 px-8 py-2">
            <Timer startTime={gameStartTime} />
          </div>
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

        {/* Rubik's Cubes area */}
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 mt-8 mb-16">
          {/* Show two RubiksCubeViewer components, one for each player, passing correct player and control props */}
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-2 font-semibold text-slate-200">
              {playerA?.username || "Player A"}
              {playerA && playerA.player_id === selfPlayerId ? " (You)" : ""}
            </div>
            <div ref={leftRef} className="w-full">
            <RubiksCubeViewer
                ref={playerCubeRef}
                container={leftRef.current}
                cube_options={{
                  controlsEnabled: Boolean(playerA && playerA.player_id === selfPlayerId),
                }}
                wsRef={wsRef.current}
                player={playerA}
                room={room}
                participants={[playerA, playerB]}
                onSolved={handleCubeSolved}
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-2 font-semibold text-slate-200">
              {playerB?.username || "Player B"}
              {playerB && playerB.player_id === selfPlayerId ? " (You)" : ""}
            </div>
            <div ref={rightRef} className="w-full">
              <RubiksCubeViewer
              ref={opponentCubeRef}
              container={rightRef.current}
                cube_options={{
                  controlsEnabled: Boolean(playerB && playerB.player_id === selfPlayerId),
                }}
                wsRef={wsRef.current}
                player={playerB}
                room={room}
                participants={[playerA, playerB]}
                onSolved={handleCubeSolved}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}