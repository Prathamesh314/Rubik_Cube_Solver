import React from 'react';

const Loader = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <svg
        className="animate-spin h-10 w-10 text-indigo-400 mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-30"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <div className="text-xl font-bold text-slate-100 mb-1">Waiting for Opponent…</div>
      <div className="text-slate-400 text-sm mb-2">You're the first to join. Invite an opponent to start the game!</div>
      <div className="flex items-center gap-2 mt-2">
        <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
        <span className="text-xs text-yellow-300">Waiting</span>
      </div>
    </div>
  );
};

export default Loader;