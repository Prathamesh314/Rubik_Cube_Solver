// Filename: src/app/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LogOut,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Calendar,
  Edit2,
  Check,
  X,
  Gamepad2,
  Award,
  User,
} from "lucide-react";

interface RawGame {
  id: string;
  user_id: string;
  opponent_id: string;
  started_at: string;  
  ended_at: string;    
  winner_user_id: string;
  created_at: string;
  updated_at: string;
  rating_change?: number;
}
interface GameHistory {
  id: string;
  opponent: string;        
  result: "win" | "loss";
  rating_change: number;   
  user_won: boolean;       
  time: string;            
  date: string;            
  email?: string;          
}

interface Player {
  player_id: string;
  username: string;
  email: string;
  player_state: string;
  rating: number;
  total_wins: number;
  win_percentage: number;
  top_speed_to_solve_cube?: Record<string, unknown>;
  scrambledCube?: number[][][];
}

function calcDurationSec(startISO: string, endISO: string): number {
  const s = new Date(startISO).getTime();
  const e = new Date(endISO).getTime();
  if (!s || !e || e < s) return 0;
  return Math.round((e - s) / 1000);
}
function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function formatRelativeDate(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  if (isNaN(diffMs)) return "-";
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffMin > 0) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
  return `just now`;
}

