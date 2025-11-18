"use client"
import React, { useRef, useState, useEffect } from 'react'
import RubiksCubeViewer, { RubiksCubeViewerHandle } from '@/components/RubiksCubeViewer'
import { CubeCategories, Player, PlayerState } from '@/modals/player'
import { Room } from '@/modals/room'
import { useRouter } from 'next/navigation'

const TutorialPage = () => {
  const cubeRef = useRef<RubiksCubeViewerHandle>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const router = useRouter()

  // Dummy scrambled cube for demonstration (6 faces, each 3x3)
  const demoScrambled: number[][][] = [
    [[6, 1, 3], [2, 6, 1], [5, 3, 6]], // Back
    [[4, 1, 2], [1, 4, 6], [3, 4, 2]], // Up
    [[2, 2, 5], [6, 3, 3], [4, 5, 2]], // Front
    [[4, 3, 4], [1, 6, 3], [6, 6, 4]], // Down
    [[5, 5, 1], [3, 5, 4], [1, 2, 5]], // Left
    [[3, 4, 6], [5, 2, 5], [2, 1, 3]], // Right
  ];

  const handlePlayClick =() => {
    router.push("/")
  }

  // Create dummy player
  const dummyPlayer = {
    player_id: 'tutorial-player-1',
    username: 'Tutorial Player',
    player_state: PlayerState.Playing,
    rating: 0,
    total_wins: 0,
    win_percentage: 0,
    top_speed_to_solve_cube: {},
    scrambledCube: demoScrambled,
  };

  // Create dummy room
  const dummyRoom: Room = {
    id: 'tutorial-player-1',
    players: [dummyPlayer as Player],
    maxPlayers: 1,
    gameState: {},
    initialState: demoScrambled,
    variant: CubeCategories.ThreeCube,
    createdAt: Date.now(),
  };

  // Auto-advance animation steps - stops at the end
  useEffect(() => {
    if (isCompleted) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 3) {
          setIsCompleted(true);
          return 3;
        }
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isCompleted]);

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    if (step < 3) {
      setIsCompleted(false);
    }
  };

  const restartTutorial = () => {
    setCurrentStep(0);
    setIsCompleted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            Rubik's Cube Tutorial
          </h1>
          <p className="text-xl text-gray-300">
            {isCompleted ? '✅ Tutorial Complete!' : 'Follow the animations to learn controls'}
          </p>
        </div>

        {/* Interactive Cube Section with Animations */}
        <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
          
          <RubiksCubeViewer
            ref={cubeRef}
            container={null}
            cube_options={{
              controlsEnabled: true,
            }}
            wsRef={null}
            player={dummyPlayer as Player}
            room={dummyRoom}
            participants={[dummyPlayer as Player]}
          />

          {/* Tutorial Complete Overlay */}
          {isCompleted && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-fade-in">
              <div className="text-center">
                <div className="text-8xl mb-6 animate-bounce">🎉</div>
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Tutorial Complete!
                </h2>
                <p className="text-xl text-gray-300 mb-6">You're ready to start solving!</p>
                <button
                  onClick={restartTutorial}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform transition hover:scale-105"
                >
                  🔄 Restart Tutorial
                </button>
              </div>
            </div>
          )}

          {/* Animated Mouse Cursor - Left Drag */}
          {currentStep === 0 && !isCompleted && (
            <>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="relative">
                  {/* Animated Cursor */}
                  <div className="absolute animate-drag-left">
                    <svg className="w-8 h-8 text-blue-400 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.64 21.97c-.16-.02-.3-.16-.39-.31l-3.14-6.21-4.92 1.64c-.18.06-.39 0-.53-.14-.14-.14-.19-.35-.13-.53l4.38-13.08c.06-.18.24-.3.43-.3.19 0 .37.12.43.3l4.38 13.08c.06.18.01.39-.13.53-.14.14-.35.19-.53.13l-4.92-1.64.94 6.42c.02.16-.05.33-.18.43-.12.09-.29.12-.44.09z"/>
                    </svg>
                  </div>
                  
                  {/* Drag Trail Effect */}
                  <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-blue-500 to-transparent animate-trail"></div>
                </div>
              </div>

              {/* Instruction Badge */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-2xl animate-bounce">
                🖱️ Hold Left Click & Drag to Rotate View
              </div>

              {/* Circular Motion Indicator */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-40 h-40 border-4 border-blue-400 border-dashed rounded-full animate-spin-slow opacity-50"></div>
              </div>
            </>
          )}

          {/* Animated Scroll Zoom */}
          {currentStep === 1 && !isCompleted && (
            <>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                {/* Mouse with Scroll Animation */}
                <div className="relative">
                  <svg className="w-12 h-16 text-purple-400 drop-shadow-lg animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="8" y="4" width="8" height="14" rx="4" />
                    <circle cx="12" cy="9" r="1.5" fill="currentColor" className="animate-scroll-wheel" />
                  </svg>
                </div>
              </div>

              {/* Zoom In/Out Arrows */}
              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
                <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 animate-bounce-slow animation-delay-500">
                <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              {/* Instruction Badge */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-2xl animate-bounce">
                🔍 Scroll to Zoom In/Out
              </div>
            </>
          )}

          {/* Animated Keyboard Press - Upper Face */}
          {currentStep === 2 && !isCompleted && (
            <>
              {/* Keyboard Key Animation */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-none">
                <div className="relative">
                  {/* Animated Key */}
                  <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-bold text-4xl w-20 h-20 rounded-lg shadow-2xl flex items-center justify-center border-4 border-yellow-200 animate-key-press">
                    U
                  </div>
                  
                  {/* Press Down Indicator */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <svg className="w-8 h-8 text-yellow-400 animate-bounce" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Rotation Arrow on Cube */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-20">
                <div className="relative w-32 h-32 animate-spin-slow">
                  <svg className="w-full h-full text-yellow-400 drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 100 100">
                    <path d="M 50 10 A 40 40 0 1 1 49.9 10" strokeLinecap="round" markerEnd="url(#arrowhead)" />
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
                      </marker>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Instruction Badge */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-full font-bold text-lg shadow-2xl animate-pulse">
                ⌨️ Press U to Rotate Upper Face
              </div>
            </>
          )}

          {/* Animated Keyboard with Shift */}
          {currentStep === 3 && !isCompleted && (
            <>
              {/* Shift Key */}
              <div className="absolute top-20 left-1/3 transform -translate-x-1/2 pointer-events-none">
                <div className="bg-gradient-to-b from-gray-400 to-gray-600 text-white font-bold text-2xl px-6 h-20 rounded-lg shadow-2xl flex items-center justify-center border-4 border-gray-200 animate-key-press">
                  Shift
                </div>
              </div>

              {/* Plus Sign */}
              <div className="absolute top-28 left-1/2 transform -translate-x-1/2 text-white text-5xl font-bold animate-pulse">
                +
              </div>

              {/* R Key */}
              <div className="absolute top-20 right-1/3 transform translate-x-1/2 pointer-events-none animation-delay-200">
                <div className="bg-gradient-to-b from-red-400 to-red-600 text-white font-bold text-4xl w-20 h-20 rounded-lg shadow-2xl flex items-center justify-center border-4 border-red-200 animate-key-press">
                  R
                </div>
              </div>

              {/* Counter-Clockwise Arrow */}
              <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2">
                <div className="relative w-32 h-32 animate-spin-reverse">
                  <svg className="w-full h-full text-red-400 drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 100 100">
                    <path d="M 50 10 A 40 40 0 1 0 49.9 10" strokeLinecap="round" markerEnd="url(#arrowhead2)" />
                    <defs>
                      <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
                      </marker>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Instruction Badge */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-2xl animate-pulse">
                ⌨️ Shift + R for Counter-Clockwise
              </div>
            </>
          )}
        </div>

        {/* Face Guide with Animations */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          {[
            { key: 'U', color: 'bg-yellow-500', label: 'Up', glow: 'shadow-yellow-500/50' },
            { key: 'D', color: 'bg-white', label: 'Down', glow: 'shadow-white/50', textColor: 'text-black' },
            { key: 'F', color: 'bg-blue-500', label: 'Front', glow: 'shadow-blue-500/50' },
            { key: 'B', color: 'bg-green-500', label: 'Back', glow: 'shadow-green-500/50' },
            { key: 'L', color: 'bg-orange-500', label: 'Left', glow: 'shadow-orange-500/50' },
            { key: 'R', color: 'bg-red-500', label: 'Right', glow: 'shadow-red-500/50' },
          ].map((face, index) => (
            <div
              key={face.key}
              className={`${face.color} ${face.glow} ${face.textColor || 'text-white'} rounded-xl p-6 text-center font-bold text-2xl shadow-lg transform transition-all hover:scale-110 cursor-pointer animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-2">{face.key}</div>
              <div className="text-sm">{face.label}</div>
            </div>
          ))}
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map((step) => (
            <button
              key={step}
              onClick={() => handleStepClick(step)}
              className={`w-4 h-4 rounded-full transition-all ${
                currentStep === step 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 w-12' 
                  : currentStep > step
                  ? 'bg-green-500'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              title={`Step ${step + 1}`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="text-center flex gap-4 justify-center">
          {!isCompleted && (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 3))}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform transition hover:scale-105"
            >
              Next Step →
            </button>
          )}
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg transform transition hover:scale-110 animate-pulse" onClick={handlePlayClick}>
            Start Playing! 🎮
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes drag-left {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-80px, 20px); }
        }
        @keyframes trail {
          0% { opacity: 0; transform: translateX(-100px); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateX(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes key-press {
          0%, 100% { transform: translateY(0); box-shadow: 0 6px 0 rgba(0,0,0,0.3); }
          50% { transform: translateY(4px); box-shadow: 0 2px 0 rgba(0,0,0,0.3); }
        }
        @keyframes scroll-wheel {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-drag-left {
          animation: drag-left 3s ease-in-out infinite;
        }
        .animate-trail {
          animation: trail 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }
        .animate-key-press {
          animation: key-press 1s ease-in-out infinite;
        }
        .animate-scroll-wheel {
          animation: scroll-wheel 1.5s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-500 {
          animation-delay: 500ms;
        }
      `}</style>
    </div>
  );
}

export default TutorialPage;