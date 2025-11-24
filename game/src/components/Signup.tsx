'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  User, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

interface SignupProps {
  onSignup?: (user: { email: string; username: string }) => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // UI-only state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || 'Signup failed. Please try again.' });
        setLoading(false);
        return;
      }

      if (onSignup) {
        onSignup({ email: data.user.email, username: data.user.username });
      }
      
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
    <div className="min-h-screen bg-[#0a0a0f] relative flex items-center justify-center p-4 overflow-hidden font-sans">
      
      {/* --- Modern Background Effects --- */}
      {/* Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>

      {/* Floating Cubes (Preserved but styled) */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="cube-bg cube-1"></div>
         <div className="cube-bg cube-2"></div>
         <div className="cube-bg cube-3"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        
        {/* Logo Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-4">
            {/* Glow behind logo */}
            <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-40 rounded-full"></div>
            <div className="rubik-cube-icon relative z-10">
                <div className="face front"></div>
                <div className="face back"></div>
                <div className="face right"></div>
                <div className="face left"></div>
                <div className="face top"></div>
                <div className="face bottom"></div>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            Join the Challenge
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Master the cube. Beat the clock.</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-white/[0.08]">
          
          {/* Global Error */}
          {errors.general && (
            <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-500 group-focus-within:text-purple-400'}`} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
                      : 'border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 hover:border-white/20'
                  }`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
            </div>

            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 transition-colors ${errors.username ? 'text-red-400' : 'text-slate-500 group-focus-within:text-purple-400'}`} />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all duration-200 ${
                    errors.username
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
                      : 'border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 hover:border-white/20'
                  }`}
                  placeholder="speedcuber123"
                />
              </div>
              {errors.username ? (
                <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.username}</p>
              ) : (
                <p className="text-slate-500 text-[10px] ml-1">Letters, numbers & underscores only</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-500 group-focus-within:text-purple-400'}`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-11 pr-12 py-3.5 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all duration-200 ${
                    errors.password
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
                      : 'border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 hover:border-white/20'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CheckCircle2 className={`h-5 w-5 transition-colors ${errors.confirmPassword ? 'text-red-400' : 'text-slate-500 group-focus-within:text-purple-400'}`} />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all duration-200 ${
                    errors.confirmPassword
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
                      : 'border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 hover:border-white/20'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full relative overflow-hidden py-4 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-purple-900/20 mt-4"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              {/* Button Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 space-y-4 text-center border-t border-white/10 pt-6">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
            
            <div className="flex justify-center gap-4 text-xs text-slate-500">
                <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
                <span>•</span>
                <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cube-bg {
          position: absolute;
          width: 60px;
          height: 60px;
          transform-style: preserve-3d;
          animation: floatRotate 20s infinite linear;
          opacity: 0.05;
        }

        .cube-1 { top: 15%; left: 10%; animation-duration: 25s; }
        .cube-2 { top: 75%; right: 10%; animation-duration: 30s; animation-delay: -5s; scale: 1.5; }
        .cube-3 { bottom: 20%; left: 15%; animation-duration: 35s; animation-delay: -10s; scale: 0.8; }

        .rubik-cube-icon {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: spin 4s infinite linear;
        }

        .face {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: inset 0 0 15px rgba(0,0,0,0.2);
          backface-visibility: hidden; /* Makes it look solid */
        }

        /* Using CSS variables for size calc would be cleaner, but keeping hardcoded for safety given constraint */
        .face { width: 80px; height: 80px; opacity: 0.9; }

        .front  { background: #ef4444; transform: translateZ(40px); }
        .back   { background: #f97316; transform: rotateY(180deg) translateZ(40px); }
        .right  { background: #22c55e; transform: rotateY(90deg) translateZ(40px); }
        .left   { background: #3b82f6; transform: rotateY(-90deg) translateZ(40px); }
        .top    { background: #eab308; transform: rotateX(90deg) translateZ(40px); }
        .bottom { background: #ffffff; transform: rotateX(-90deg) translateZ(40px); }

        @keyframes spin {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }

        @keyframes floatRotate {
          0% { transform: rotateX(0deg) rotateY(0deg) translateY(0px); }
          50% { transform: rotateX(180deg) rotateY(180deg) translateY(-20px); }
          100% { transform: rotateX(360deg) rotateY(360deg) translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default Signup;