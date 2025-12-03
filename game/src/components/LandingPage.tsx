"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CubeCategories, Player, PlayerState } from "@/modals/player";
import { NavBar } from "./Navbar";
import { GameEventTypes } from "@/types/game-events";
import { useSocket } from "@/context/SocketContext";
import { toast } from "react-hot-toast";
import { Swords, X, Check } from "lucide-react";

interface PlayerType {
  player_id: string;
  username: string;
  player_state: PlayerState;
  rating: number;
  total_wins: number;
  win_percentage: number;
  scrambledCube: number[][][];
}

export type ApiUserResponse = {
  success: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    password: string;
    rating: number;
    total_games_played: number;
    fastest_time_to_solve_cube: number;
    created_at: string;
    updated_at: string;
    total_wins: number;
  };
};

const AUTH_KEY = "rc_auth";
type AuthStorage = {
  token: string | null;
  player: {
    player_id: string;
    username: string;
  };
};

function getAuth(): AuthStorage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setAuth(data: AuthStorage) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save auth:", error);
  }
}

function ensureAuth(): AuthStorage {
  const existing = getAuth();
  if (existing?.player?.player_id) return existing;

  const currentPlayerId = sessionStorage.getItem("userId");
  const username = sessionStorage.getItem("username");
  const token = sessionStorage.getItem("token");

  if (!currentPlayerId || !username) {
    throw new Error("User is not logged in..");
  }

  const auth: AuthStorage = {
    token: token,
    player: {
      player_id: currentPlayerId,
      username: username,
    },
  };
  setAuth(auth);
  return auth;
}

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [variant, setVariant] = React.useState<"3x3 cube" | "4x4 cube">(
    "3x3 cube"
  );
  const [authReady, setAuthReady] = React.useState(false);
  const [aiLoading, setAiLoading] = React.useState(false);

  // we don't actually need wsReady anymore
  const [wsReady, setWsReady] = useState(false);

  // ✅ pull setUserId from socket context
  const { isReady, send, onMessage, setUserId } = useSocket();

  const handleChallengeAccepted = (opponetPlayerId?: string) => {
    const helper = async () => {
      const userId = sessionStorage.getItem("userId");
      const player_res = await fetch(`/api/get_user?id=${userId}`);
      if (!player_res.ok) {
        throw new Error(`Cannot find user in db for user id: ${userId}`);
      }

      const player_data: ApiUserResponse = await player_res.json();

      const new_player = new Player(
        player_data.user.id,
        player_data.user.username,
        PlayerState.NotPlaying,
        player_data.user.rating,
        player_data.user.total_wins,
        player_data.user.total_wins === 0
          ? 0
          : (player_data.user.total_wins /
              player_data.user.total_games_played) *
            100,
        {}, // top_speed_to_solve_cube: no data, provide empty object
        [[[]]] // scrambledCube, default
      );

      const res = await fetch("/api/match_friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player: new_player,
          variant: CubeCategories.ThreeCube,
          isOpponentReady: true,
          opponentPlayerId: opponetPlayerId,
        }),
      });

      if (!res.ok) {
        throw Error("Error in matching friends api");
      }

      const data: {
        roomId: string;
        isGameStarted: boolean;
      } = await res.json();

      localStorage.setItem("player", JSON.stringify(new_player));
      router.push(`/room/${data.roomId}`);
    };

    helper();
  };

  // 🔹 On first mount: ensure auth AND tell SocketProvider the userId
  useEffect(() => {
    try {
      const auth = ensureAuth();
      setAuthReady(true);
      console.log("[LandingPage] ensureAuth player_id:", auth.player.player_id);
      setUserId(auth.player.player_id); // <== this triggers WS connect + PlayerOnline
    } catch (e) {
      console.error("[LandingPage] ensureAuth failed:", e);
      // you can redirect to login page if needed
      // router.push("/login");
    }
  }, [setUserId]);

  // Receive messages here....
  useEffect(() => {
    const off = onMessage((msg) => {
      console.log("[LandingPage] incoming:", msg);
      if (msg.type === GameEventTypes.FriendChallenge) {
        const opponentId = msg.value.opponentPlayerId;
        console.log(
          "Friend challenged you whose playerId: ",
          msg.value
        );
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible
                  ? "animate-in fade-in zoom-in-95"
                  : "animate-out fade-out zoom-out-95"
              } w-full max-w-sm pointer-events-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden`}
            >
              {/* Card Content */}
              <div className="p-4 flex items-start gap-4">
                {/* Icon Circle */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                    <Swords className="h-5 w-5 text-sky-500" />
                  </div>
                </div>

                {/* Text Info */}
                <div className="flex-1 pt-0.5">
                  <h3 className="text-sm font-bold text-white">
                    Duel Request
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    <span className="font-semibold text-sky-400">
                      {opponentId}
                    </span>{" "}
                    wants to challenge you!
                  </p>
                </div>
              </div>

              {/* Button Footer - Split Design */}
              <div className="flex border-t border-slate-800 bg-slate-950/30">
                <button
                  onClick={() => {
                    console.log("Rejection sent.");
                    toast.dismiss(t.id);
                  }}
                  className="w-full px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-colors border-r border-slate-800"
                >
                  <X className="w-4 h-4" />
                  Decline
                </button>

                <button
                  onClick={() => {
                    console.log("Challenge Accepted!");
                    handleChallengeAccepted(msg.value?.opponentPlayerId);
                    toast.dismiss(t.id);
                  }}
                  className="w-full px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </button>
              </div>
            </div>
          ),
          {
            id: "challenge-toast",
            duration: Infinity,
            position: "top-center",
          }
        );
      }
    });

    return off;
  }, [onMessage, router]);

  // NOTE: we removed the effect that was sending PlayerOnline from here.
  // The provider sends PlayerOnline automatically in ws.onopen
  // when setUserId has been called.

  const handleStartGame = async () => {
    try {
      setLoading(true);

      const auth = ensureAuth();

      const userId = sessionStorage.getItem("userId");
      const player_res = await fetch(`/api/get_user?id=${userId}`);
      if (!player_res.ok) {
        throw new Error(`Cannot find user in db for user id: ${userId}`);
      }

      const player_data: ApiUserResponse = await player_res.json();

      const new_player: PlayerType = {
        player_id: player_data.user.id,
        username: player_data.user.username,
        player_state: PlayerState.NotPlaying,
        rating: player_data.user.rating,
        total_wins: player_data.user.total_wins,
        scrambledCube: [[[]]],
        win_percentage:
          (player_data.user.total_games_played /
            player_data.user.total_wins) *
          100,
      };

      console.log("New player: ", new_player);

      const res = await fetch("/api/matchmake/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant, new_player }),
      });

      if (!res.ok) {
        throw new Error(`Failed to start matchmaking: ${res.status}`);
      }

      const data = await res.json();
      console.log("Response of matchmake start api: ", data);

      if (typeof window !== "undefined") {
        localStorage.setItem("player", JSON.stringify(new_player));
      }

      router.push(`/room/${data.room.id}`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(`Error in landing page: ${e.message}`);
      } else {
        console.error("Error in landing page:", e);
      }
      const auth = ensureAuth();
      if (auth?.player?.player_id) {
        router.push(`/queue?pid=${encodeURIComponent(auth.player.player_id)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full mix-blend-screen blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full mix-blend-screen blur-3xl opacity-30" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      </div>

      <div className="relative z-10">
        {/* Header / Navigation space */}
        <NavBar />

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight">
                  <span className="block text-white">Solve Faster.</span>
                  <span className="block bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent">
                    Compete Harder.
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-lg leading-relaxed">
                  Challenge cubers worldwide in real-time multiplayer competitions. Master the Rubik's Cube while climbing global rankings.
                </p>
              </div>

              {/* Variant selector */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <span className="text-sm font-medium text-slate-400">Choose your challenge:</span>
                <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
                  {(["3x3 cube", "4x4 cube"] as const).map(v => {
                    const active = v === variant;
                    return (
                      <button
                        key={v}
                        onClick={() => setVariant(v)}
                        className={
                          "px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 " +
                          (active
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-slate-400 hover:text-white hover:bg-slate-700/50")
                        }
                      >
                        {v.replace(" cube", "").replace("x", "×")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CTA Button and Play AI Button */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4 sm:items-center">
                {/* <button
                  onClick={handleStartGame}
                  disabled={loading}
                  className={
                    "w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-lg transition-all duration-200 " +
                    (loading
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500 hover:scale-105 hover:-translate-y-0.5")
                  }
                > */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      onClick={handleStartGame}
                      disabled={loading}
                      className={
                        "flex-1 px-8 py-4 text-lg font-bold rounded-lg transition-all duration-200 flex items-center justify-center " +
                        (loading
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500 hover:scale-105 hover:-translate-y-0.5")
                      }
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Finding Match...
                        </span>
                      ) : (
                        "Find Your Match"
                      )}
                    </button>
                    <span className="hidden sm:block w-px bg-slate-700 mx-1 self-stretch" />
                    <button
                      onClick={() => { router.push("/friends"); }}
                      className="flex-1 px-8 py-4 text-lg font-bold rounded-lg transition-all duration-200 flex items-center justify-center bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:from-pink-500 hover:to-purple-500 hover:scale-105 hover:-translate-y-0.5"
                    >
                      Play With Friend
                    </button>
                  </div>
                <p className="text-xs text-slate-500 mt-3 sm:mt-0 sm:ml-3">
                  ⚡ Instant queue system • Fair rating-based matchmaking
                </p>
              </div>
            </div>

            {/* Right: Animated Cube */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-80 h-80 flex items-center justify-center">
                {/* Outer glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-3xl blur-2xl" />
                
                {/* Rotating cube */}
                <div className="animate-[spin_20s_linear_infinite] relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl" />
                  <svg width="200" height="200" viewBox="0 0 64 64" className="w-48 h-48 drop-shadow-2xl">
                    <path d="M32 2L2 17L32 32L62 17L32 2Z" fill="#0051BA"/>
                    <path d="M2 17L2 47L32 62L32 32L2 17Z" fill="#FFD500"/>
                    <path d="M62 17L62 47L32 62L32 32L62 17Z" fill="#FF5800"/>
                    <path d="M32 32L2 47L32 62" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                    <path d="M32 32L62 47" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                    <path d="M2 17L32 32" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                    <path d="M62 17L32 32" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                    <path d="M32 2V32" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}