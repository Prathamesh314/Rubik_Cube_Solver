"use client";
import React from "react";
import { useRouter } from "next/navigation";

// --- tiny auth helpers (client-only) ---
const AUTH_KEY = "rc_auth";
type AuthStorage = {
  token: string | null;
  player: {
    player_id: string;
    username: string;
    player_state: "playing" | "not playing" | "waiting";
    rating: number;
    total_wins: number;
    win_percentage: number;
    top_speed_to_solve_cube: Record<string, { cube_category: string; top_speed: number }>;
  };
};

function getAuth(): AuthStorage | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setAuth(data: AuthStorage) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

function ensureAuth(): AuthStorage {
  const existing = getAuth();
  if (existing?.player?.player_id) return existing;

  // create a lightweight guest identity
  const id = crypto.randomUUID();
  const guestNum = id.split("-")[0].slice(0, 6);
  const auth: AuthStorage = {
    token: null, // no token for guests; fill later if you add JWT
    player: {
      player_id: id,
      username: `guest-${guestNum}`,
      player_state: "waiting",
      rating: 1200,
      total_wins: 0,
      win_percentage: 0,
      top_speed_to_solve_cube: {}, // can pre-seed "3x3 cube" if you want
    },
  };
  setAuth(auth);
  return auth;
}

// --- pretty cube icon (kept from your design) ---
const CubeIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" className="w-24 h-24 md:w-32 md:h-32 text-white">
    <path d="M32 2L2 17L32 32L62 17L32 2Z" fill="#0051BA"/>
    <path d="M2 17L2 47L32 62L32 32L2 17Z" fill="#FFD500"/>
    <path d="M62 17L62 47L32 62L32 32L62 17Z" fill="#FF5800"/>
    <path d="M32 32L2 47L32 62" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <path d="M32 32L62 47" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <path d="M2 17L32 32" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <path d="M62 17L32 32" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <path d="M32 2V32" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
  </svg>
);

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [variant, setVariant] = React.useState<"3x3 cube" | "4x4 cube">("3x3 cube");

  // Optional: ensure a guest identity exists as soon as user lands here
  React.useEffect(() => { ensureAuth(); }, []);

  const handleStartGame = async () => {
    try {
      setLoading(true);

      // make sure we have a player object saved
      const auth = ensureAuth();
      const player = auth.player;

      console.log("Player: ", player);

      const res = await fetch("/api/matchmake/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant, player }),
      });
      const data = await res.json();
      localStorage.setItem("player", JSON.stringify(player));
      router.push(`/room/${data.room.id}`);
    } catch (e) {
      console.error(`Error in landing page: ${e.toString()}`);
      // graceful fallback for dev environments
      const { player_id } = ensureAuth().player;
      router.push(`/queue?pid=${encodeURIComponent(player_id)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      {/* glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-96 h-96 bg-indigo-900 rounded-full mix-blend-screen blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-4xl w-full">
        <div className="flex justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="animate-[spin_20s_linear_infinite]">
              <CubeIcon />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
            Cube Clash
          </h1>
          <h2 className="text-xl md:text-2xl font-medium text-indigo-300">The Ultimate Multiplayer Showdown</h2>
        </div>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
          Challenge players worldwide in a real-time, head-to-head cube-solving competition.
        </p>

        {/* variant toggle */}
        <div className="mx-auto flex items-center justify-center gap-2">
          {(["3x3 cube", "4x4 cube"] as const).map(v => {
            const active = v === variant;
            return (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={
                  "px-5 py-2 rounded-xl border transition " +
                  (active
                    ? "bg-indigo-600 border-indigo-500"
                    : "bg-slate-800 border-slate-700 hover:bg-slate-700")
                }
              >
                {v.replace(" cube", "").replace("x", "×")}
              </button>
            );
          })}
        </div>

        {/* start */}
        <div className="pt-4">
          <button
            onClick={handleStartGame}
            disabled={loading}
            className={
              "px-10 py-4 text-xl font-semibold rounded-lg text-white shadow-lg transition " +
              (loading
                ? "bg-slate-700 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-105 focus:ring-4 focus:ring-indigo-500/50")
            }
          >
            {loading ? "Joining Match..." : "Find Match"}
          </button>
        </div>

        <div className="text-sm text-slate-500">
          We’ll place you in a queue if no opponent is instantly available.
        </div>
      </div>
    </div>
  );
}
