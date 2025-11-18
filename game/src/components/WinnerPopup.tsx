import { Player } from '@/modals/player';
import { X, Trophy } from 'lucide-react';

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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Game Over
          </h2>

          <div className="space-y-3 mb-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm text-emerald-700 font-medium mb-1">Winner</p>
                  <p className="text-lg font-bold text-gray-900">{winner.username}</p>
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {winner.rating}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm text-gray-600 font-medium mb-1">Player 2</p>
                  <p className="text-lg font-semibold text-gray-700">{loser.username}</p>
                </div>
                <div className="text-2xl font-bold text-gray-600">
                  {loser.rating}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
