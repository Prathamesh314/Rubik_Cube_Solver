import { Player } from '@/modals/player';

interface PopUpProps {
    isOpen: boolean;
    onClose: () => void;
    winner: Player;
    loser: Player;
}

export default function WinnerPopup({ isOpen, onClose, winner, loser }: PopUpProps) {
    if (!isOpen) return null;
  
    // Example data - replace with your actual props
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
        {/* Blurred backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />
        
        {/* Popup content */}
        <div className="relative bg-gradient-to-br from-lime-400 via-emerald-400 to-teal-400 rounded-3xl shadow-2xl p-8 max-w-md w-full transform animate-bounce-in">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-white/80 transition-colors z-10"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
  
          {/* Chef hat icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/30 rounded-full p-6 backdrop-blur-sm">
              <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C9.243 2 7 4.243 7 7v1c-1.654 0-3 1.346-3 3v2c0 1.654 1.346 3 3 3v5c0 1.103.897 2 2 2h8c1.103 0 2-.897 2-2v-5c1.654 0 3-1.346 3-3v-2c0-1.654-1.346-3-3-3V7c0-2.757-2.243-5-5-5zm6 9v2c0 .551-.449 1-1 1h-1v7H8v-7H7c-.551 0-1-.449-1-1v-2c0-.551.449-1 1-1h1V7c0-1.654 1.346-3 3-3s3 1.346 3 3v2h1c.551 0 1 .449 1 1z"/>
              </svg>
            </div>
          </div>
  
          {/* Winner text */}
          <h2 className="text-4xl font-bold text-white text-center mb-8">
            🎉 Winner! 🎉
          </h2>
          
          {/* Winner details */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-4">
            <p className="text-white text-center text-2xl font-bold mb-4">
              {winnerData.username}
            </p>
            
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-white/80 text-sm mb-1">Score</p>
                <p className="text-white text-3xl font-bold">{winnerData.rating}</p>
              </div>
              <div className="text-center">
                <p className="text-white/80 text-sm mb-1">Time</p>
                {/* <p className="text-white text-3xl font-bold">{winnerData.time}</p> */}
              </div>
            </div>
          </div>
  
          {/* Loser details */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <p className="text-white text-center text-xl font-bold mb-4">
              Loser: {loserData.username}
            </p>
            
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-white/80 text-sm mb-1">Score</p>
                <p className="text-white text-3xl font-bold">{loserData.rating}</p>
              </div>
              <div className="text-center">
                <p className="text-white/80 text-sm mb-1">Time</p>
                {/* <p className="text-white text-3xl font-bold">{loserData.time}</p> */}
              </div>
            </div>
          </div>
  
          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full bg-white text-emerald-600 font-bold py-4 px-6 rounded-2xl hover:bg-gray-100 transition-all transform hover:scale-[1.02] shadow-lg text-lg"
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