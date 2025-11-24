import { Player } from '@/modals/player';
import { X, Trophy, Medal, ArrowRight, RotateCcw } from 'lucide-react';

interface PopUpProps {
  isOpen: boolean;
  onClose: () => void;
  winner: Player;
  loser: Player;
}

export default function WinnerPopup({ isOpen, onClose, winner, loser }: PopUpProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-500/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header Gradient */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-violet-500 to-fuchsia-600" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative px-6 pb-8 pt-12 text-center">
          {/* Trophy Circle */}
          <div className="mx-auto w-24 h-24 bg-white rounded-full p-1 shadow-xl mb-4 flex items-center justify-center">
             <div className="w-full h-full bg-amber-50 rounded-full flex items-center justify-center border-4 border-amber-100">
               <Trophy className="w-10 h-10 text-amber-500 fill-amber-500" />
             </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Game Over</h2>
          <p className="text-gray-500 text-sm mb-8">Here are the final results</p>

          {/* Comparison View */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mb-8">
            
            {/* Winner Side */}
            <div className="flex flex-col items-center p-3 bg-amber-50 rounded-2xl border border-amber-100">
              <Medal className="w-6 h-6 text-amber-500 mb-2" />
              <span className="font-bold text-gray-900 truncate w-full text-center">{winner.username}</span>
              <span className="text-xs text-amber-600 font-medium bg-amber-100 px-2 py-0.5 rounded-full mt-1">
                {winner.rating}
              </span>
            </div>

            <div className="text-gray-300 font-bold text-sm">VS</div>

            {/* Loser Side */}
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-6 h-6 rounded-full bg-gray-200 mb-2" />
              <span className="font-medium text-gray-600 truncate w-full text-center">{loser.username}</span>
              <span className="text-xs text-gray-500 mt-1">
                {loser.rating}
              </span>
            </div>
          </div>

          {/* Primary Button */}
          <button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}