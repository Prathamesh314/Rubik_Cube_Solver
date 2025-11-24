'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  User, 
  ArrowRight 
} from 'lucide-react';

interface LoginProps {
  onLogin?: (user: { email?: string; isGuest?: boolean }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI-Only State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  const handleSignUpButtonClick = () => {
    router.push("/signup");
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

    try {
      // Call the login API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.success) {
        const userData = {
          token: data.token,
          userId: data.user.id,
          username: data.user.username,
          email: data.user.email,
        };

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('userId', userData.userId);
          sessionStorage.setItem('username', userData.username);
          sessionStorage.setItem('userEmail', userData.email);
          sessionStorage.setItem('token', userData.token)
        }

        if (onLogin) {
          onLogin({ email: data.user.email });
        }

        if (email === "admin@gmail.com" && password === "admin@31415") {
          router.push('/admin');
          router.refresh();
          return
        }

        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('Google login is not yet implemented');
    setLoading(false);
    // TODO: Implement Google OAuth
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      // TODO: Implement guest login API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onLogin) {
        onLogin({ isGuest: true });
      }
      router.push('/');
    } catch (err) {
      setError('Failed to continue as guest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative flex items-center justify-center p-4 overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* --- Background Effects --- */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>

      {/* Animated background cubes (Preserved) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="cube-bg cube-1"></div>
        <div className="cube-bg cube-2"></div>
        <div className="cube-bg cube-3"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-4">
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
            Welcome Back
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Sign in to continue solving</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-white/[0.08]">
          
          <form onSubmit={handleEmailAuth} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 hover:border-white/20 transition-all duration-200"
                  placeholder="you@example.com"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
               <div className="flex justify-between items-center ml-1">
                <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 hover:border-white/20 transition-all duration-200"
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full relative overflow-hidden py-4 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-purple-900/20 mt-2"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="px-4 bg-[#13131a] text-slate-500 rounded-full">Or</span>
            </div>
          </div>

          {/* OAuth and Guest Options */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all disabled:opacity-50 transform active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-8 text-center pt-6 border-t border-white/10">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={handleSignUpButtonClick}
                disabled={loading}
                className="text-purple-400 hover:text-purple-300 font-bold transition-colors disabled:opacity-50"
              >
                Sign up
              </button>
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
          animation: floatRotate 20s infinite linear;
          opacity: 0.05;
        }

        .cube-1 { top: 10%; left: 10%; animation-duration: 25s; }
        .cube-2 { top: 70%; right: 15%; animation-duration: 30s; animation-delay: -7s; scale: 1.4; }
        .cube-3 { bottom: 20%; left: 20%; animation-duration: 35s; animation-delay: -14s; scale: 0.8; }

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
          backface-visibility: hidden;
        }

        .face { width: 80px; height: 80px; opacity: 0.95; }

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

export default Login;