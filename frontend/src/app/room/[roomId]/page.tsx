"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// --- SVG Icons ---

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

const CopyIcon = ({className = "w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);


// --- Main Component ---

const RoomPage = () => {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState<any>(null); // Replace 'any' with a proper type
  const [isCopied, setIsCopied] = useState(false);

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchRoomData = async () => {
      // Data fetching logic remains the same
      setLoading(false); // For demo purposes, we'll just stop loading.
    };
    if (roomId) fetchRoomData();
  }, [roomId, router]);
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(roomId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-semibold">Loading Room...</div>
      </div>
    );
  }

  // Dummy data for players
  const player1 = roomData?.players?.[0] || { username: 'Player One', rating: 1580 };
  const player2 = roomData?.players?.[1] || null;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans">
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
              <button onClick={handleCopyToClipboard} className="p-2 bg-slate-700 hover:bg-indigo-600 transition-colors rounded-r-md">
                {isCopied ? <span className="text-xs px-1">Copied!</span> : <CopyIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* Player Matchup Area */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center mb-12">
          {/* Player 1 Card */}
          <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 text-center animate-fadeInUp">
            <div className="flex flex-col items-center">
              <div className="bg-slate-700 rounded-full p-4 mb-4">
                <UserIcon className="w-12 h-12 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold">{player1.username}</h2>
              <p className="text-yellow-400 font-semibold">Rating: {player1.rating}</p>
            </div>
          </div>

          {/* VS Separator */}
          <div className="text-center">
            <p className="text-4xl md:text-6xl font-black text-slate-600 animate-pulse">VS</p>
          </div>

          {/* Player 2 Card */}
          <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 text-center animate-fadeInUp animation-delay-200">
            {player2 ? (
              <div className="flex flex-col items-center">
                <div className="bg-slate-700 rounded-full p-4 mb-4">
                  <UserIcon className="w-12 h-12 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold">{player2.username}</h2>
                <p className="text-yellow-400 font-semibold">Rating: {player2.rating}</p>
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
        
        {/* Game Status & Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Status */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 text-white">Game Status</h3>
                <p className="text-2xl font-bold text-green-400">Game starting soon...</p>
                <p className="text-slate-400 mt-2">Both players are connected. Prepare for the match!</p>
            </div>

            {/* Rules */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4 text-white">Game Rules</h3>
              <ul className="space-y-3">
                <li className="flex items-center"><ClockIcon /><span className="ml-3 text-slate-300">Solve the Rubik's Cube as fast as possible.</span></li>
                <li className="flex items-center"><TrophyIcon /><span className="ml-3 text-slate-300">The first player to solve wins the match.</span></li>
                <li className="flex items-center"><ChartIcon /><span className="ml-3 text-slate-300">Your rating will be updated based on the result.</span></li>
              </ul>
            </div>
        </div>

        {/* Leave Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => router.push('/')}
            className="bg-red-600/80 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoomPage