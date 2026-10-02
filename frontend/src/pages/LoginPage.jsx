import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  KeyRound, 
  CheckCircle2, 
  Sparkles,
  AlertCircle,
  Zap,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillDemo = () => {
    setEmail('admin@securesms.local');
    setPassword('AdminSecure@123456');
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden cyber-grid">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-3xl bg-navy-900/90 border border-teal-500/30 shadow-xl shadow-teal-500/10 text-teal-400 mb-2">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            Administrator Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Authenticate to access the Secure SMS Delivery Control Center
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border-slate-800 relative overflow-hidden hologram-card">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-violet-500" />

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-slide-up">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4 text-teal-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@securesms.local"
                  className="glass-input w-full pl-10 text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Admin Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4 text-teal-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="glass-input w-full pl-10 pr-10 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-sm font-bold shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Demo Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="bg-navy-950/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                  Default Demo Credentials
                </span>
                <button
                  type="button"
                  onClick={handleAutofillDemo}
                  className="text-[11px] font-semibold text-teal-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3 h-3 text-teal-300" />
                  <span>Auto Fill</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-400 space-y-0.5 pt-1">
                <div><span className="text-slate-500">Email:</span> <strong className="text-slate-300">admin@securesms.local</strong></div>
                <div><span className="text-slate-500">Pass:</span> <strong className="text-slate-300">AdminSecure@123456</strong></div>
              </div>
            </div>
          </div>

        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
            256-bit CSPRNG
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
            JWT Bearer
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
            Rate Limited
          </span>
        </div>

      </div>
    </div>
  );
}
