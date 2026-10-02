import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Send, 
  History, 
  Network, 
  LogOut, 
  Sun, 
  Moon, 
  Radio, 
  Smartphone, 
  KeyRound,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';

export default function Navbar({ onOpenSimulator }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [systemInfo, setSystemInfo] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const res = await api.get('/system/status');
        if (mounted && res.data.success) {
          setSystemInfo(res.data.data);
        }
      } catch {
        // Silently handle if server warming up
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLiveSMS = systemInfo?.smsService?.isLive;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-dark-950/80 backdrop-blur-2xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & System Badge */}
          <div className="flex items-center gap-3">
            <Link to={isAuthenticated ? '/dashboard' : '/login'} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-500 p-0.5 shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-brand-400 group-hover:rotate-6 transition-transform" />
                </div>
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold font-display tracking-tight text-white flex items-center gap-1.5">
                  Secure<span className="text-brand-400">SMS</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 hidden sm:inline-block">
                    CSPRNG-256
                  </span>
                </span>
              </div>
            </Link>

            {/* Mode Indicator Badge */}
            {systemInfo && (
              <button
                onClick={onOpenSimulator}
                title={isLiveSMS ? 'Twilio Live API Connected' : 'Running in Local Mock SMS Simulator'}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  isLiveSMS 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                    : 'bg-brand-500/10 text-brand-300 border-brand-500/30 hover:bg-brand-500/20'
                }`}
              >
                <Radio className={`w-3 h-3 ${isLiveSMS ? 'text-emerald-400 animate-pulse' : 'text-brand-400'}`} />
                <span>{isLiveSMS ? 'Twilio Live' : 'Mock Simulator'}</span>
                {!isLiveSMS && (
                  <span className="text-[10px] text-brand-300 font-mono ml-0.5">Inbox</span>
                )}
              </button>
            )}
          </div>

          {/* Navigation Links */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center space-x-1.5">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  location.pathname === '/dashboard'
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Composer</span>
              </Link>

              <Link
                to="/history"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  location.pathname === '/history'
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Delivery Logs</span>
              </Link>

              <Link
                to="/network"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  location.pathname === '/network'
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Network Inspector</span>
              </Link>
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs text-slate-400">Zero-Knowledge Encrypted Gateway</span>
            </div>
          )}

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5">
            
            {/* Quick Virtual Phone Mock Trigger */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-dark-850 hover:bg-dark-800 text-brand-300 border border-brand-500/25 transition-all shadow-sm hover:border-brand-500/50"
              title="Open Virtual Phone Inbox"
            >
              <Smartphone className="w-3.5 h-3.5 text-brand-400" />
              <span className="hidden sm:inline">Virtual Phone</span>
            </button>

            {/* User Profile & Logout */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium bg-white/[0.05] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white text-[11px] font-bold">
                    {user?.email?.substring(0, 1).toUpperCase() || 'A'}
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate">{user?.email || 'Admin'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>

                {userDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-52 rounded-2xl glass-panel p-2 shadow-2xl z-50 animate-slide-up border-white/[0.1]"
                    onMouseLeave={() => setUserDropdown(false)}
                  >
                    <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-mono font-medium text-white truncate">{user?.email || 'admin@securesms.local'}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white shadow-md shadow-brand-500/20 transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/[0.08] space-y-2 animate-slide-up">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/[0.06]"
                >
                  <Send className="w-4 h-4 text-brand-400" />
                  <span>Composer</span>
                </Link>
                <Link
                  to="/history"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/[0.06]"
                >
                  <History className="w-4 h-4 text-brand-400" />
                  <span>Delivery Logs</span>
                </Link>
                <Link
                  to="/network"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/[0.06]"
                >
                  <Network className="w-4 h-4 text-accent-400" />
                  <span>Network Inspector</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white"
              >
                Sign In
              </Link>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
