// Filename: src/app/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface GameHistory {
  id: string;
  opponent: string;
  result: "win" | "loss";
  rating_change: number;
  time: string;
  date: string;
  email?: string;
}

// Fix: make scrambledCube and top_speed_to_solve_cube optional for robustness, as they are not always present
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

export default function ProfilePage() {
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  // Mock game history - replace with actual API call
  const [gameHistory] = useState<GameHistory[]>([
    { id: "1", opponent: "SpeedCuber99", result: "win", rating_change: 8, time: "2:34.12", date: "2 hours ago", email: "speedcuber99@example.com" },
    { id: "2", opponent: "CubeMaster", result: "loss", rating_change: -8, time: "3:45.89", date: "5 hours ago", email: "cubemaster@example.com" },
    { id: "3", opponent: "QuickSolver", result: "win", rating_change: 8, time: "1:56.34", date: "1 day ago", email: "quicksolver@example.com" },
    { id: "4", opponent: "PuzzlePro", result: "win", rating_change: 8, time: "2:12.67", date: "1 day ago", email: "puzzlepro@example.com" },
    { id: "5", opponent: "CubeChamp", result: "loss", rating_change: -8, time: "4:23.45", date: "2 days ago", email: "cubechamp@example.com" },
  ]);

  useEffect(() => {
    // Fetch user profile from backend using userId taken from sessionStorage
    const loadUserProfile = async () => {
      const userId = sessionStorage.getItem("userId");

      // Defensive guard clause
      if (!userId) {
        setPlayer(null);
        return;
      }
      try {
        const res = await fetch(`/api/get_user?id=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const user = await res.json();

        setPlayer({
          player_id: user._id ?? "",
          username: user.username ?? "",
          player_state: user.player_state ?? "",
          rating: user.rating ?? 0,
          total_wins: user.total_wins ?? 0,
          win_percentage: user.win_percentage ?? 0,
          top_speed_to_solve_cube: user.top_speed_to_solve_cube ?? {},
          email: user.email ?? ""
        });
        setNewUsername(user.username ?? "");
      } catch (err) {
        setPlayer(null);
      }
    };

    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("player");
    router.push("/");
  };

  const handleSaveUsername = () => {
    if (player && newUsername.trim()) {
      const updatedPlayer = { ...player, username: newUsername.trim() };
      setPlayer(updatedPlayer);
      localStorage.setItem("player", JSON.stringify(updatedPlayer));
      setIsEditing(false);
      // TODO: Update username on backend
    }
  };

  if (!player) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading profile…</div>
      </div>
    );
  }

  const stats = {
    gamesPlayed: gameHistory.length,
    wins: gameHistory.filter((g) => g.result === "win").length,
    losses: gameHistory.filter((g) => g.result === "loss").length,
  };
  const winRate =
    stats.gamesPlayed > 0
      ? ((stats.wins / stats.gamesPlayed) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Home</span>
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600/80 px-4 py-2 text-sm font-semibold ring-1 ring-red-500/40 hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Profile Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-950 p-8 mb-8">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 p-1">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-emerald-400">
                    {(player.username?.charAt(0) || "?").toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center ring-4 ring-slate-900">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveUsername}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNewUsername(player.username || "");
                    }}
                    className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {player.username}
                  </h1>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setNewUsername(player.username || "");
                    }}
                    className="text-slate-400 hover:text-white transition"
                    title="Edit username"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              )}

              <p className="text-slate-400 text-sm mb-4">
                Player ID: <span className="text-slate-300 font-mono">{player.player_id}</span>
              </p>

              {/* Rating Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full px-5 py-2">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-2xl font-bold text-amber-400">{player.rating}</span>
                <span className="text-sm text-amber-400/80">ELO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">Games Played</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.gamesPlayed}</p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">Wins</p>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{stats.wins}</p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">Losses</p>
            </div>
            <p className="text-3xl font-bold text-red-400">{stats.losses}</p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">Win Rate</p>
            </div>
            <p className="text-3xl font-bold text-amber-400">{winRate}%</p>
          </div>
        </div>

        {/* Match History */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Match History
          </h2>

          <div className="space-y-3">
            {gameHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-slate-400">No games played yet</p>
                <p className="text-slate-500 text-sm mt-1">Start playing to see your match history</p>
              </div>
            ) : (
              gameHistory.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-800/60 bg-slate-800/20 hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-4">
                    {/* Result indicator */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      game.result === "win" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {game.result === "win" ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Game details */}
                    <div>
                      <p className="text-white font-semibold">vs {game.opponent}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-slate-400 text-sm">{game.date}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 text-sm font-mono">{game.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating change */}
                  <div className={`flex items-center gap-1 font-bold ${
                    game.rating_change > 0 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {game.rating_change > 0 ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {game.rating_change > 0 ? "+" : ""}
                    {game.rating_change}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}