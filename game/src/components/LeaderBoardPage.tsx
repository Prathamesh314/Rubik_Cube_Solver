"use client"
import { useEffect, useState } from 'react';
import { Trophy, Crown, Medal, TrendingUp } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  rating: number;
  total_games_played: number;
  total_wins: number;
  fastest_time_to_solve_cube: number;
  user_profile?: string | null;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // FIX: Initialize as null, don't read sessionStorage yet
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    // FIX: Read sessionStorage here (this only runs in the browser)
    if (typeof window !== 'undefined') {
      setPlayerId(sessionStorage.getItem("userId"));
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/get_user'); 
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        
        const data = await response.json();

        // Sort by Rating (Descending)
        data.user.sort((a: User, b: User) => b.rating - a.rating)
        setUsers(data.user);
      } catch (err) {
        setError('Unable to load leaderboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 3. Calculate Derived Stats
  const topThree = users.slice(0, 3);
  const restOfTopFive = users.slice(3, 5);
  
  // Safe check: Ensure playerId exists before searching
  const myRankIndex = playerId 
    ? users.findIndex((u) => u.id === playerId) 
    : -1;
    
  const myData = users[myRankIndex];
  
  const getWinRate = (wins: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  if (loading) return <LeaderboardSkeleton />;
  if (error) return <div className="text-center text-red-400 p-10 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-3xl mx-auto pb-24">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl mb-4 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Trophy className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-slate-400">
            Leaderboard
          </h1>
          <p className="text-slate-400 font-medium">Global Rankings • Season 1</p>
        </div>

        {/* --- The Podium (Top 3) --- */}
        {users.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-16 items-end min-h-[280px]">
            
            {/* 2nd Place */}
            <div className="flex flex-col items-center group relative z-10">
              {topThree[1] && (
                <>
                  <div className="relative mb-4 transition-transform group-hover:-translate-y-2 duration-300">
                    <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-slate-400 flex items-center justify-center text-2xl font-bold text-slate-300 overflow-hidden shadow-lg">
                      {topThree[1].username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full border border-slate-500 shadow-lg">
                      #2
                    </div>
                  </div>
                  <div className="text-center mb-2">
                    <p className="font-bold text-slate-200 truncate max-w-[100px]">{topThree[1].username}</p>
                    <p className="text-indigo-400 text-sm font-mono font-bold">{topThree[1].rating} MMR</p>
                  </div>
                  <div className="w-full h-32 bg-gradient-to-t from-slate-800 to-slate-800/0 rounded-t-2xl border-x border-t border-slate-700/50 flex flex-col justify-end pb-4 items-center">
                    <span className="text-xs text-slate-500 font-mono">
                        {getWinRate(topThree[1].total_wins, topThree[1].total_games_played)}% WR
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center group relative z-20 -mx-2">
              {topThree[0] && (
                <>
                  <div className="relative mb-4 transition-transform group-hover:-translate-y-2 duration-300">
                    <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-bounce" />
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-yellow-500 flex items-center justify-center text-3xl font-black text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)] overflow-hidden">
                      {topThree[0].username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black text-sm font-black px-4 py-1 rounded-full shadow-lg">
                      #1
                    </div>
                  </div>
                  <div className="text-center mb-2">
                    <p className="font-black text-white text-xl truncate max-w-[140px]">{topThree[0].username}</p>
                    <p className="text-yellow-400 text-lg font-mono font-bold">{topThree[0].rating} MMR</p>
                  </div>
                  <div className="w-full h-44 bg-gradient-to-t from-yellow-500/20 via-yellow-500/5 to-transparent rounded-t-2xl border-x border-t border-yellow-500/30 relative overflow-hidden flex flex-col justify-end pb-4 items-center backdrop-blur-sm">
                     <div className="absolute inset-0 bg-yellow-400/10 blur-xl" />
                     <span className="relative z-10 text-xs text-yellow-200/70 font-mono font-bold">
                        {getWinRate(topThree[0].total_wins, topThree[0].total_games_played)}% WR
                     </span>
                  </div>
                </>
              )}
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center group relative z-10">
              {topThree[2] && (
                <>
                  <div className="relative mb-4 transition-transform group-hover:-translate-y-2 duration-300">
                    <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-amber-700 flex items-center justify-center text-2xl font-bold text-amber-700 overflow-hidden shadow-lg">
                      {topThree[2].username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-800 text-amber-100 text-xs font-bold px-3 py-1 rounded-full border border-amber-700 shadow-lg">
                      #3
                    </div>
                  </div>
                  <div className="text-center mb-2">
                    <p className="font-bold text-slate-200 truncate max-w-[100px]">{topThree[2].username}</p>
                    <p className="text-amber-600 text-sm font-mono font-bold">{topThree[2].rating} MMR</p>
                  </div>
                  <div className="w-full h-24 bg-gradient-to-t from-amber-900/30 to-amber-900/0 rounded-t-2xl border-x border-t border-amber-800/50 flex flex-col justify-end pb-4 items-center">
                    <span className="text-xs text-slate-500 font-mono">
                        {getWinRate(topThree[2].total_wins, topThree[2].total_games_played)}% WR
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* --- The List (Rank 4+) --- */}
        <div className="space-y-3">
          <div className="flex justify-between px-6 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
            <span>Player</span>
            <div className="flex gap-8">
                <span>Wins</span>
                <span className="w-12 text-right">Rating</span>
            </div>
          </div>

          {restOfTopFive.map((user, index) => (
            <div 
              key={user.id} 
              className="group flex items-center justify-between p-4 bg-slate-900/80 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-8 h-8 text-slate-600 font-black text-lg group-hover:text-indigo-400 transition-colors">
                  #{index + 4}
                </span>
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                    {user.username.slice(0, 2).toUpperCase()}
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{user.username}</span>
                    <span className="text-xs text-slate-500">{user.total_games_played} Games Played</span>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-1.5 text-emerald-500/80">
                    <Medal className="w-4 h-4" />
                    <span className="font-mono font-bold">{user.total_wins}</span>
                </div>
                <span className="w-12 text-right font-mono font-bold text-indigo-400 text-lg">
                    {user.rating}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* --- Sticky Current User Footer --- */}
        {myData && (
          <div className="fixed bottom-6 left-0 right-0 px-4 z-50 animate-in slide-in-from-bottom-20 duration-700 delay-500">
            <div className="max-w-3xl mx-auto">
              <div className="relative bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-4 shadow-2xl shadow-black/50 flex items-center justify-between overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                <div className="absolute -left-10 top-0 w-20 h-full bg-indigo-500/20 blur-xl" />

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <span className="text-[10px] text-indigo-300 font-bold uppercase">Rank</span>
                    <span className="text-lg font-black text-indigo-400 leading-none">{myRankIndex + 1}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">You ({myData.username})</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        {getWinRate(myData.total_wins, myData.total_games_played)}% Win Rate
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-xs text-slate-500 uppercase font-bold">Wins</span>
                        <span className="font-mono font-bold text-emerald-400">{myData.total_wins}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-0.5">Rating</p>
                        <p className="font-mono font-black text-2xl text-indigo-400 leading-none">
                        {myData.rating}
                        </p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton Loader
function LeaderboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 max-w-3xl mx-auto flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full animate-pulse mb-4" />
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse mb-12" />
        
        <div className="grid grid-cols-3 gap-4 w-full h-[200px] items-end mb-12">
            <div className="h-32 bg-slate-800/50 rounded-t-xl animate-pulse" />
            <div className="h-48 bg-slate-800/50 rounded-t-xl animate-pulse" />
            <div className="h-24 bg-slate-800/50 rounded-t-xl animate-pulse" />
        </div>
        
        <div className="w-full space-y-3">
            {[1,2,3].map(i => (
                <div key={i} className="h-20 bg-slate-800/30 rounded-xl animate-pulse border border-slate-800" />
            ))}
        </div>
    </div>
  );
}