export default function ProfilePage() {
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Optionally cache id vs username for opponents!
  const [opponentMap, setOpponentMap] = useState<{ [id: string]: { username?: string; email?: string } }>({});

  useEffect(() => {
    const loadUserProfileAndHistory = async () => {
      const userId = sessionStorage.getItem("userId");

      if (!userId) {
        setPlayer(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch profile
        const res = await fetch(`/api/get_user?id=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const user = await res.json();

        setPlayer({
          player_id: user.user.id ?? "",
          username: user.user.username ?? "",
          player_state: user.user.player_state ?? "",
          rating: user.user.rating ?? 0,
          total_wins: user.user.total_wins ?? 0,
          win_percentage: user.user.win_percentage ?? 0,
          top_speed_to_solve_cube: user.user.top_speed_to_solve_cube ?? {},
          email: user.user.email ?? "",
        });
        setNewUsername(user.user.username ?? "");

        // Fetch actual game history
        const ghRes = await fetch(
          `/api/fetch_game_history?userId=${encodeURIComponent(userId)}`
        );
        if (!ghRes.ok) throw new Error("Failed to fetch game history");
        const ghData = await ghRes.json();

        if (!ghData.success || !Array.isArray(ghData.games)) {
          setGameHistory([]);
          setLoading(false);
          return;
        }

        // Gather opponent ids to display names
        const opponentIds: Set<string> = new Set();
        ghData.games.forEach((g: RawGame) => {
          // If current user is user_id, opponent is opponent_id, else vice versa
          if (g.user_id === userId) {
            opponentIds.add(g.opponent_id);
          } else {
            opponentIds.add(g.user_id);
          }
        });

        // Fetch usernames for opponents (batch, but here N requests)
        // This assumes an API endpoint like /api/get_user?id=...
        // Optionally: skip if already cached
        const opponentArr = Array.from(opponentIds).filter(
          (oid) => !opponentMap[oid]
        );
        let newMap: typeof opponentMap = {};
        if (opponentArr.length) {
          await Promise.all(
            opponentArr.map(async (oid) => {
              try {
                const oRes = await fetch(`/api/get_user?id=${encodeURIComponent(oid)}`);
                if (oRes.ok) {
                  const oUser = await oRes.json();
                  newMap[oid] = {
                    username: oUser.user?.username ?? oid,
                    email: oUser.user?.email ?? undefined,
                  };
                }
              } catch (e) {}
            })
          );
        }
        setOpponentMap((prev) => ({ ...prev, ...newMap }));

        // Build formatted gameHistory
        const fullMap = { ...opponentMap, ...newMap };
        const localUserId = typeof window !== "undefined" ? (window.localStorage.getItem("userId") || userId) : userId;
        const games: GameHistory[] = ghData.games.map((g: RawGame) => {
          // Determine if this user won
          const userWon = g.winner_user_id === localUserId;
          const result: "win" | "loss" = userWon ? "win" : "loss";
          const rating_change = typeof g.rating_change === "number" ? g.rating_change : 0;
          const opponent_id = g.user_id === userId ? g.opponent_id : g.user_id;
          const oppUsername = fullMap?.[opponent_id]?.username ?? opponent_id;
          const oppEmail = fullMap?.[opponent_id]?.email;
          const durationSec = calcDurationSec(g.started_at, g.ended_at);
          const time = formatDuration(durationSec);
          const date = formatRelativeDate(g.ended_at);
          return {
            id: g.id,
            opponent: oppUsername,
            email: oppEmail,
            result,
            rating_change,
            user_won: userWon,
            time,
            date,
          };
        });
        setGameHistory(games);
        setLoading(false);
      } catch (err) {
        setPlayer(null);
        setGameHistory([]);
        setLoading(false);
      }
    };

    loadUserProfileAndHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("player");
    sessionStorage.removeItem("userId");
    router.push("/");
  };

  const handleSaveUsername = () => {
    if (player && newUsername.trim()) {
      const updatedPlayer = { ...player, username: newUsername.trim() };
      setPlayer(updatedPlayer);
      localStorage.setItem("player", JSON.stringify(updatedPlayer));
      setIsEditing(false);
    }
  };

  // Show loading spinner if loading or player not ready
  if (loading || !player) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading profile…</p>
        </div>
      </div>
    );
  }

  // Real stats from loaded history
  const stats = {
    gamesPlayed: gameHistory.length,
    wins: gameHistory.filter((g) => g.result === "win").length,
    losses: gameHistory.filter((g) => g.result === "loss").length,
  };

  const winRate =
    stats.gamesPlayed > 0
      ? ((stats.wins / stats.gamesPlayed) * 100).toFixed(1)
      : "0.0";

  const initials =
    player.username
      ?.trim()
      .split(" ")
      .map((p: string) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Profile Card */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-6 md:px-7 md:py-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            {/* Avatar */}
            <div className="flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-lg font-semibold text-slate-100 md:h-20 md:w-20">
                {initials || <User className="w-7 h-7" />}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-3">
              {isEditing ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-lg font-semibold text-slate-50 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveUsername}
                      className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-white"
                    >
                      <Check className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setNewUsername(player.username || "");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold md:text-3xl">
                    {player.username}
                  </h1>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setNewUsername(player.username || "");
                    }}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    title="Edit username"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                {player.email && (
                  <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1">
                    {player.email}
                  </span>
                )}
                {player.player_state && (
                  <span className="inline-flex items-center rounded-full border border-slate-700 px-3 py-1">
                    {player.player_state}
                  </span>
                )}
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-slate-900 px-3 py-1.5 text-xs text-amber-300">
                <Trophy className="w-4 h-4" />
                <span className="text-base font-semibold text-amber-300">
                  {player.rating}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-amber-300/80">
                  Rating
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Gamepad2 className="w-5 h-5" />}
            label="Games Played"
            value={stats.gamesPlayed}
          />
          <StatCard
            icon={<Award className="w-5 h-5" />}
            label="Wins"
            value={stats.wins}
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Losses"
            value={stats.losses}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Win Rate"
            value={`${winRate}%`}
          />
        </section>

        {/* Match History */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-5 md:px-6 md:py-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800">
                <Calendar className="w-4 h-4 text-slate-200" />
              </div>
              <h2 className="text-lg font-semibold">Match History</h2>
            </div>
            <p className="text-xs text-slate-400">
              {stats.gamesPlayed} games total
            </p>
          </div>

          {gameHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-slate-400">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                <Gamepad2 className="w-6 h-6 text-slate-500" />
              </div>
              <p>No games played yet.</p>
              <p className="mt-1 text-xs text-slate-500">
                Play a match to see your recent results here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {gameHistory.map((game) => {
                // Determine rating change color based on win/loss
                let ratingChangeColor =
                  game.user_won
                    ? "bg-emerald-700/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-red-700/20 text-red-300 border border-red-500/40";

                return (
                  <div
                    key={game.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm"
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-md text-xs font-medium ${
                          game.result === "win"
                            ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-red-600/20 text-red-300 border border-red-500/40"
                        }`}
                      >
                        {game.result === "win" ? "Win" : "Loss"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-50">
                          vs {game.opponent}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {game.time}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {game.date}
                          </span>
                          {game.email && (
                            <>
                              <span>•</span>
                              <span className="truncate">{game.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${ratingChangeColor}`}
                    >
                      {game.rating_change > 0 ? "+" : ""}
                      {game.rating_change}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-slate-200">
          {icon}
        </div>
      </div>
      <p className="text-xl font-semibold text-slate-50">{value}</p>
    </div>
  );
}
