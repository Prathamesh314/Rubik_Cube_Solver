"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

// A sleek, modern SVG icon for the Rubik's Cube
const CubeIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 md:w-32 md:h-32 text-white">
    <path d="M32 2L2 17L32 32L62 17L32 2Z" fill="#0051BA"/> {/* Blue */}
    <path d="M2 17L2 47L32 62L32 32L2 17Z" fill="#FFD500"/> {/* Yellow */}
    <path d="M62 17L62 47L32 62L32 32L62 17Z" fill="#FF5800"/> {/* Orange */}
    <path d="M32 32L2 47L32 62" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <path d="M32 32L62 47" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <path d="M2 17L32 32" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <path d="M62 17L32 32" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <path d="M32 2V32" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
  </svg>
);


const LandingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleStartGame = async () => {
    setLoading(true);
    // The API call logic remains the same.
    // For now, it will navigate directly to the queue page.
    router.push('/queue');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* Subtle background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-96 h-96 bg-indigo-900 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 text-center space-y-8 max-w-4xl w-full">
        
        {/* Animated Cube Icon */}
        <div className="flex justify-center animate-fadeInUp">
          <div className="relative w-32 h-32 flex items-center justify-center">
             {/* Adding a subtle spinning animation to the icon container */}
            <div className="animate-[spin_20s_linear_infinite]">
              <CubeIcon />
            </div>
          </div>
        </div>
        
        {/* Titles */}
        <div className="space-y-2 animate-fadeInUp animation-delay-200">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
            Cube Clash
          </h1>
          <h2 className="text-xl md:text-2xl font-medium text-indigo-300">
            The Ultimate Multiplayer Showdown
          </h2>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto animate-fadeInUp animation-delay-400">
          Challenge players worldwide in a real-time, head-to-head cube-solving competition. Sharpen your skills and climb the ranks.
        </p>

        {/* Start button */}
        <div className="pt-8 animate-fadeInUp animation-delay-600">
          <button
            onClick={handleStartGame}
            disabled={loading}
            className={`
              px-10 py-4 text-xl font-semibold rounded-lg
              transform transition-all duration-300 ease-in-out
              ${loading 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-105 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50'
              }
              text-white shadow-lg
            `}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Joining Match...
              </span>
            ) : (
              'Find Match'
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-slate-500 text-sm">
        <p>May the fastest solver win!</p>
      </div>
    </div>
  )
}

export default LandingPage