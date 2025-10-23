"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Player } from "@/modals/player";
import { Env } from "@/lib/env_config";
import { GameEvents, GameEventTypes } from "@/services/websocket";
import { Game } from "@/services/game";
import { Room } from "@/modals/room";
import {generateScrambledCube} from "@/components/cube"

const UserIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 21.945V13H21.945a9.001 9.001 0 00-8.945-8.945z" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CopyIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

type RoomPlayer = { username: string; rating: number };
type RoomData = {
  id: string;
  players: RoomPlayer[]; 
  maxPlayers: number;
  gameState: any;
  variant: string;
  createdAt: number;
};

const WS_URL = Env.NEXT_PUBLIC_WEBSOCKET_URL

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [room, setRoom] = useState<Room>();

  const [player_a, setPlayerA] = useState<Player>();
  const [player_b, setPlayerB] = useState<Player>();
  const [connectWs, setConnectWs] = useState<boolean>(false);
  const [isGameStarted, SetIsGameStarted] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);

  const pollTimerRef = useRef<number | null>(null);
  const visibleRef = useRef<boolean>(true);

  const player_str = localStorage.getItem("player")
  if (player_str == null) {
    console.error("Cannot start the game because player is null");
  }

  useEffect(() => {
    let mounted = true;

    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/room/${roomId}`);

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status} (${
              (await response.json()).error
            })`
          );
        }

        const data: RoomData = await response.json();
        if(data?.players.length == 1) {
          console.log("We only have one player");
        }else if(data?.players.length == 2) {
          console.log("We have 2 players");
          setPlayerA(data.players[0] as Player);
          setPlayerB(data.players[1] as Player);
          setConnectWs(true);
          const r = await (await Game.getInstance()).getRoom(roomId);
          setRoom(r);
          if (isGameStarted == 0) {
            SetIsGameStarted(1);
          }
        } else if (data.players.length >= 3) {
          console.error("Cannot start the game...")
          return
        }
        
        setRoomData(data);

        if(connectWs) {
          const ws = new WebSocket(WS_URL);
          wsRef.current = ws;

          if (isGameStarted == 1){
            SetIsGameStarted(2);
            const { moves, state } = generateScrambledCube(20);
            const msg: GameEvents = {
              type: GameEventTypes.GameStarted,
              value: {
                base_values: {
                  room: room,
                  participants: [player_a, player_b],
                },
                start_time: new Date().toISOString(),
                scrambled_cube: state
              }
            }
            
            ws.send(JSON.stringify(msg));
          }
        }

      } catch (error: any) {
        if (mounted) {
          console.error("Fetch room error:", error);
          setErr(error.message || "Unknown error");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchRoomData();
    
    // You'll need separate logic for polling/WebSockets if you want real-time updates
    // For now, removing the polling logic to keep it simple.

    return () => { mounted = false; };
  }, [roomId]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(String(roomId));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-semibold">Loading Room...</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-bold mb-2">Couldn’t load the room</h2>
          <p className="text-slate-400 mb-6">{err}</p>
          <button
            className="underline text-indigo-300"
            onClick={() => router.push("/")}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      {/* Top block: title + room id + copy */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">Room</h1>
          <p className="mt-2 text-slate-300 text-lg flex items-center justify-center gap-2">
            Room ID: <span className="font-mono text-indigo-300">{roomId}</span>
            <button
              onClick={handleCopyToClipboard}
              className="p-1 bg-slate-800 border border-slate-700 rounded hover:bg-indigo-700 transition"
              title="Copy Room ID"
            >
              {isCopied ? <span className="text-xs px-1">Copied!</span> : <CopyIcon />}
            </button>
          </p>
          <p className="mt-6 text-base text-slate-400">Game UI comes here (WS, cube, timers...).</p>
          <button className="mt-6 underline text-slate-300" onClick={() => router.push("/")}>
            Go Home
          </button>
        </div>
      </div>

      {/* Main section */}
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
            Match Room
          </h1>
          <div className="flex items-center justify-center mt-4">
            <p className="text-slate-400 mr-3">ROOM ID:</p>
            <div className="bg-slate-800 border border-slate-700 rounded-md flex items-center">
              <span className="font-mono text-indigo-300 px-3">{roomId}</span>
              <button
                onClick={handleCopyToClipboard}
                className="p-2 bg-slate-700 hover:bg-indigo-600 transition-colors rounded-r-md"
                title="Copy Room ID"
              >
                {isCopied ? <span className="text-xs px-1">Copied!</span> : <CopyIcon />}
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Variant: <span className="text-slate-200 font-medium">{roomData?.variant || "—"}</span>
          </p>
        </div>

        {/* Player Matchup */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center mb-12">
          {/* Player 1 */}
          <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-slate-700 rounded-full p-4 mb-4">
                <UserIcon className="w-12 h-12 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold">{player_a?.username}</h2>
              <p className="text-yellow-400 font-semibold">Rating: {player_a?.rating}</p>
            </div>
          </div>

          {/* VS */}
          <div className="text-center">
            <p className="text-4xl md:text-6xl font-black text-slate-600 animate-pulse">VS</p>
          </div>

          {/* Player 2 */}
          <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 text-center">
            {player_b ? (
              <div className="flex flex-col items-center">
                <div className="bg-slate-700 rounded-full p-4 mb-4">
                  <UserIcon className="w-12 h-12 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold">{player_b?.username}</h2>
                <p className="text-yellow-400 font-semibold">Rating: {player_b?.rating}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-500">
                <div className="border-2 border-dashed border-slate-600 rounded-full p-4 mb-4">
                  <UserIcon className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold">Waiting for Opponent...</h2>
                <p className="font-semibold">Searching...</p>
              </div>
            )}
          </div>
        </div>

        {/* Status + Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-white">Game Status</h3>
            <p className="text-2xl font-bold text-green-400">
              {(roomData?.players?.length ?? 0) >= 2 ? "Both players connected" : "Game starting soon..."}
            </p>
            <p className="text-slate-400 mt-2">
              {(roomData?.players?.length ?? 0) >= 2
                ? "Prepare for the match!"
                : "We’ll start once the opponent joins."}
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-white">Game Rules</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <ClockIcon />
                <span className="ml-3 text-slate-300">Solve the Rubik&apos;s Cube as fast as possible.</span>
              </li>
              <li className="flex items-center">
                <TrophyIcon />
                <span className="ml-3 text-slate-300">The first player to solve wins the match.</span>
              </li>
              <li className="flex items-center">
                <ChartIcon />
                <span className="ml-3 text-slate-300">Your rating will be updated based on the result.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Leave */}
        <div className="mt-12 text-center">
          <button
            onClick={() => router.push("/")}
            className="bg-red-600/80 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}
