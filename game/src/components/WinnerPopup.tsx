import { Player } from '@/modals/player';

interface PopUpProps {
    isOpen: boolean;
    onClose: () => void;
    winner: Player;
    loser: Player;
}

export default function WinnerPopup({ isOpen, onClose, winner, loser }: PopUpProps) {
    if (!isOpen) return null;
  
    const winnerData = winner || {
      name: "guest-dec3c0",
      score: 1208,
      time: "2:45"
    };
  
    const loserData = loser || {
      name: "GangGang",
      score: 992,
      time: "2:45"
    };
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
        
        {/* Popup content */}
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
          
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-10 relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Trophy icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
                </svg>
              </div>
            </div>
  
            {/* Winner title */}
            <h2 className="text-3xl font-bold text-white text-center">
              Victory!
            </h2>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            
            {/* Winner section */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-2xl">👑</span>
                <h3 className="text-lg font-semibold text-gray-700">Winner</h3>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
                <p className="text-2xl font-bold text-gray-900 text-center mb-4">
                  {winnerData.username}
                </p>
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Score</p>
                    <p className="text-3xl font-bold text-emerald-600">{winnerData.rating}</p>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">VS</span>
              </div>
            </div>

            {/* Loser section */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                <p className="text-xl font-semibold text-gray-700 text-center mb-4">
                  {loserData.username}
                </p>
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Score</p>
                    <p className="text-3xl font-bold text-gray-700">{loserData.rating}</p>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Action button */}
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              Play Again
            </button>
          </div>
        </div>
  
        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }

          .animate-slide-up {
            animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}</style>
      </div>
    );
}