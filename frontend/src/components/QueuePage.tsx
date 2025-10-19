// "use client"
// import React, { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'

// // --- SVGs for Icons ---

// const UserIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
//     <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//   </svg>
// );

// const RatingIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
//     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//   </svg>
// );

// const WinsIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
//     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//   </svg>
// );

// const WinRateIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
//         <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
//         <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
//     </svg>
// );

// interface SpeedCollection {
//   cube_category: string;
//   top_speed: number;
// }

// interface Player {
//   player_id: string;
//   username: string;
//   player_state: string;
//   rating: number;
//   total_wins: number;
//   win_percentage: number;
//   top_speed_to_solve_cube: { [key: string]: SpeedCollection };
// }

// const QueuePage = () => {
//   const router = useRouter();
//   const [player, setPlayer] = useState<Player | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [dots, setDots] = useState('');
//   const [timeInQueue, setTimeInQueue] = useState(0);

//   // Animated dots for "Searching for opponent"
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setDots(prev => prev.length >= 3 ? '' : prev + '.');
//     }, 500);
//     return () => clearInterval(interval);
//   }, []);

//   // Timer for time in queue
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeInQueue(prev => prev + 1);
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // Fetch player data
//   useEffect(() => {
//     const fetchPlayerData = async () => {
//       try {
//         const response = await fetch('/api/user/profile');
        
//         if (!response.ok) {
//           console.error('Failed to fetch player data:', response.status);
//           setLoading(false);
//           return;
//         }

//         const contentType = response.headers.get("content-type");
//         if (!contentType || !contentType.includes("application/json")) {
//           console.error('Response is not JSON');
//           setLoading(false);
//           return;
//         }

//         const data = await response.json();
        
//         if (data.success) {
//           setPlayer(data.user);
//         } else {
//           console.error('Failed to fetch player data:', data.message);
//         }
//       } catch (error) {
//         console.error('Error fetching player data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPlayerData();
//   }, []);

//   // Poll for match status
//   useEffect(() => {
//     const checkMatchStatus = setInterval(async () => {
//       try {
//         const response = await fetch('/api/game/match-status');
        
//         if (!response.ok) {
//           return; 
//         }

//         const contentType = response.headers.get("content-type");
//         if (!contentType || !contentType.includes("application/json")) {
//           return;
//         }

//         const data = await response.json();

//         if (data.success && data.room_id) {
//           router.push(`/room/${data.room_id}`);
//         }
//       } catch (error) {
//         // Silently fail for polling
//       }
//     }, 2000); 

//     return () => clearInterval(checkMatchStatus);
//   }, [router]);

//   const handleCancelQueue = async () => {
//     try {
//       const response = await fetch('/api/game/leave-queue', {
//         method: 'POST',
//       });

//       if (response.ok) {
//         router.push('/');
//       } else {
//         console.error('Failed to leave queue');
//       }
//     } catch (error) {
//       console.error('Error leaving queue:', error);
//       router.push('/');
//     }
//   };

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center">
//         <div className="text-white text-2xl">Loading...</div>
//       </div>
//     );
//   }

//   // Dummy player data for demonstration
//   const dummyPlayer = player || {
//     player_id: "demo-123",
//     username: "Cubemaster99",
//     player_state: "waiting",
//     rating: 1542,
//     total_wins: 47,
//     win_percentage: 68.5,
//     top_speed_to_solve_cube: {
//       "3x3 cube": { cube_category: "3x3 cube", top_speed: 23.5 },
//       "4x4 cube": { cube_category: "4x4 cube", top_speed: 87.2 }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
//       <div className="w-full max-w-4xl mx-auto">
        
//         <div className="text-center mb-12">
//           <h1 className="text-5xl font-bold mb-2">Searching for Opponent{dots}</h1>
//           <p className="text-gray-400 text-lg">
//             Time in queue: <span className="font-mono text-xl text-green-400">{formatTime(timeInQueue)}</span>
//           </p>
//         </div>

//         <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 {/* Player Info */}
//                 <div className="flex flex-col">
//                     <h2 className="text-2xl font-semibold mb-6 flex items-center"><UserIcon /> {dummyPlayer.username}</h2>
//                     <div className="grid grid-cols-2 gap-4">
//                         <div className="bg-gray-700 p-4 rounded-lg">
//                             <div className="flex items-center text-gray-400 text-sm mb-1"><RatingIcon /> Rating</div>
//                             <div className="text-2xl font-bold">{dummyPlayer.rating}</div>
//                         </div>
//                         <div className="bg-gray-700 p-4 rounded-lg">
//                             <div className="flex items-center text-gray-400 text-sm mb-1"><WinsIcon /> Total Wins</div>
//                             <div className="text-2xl font-bold">{dummyPlayer.total_wins}</div>
//                         </div>
//                         <div className="bg-gray-700 p-4 rounded-lg col-span-2">
//                             <div className="flex items-center text-gray-400 text-sm mb-1"><WinRateIcon /> Win Rate</div>
//                             <div className="text-2xl font-bold mb-2">{dummyPlayer.win_percentage.toFixed(1)}%</div>
//                             <div className="w-full bg-gray-600 rounded-full h-2.5">
//                                 <div className="bg-indigo-500 h-2.5 rounded-full" style={{width: `${dummyPlayer.win_percentage}%`}}></div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Best Times */}
//                 <div>
//                     <h2 className="text-2xl font-semibold mb-6">Personal Bests</h2>
//                     <div className="space-y-4">
//                         {Object.entries(dummyPlayer.top_speed_to_solve_cube).map(([key, speed]) => (
//                             <div key={key} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
//                                 <span className="text-gray-300">{speed.cube_category}</span>
//                                 <span className="font-mono text-green-400 font-bold">{speed.top_speed}s</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>

//         <div className="mt-12 text-center">
//             <button
//                 onClick={handleCancelQueue}
//                 className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105"
//             >
//                 Cancel Search
//             </button>
//         </div>

//         <div className="mt-8 text-center text-gray-500 text-sm">
//             <p>💡 Tip: While you wait, double-check your audio and video settings.</p>
//         </div>

//       </div>
//     </div>
//   )
// }

// export default QueuePage

"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function QueuePage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [msg, setMsg] = useState("Looking for an opponent...");

  const playerId = sp.get("pid");

  useEffect(() => {
    if (!playerId) return;

    let stopped = false;

    async function poll() {
      try {
        const res = await fetch(`/api/matchmake/poll?playerId=${encodeURIComponent(playerId ?? "")}`);
        const data = await res.json();
        if (stopped) return;

        if (data.status === "matched") {
          router.replace(`/room/${data.room.id}`);
        } else {
          setMsg("Still waiting…");
          setTimeout(poll, 1200);
        }
      } catch (e) {
        if (!stopped) setTimeout(poll, 1500);
      }
    }

    const t = setTimeout(poll, 600);
    return () => {
      stopped = true;
      clearTimeout(t);
    };
  }, [playerId, router]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Queue</h2>
        <p className="text-slate-300">{msg}</p>
        <p className="text-xs text-slate-500 mt-3">You’ll be redirected when matched.</p>
      </div>
    </div>
  );
}
