'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SignupProps {
  onSignup?: (user: { email: string; username: string }) => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!username) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (username.length > 20) {
      newErrors.username = 'Username cannot be more than 20 characters';
    } else if (!usernameRegex.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers and underscores';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Here you would integrate with your auth API
      // For now, we'll simulate the signup process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();
      console.log('Data: ', data)

      if (!response.ok) {
        setErrors({ general: data.message || 'Signup failed. Please try again.' });
        setLoading(false);
        return;
      }

      if (onSignup) {
        onSignup({ email: data.user.email, username: data.user.username });
      }
      
      // Redirect to login or game page after successful signup
      router.push('/login');
    } catch (err) {
      setErrors({ general: 'Signup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      {/* Animated background cubes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="cube-bg cube-1"></div>
        <div className="cube-bg cube-2"></div>
        <div className="cube-bg cube-3"></div>
        <div className="cube-bg cube-4"></div>
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
          <h1 className="text-4xl font-bold text-white mb-2">Join the Challenge</h1>
          <p className="text-purple-200">Create your account and start solving!</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSignup} className="space-y-5">
            {errors.general && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-purple-300 focus:outline-none focus:bg-white/20 transition-all ${
                  errors.email ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-purple-400'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-300">{errors.email}</p>
              )}
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-purple-200 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-purple-300 focus:outline-none focus:bg-white/20 transition-all ${
                  errors.username ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-purple-400'
                }`}
                placeholder="speedcuber123"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-300">{errors.username}</p>
              )}
              <p className="mt-1 text-xs text-purple-300">3-20 characters, letters, numbers, and underscores only</p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-purple-300 focus:outline-none focus:bg-white/20 transition-all ${
                  errors.password ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-purple-400'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-300">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-200 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-purple-300 focus:outline-none focus:bg-white/20 transition-all ${
                  errors.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-purple-400'
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-300">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Already have account */}
          <div className="mt-6 text-center">
            <p className="text-purple-200 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="text-white hover:text-purple-100 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-4 text-center">
            <p className="text-purple-300 text-xs">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-purple-200 hover:text-white transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-purple-200 hover:text-white transition-colors">
                Privacy Policy
              </a>
            </p>
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

        .cube-4 {
          top: 50%;
          right: 10%;
          animation-delay: -10s;
          animation-duration: 22s;
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

export default Signup;