'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginProps {
  onLogin?: (user: { email?: string; isGuest?: boolean }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUpButtonClick = () => {
    router.push("/signup")
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Here you would integrate with your auth API
      // For now, we'll simulate the auth process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onLogin) {
        onLogin({ email });
      }
      router.push('/game');
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Here you would integrate with Google OAuth
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onLogin) {
        onLogin({ email: 'google-user@example.com' });
      }
      router.push('/game');
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onLogin) {
        onLogin({ isGuest: true });
      }
      router.push('/game');
    } catch (err) {
      setError('Failed to continue as guest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      {/* Animated background cubes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="cube-bg cube-1"></div>
        <div className="cube-bg cube-2"></div>
        <div className="cube-bg cube-3"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <div className="w-16 h-16 relative">
              <div className="rubik-cube-icon">
                <div className="face front"></div>
                <div className="face back"></div>
                <div className="face right"></div>
                <div className="face left"></div>
                <div className="face top"></div>
                <div className="face bottom"></div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Rubik's Cube Solver</h1>
          <p className="text-purple-200">{isSignUp ? 'Create your account' : 'Welcome back!'}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleEmailAuth} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-200 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all"
                  placeholder="••••••••"
                  required={isSignUp}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-purple-200">Or continue with</span>
            </div>
          </div>

          {/* OAuth and Guest Options */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              Continue as Guest
            </button>
          </div>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                handleSignUpButtonClick()
              }}
              className="text-purple-200 hover:text-white text-sm transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cube-bg {
          position: absolute;
          width: 60px;
          height: 60px;
          transform-style: preserve-3d;
          animation: rotate 20s infinite linear;
          opacity: 0.1;
        }

        .cube-1 {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .cube-2 {
          top: 70%;
          right: 15%;
          animation-delay: -7s;
          animation-duration: 25s;
        }

        .cube-3 {
          bottom: 20%;
          left: 20%;
          animation-delay: -14s;
          animation-duration: 30s;
        }

        .rubik-cube-icon {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: rotate 3s infinite linear;
        }

        .face {
          position: absolute;
          width: 64px;
          height: 64px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
        }

        .front {
          background: linear-gradient(45deg, #ff6b6b 0%, #ff6b6b 33%, #4ecdc4 33%, #4ecdc4 66%, #ffe66d 66%);
          transform: translateZ(32px);
        }

        .back {
          background: linear-gradient(45deg, #4ecdc4 0%, #4ecdc4 33%, #ffe66d 33%, #ffe66d 66%, #ff6b6b 66%);
          transform: rotateY(180deg) translateZ(32px);
        }

        .right {
          background: linear-gradient(45deg, #ffe66d 0%, #ffe66d 33%, #ff6b6b 33%, #ff6b6b 66%, #4ecdc4 66%);
          transform: rotateY(90deg) translateZ(32px);
        }

        .left {
          background: linear-gradient(45deg, #ff6b6b 0%, #ff6b6b 33%, #ffe66d 33%, #ffe66d 66%, #4ecdc4 66%);
          transform: rotateY(-90deg) translateZ(32px);
        }

        .top {
          background: linear-gradient(45deg, #4ecdc4 0%, #4ecdc4 33%, #ff6b6b 33%, #ff6b6b 66%, #ffe66d 66%);
          transform: rotateX(90deg) translateZ(32px);
        }

        .bottom {
          background: linear-gradient(45deg, #ffe66d 0%, #ffe66d 33%, #4ecdc4 33%, #4ecdc4 66%, #ff6b6b 66%);
          transform: rotateX(-90deg) translateZ(32px);
        }

        @keyframes rotate {
          from {
            transform: rotateX(0deg) rotateY(0deg);
          }
          to {
            transform: rotateX(360deg) rotateY(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;