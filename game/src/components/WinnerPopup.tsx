"use client"
import { Player } from '@/modals/player';
import { useState } from 'react';

interface PopUpProps {
    winner: Player;
    loser: Player
}

export default function WinnerPopup(props: PopUpProps) {
  const [isOpen, setIsOpen] = useState(true);

  const winnerData = {
    name: props.winner.username,
    score: props.winner.rating,
    time: "2:45"
  };

  const loserData = {
    name: props.loser.username,
    score: props.loser.rating,
    time: "2:45"
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Popup content with parrot green gradient */}
      <div className="relative bg-gradient-to-br from-lime-400 via-green-400 to-emerald-500 rounded-2xl shadow-2xl p-8 max-w-md w-full transform animate-bounce-in">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Trophy icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 rounded-full p-4 backdrop-blur-sm">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
          </div>
        </div>

        {/* Winner text */}
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          🎉 Winner! 🎉
        </h2>
        
        {/* Winner details */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
          <p className="text-white text-center text-xl font-semibold mb-3">
            {winnerData.name}
          </p>
          <div className="flex justify-around text-white">
            <div className="text-center">
              <p className="text-sm opacity-80">Score</p>
              <p className="text-2xl font-bold">{winnerData.score}</p>
            </div>
            <div className="w-px bg-white/30"></div>
            <div className="text-center">
              <p className="text-sm opacity-80">Time</p>
              <p className="text-2xl font-bold">{winnerData.time}</p>
            </div>
          </div>
        </div>

        {/* Loser details */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
          <p className="text-white text-center text-xl font-semibold mb-3 opacity-80">
            <span className="text-red-200">Loser:</span> {loserData.name}
          </p>
          <div className="flex justify-around text-white opacity-80">
            <div className="text-center">
              <p className="text-sm">Score</p>
              <p className="text-xl font-bold">{loserData.score}</p>
            </div>
            <div className="w-px bg-white/30"></div>
            <div className="text-center">
              <p className="text-sm">Time</p>
              <p className="text-xl font-bold">{loserData.time}</p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => setIsOpen(false)}
          className="w-full bg-white text-green-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
        >
          Play Again
        </button>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
}