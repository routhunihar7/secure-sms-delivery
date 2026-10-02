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
  ChevronDown
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & System Badge */}
          <div className="flex items-center gap-3">
            <Link to={isAuthenticated ? '/dashboard' : '/login'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-teal-400 group-hover:rotate-6 transition-transform" />
                </div>
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Secure<span className="text-teal-400">SMS</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 hidden sm:inline-block">
                    CSPRNG-256
                  </span>
                </span>
              </div>
            </Link>

            {/* Mode Indicator Badge */}
            {systemInfo && (
              <button
                onClick={onOpenSimulator}
                title={isLiveSMS ? 'Twilio Live API Connected' : 'Running in Local Mock SMS Simulator (Click to view simulated SMS inbox)'}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  isLiveSMS 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <Radio className={`w-3 h-3 ${isLiveSMS ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                <span>{isLiveSMS ? 'Twilio Live' : 'Mock SMS Simulator'}</span>
                {!isLiveSMS && (
                  <span className="text-[10px] underline ml-0.5 text-amber-300">View Logs</span>
                )}
              </button>
            )}
          </div>

          {/* Navigation Links */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Compose & Send</span>
              </Link>

              <Link
                to="/history"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/history'
                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Delivery Logs</span>
              </Link>

              <Link
                to="/network-demo"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/network-demo'
                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Network className="w-4 h-4" />
                <span>Networking Demo</span>
              </Link>
            </nav>
          ) : null}

          {/* Right Actions: Theme Toggle, Simulator Trigger, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mock SMS Trigger (Mobile or Desktop) */}
            <button
              onClick={onOpenSimulator}
              className="p-2 text-slate-400 hover:text-teal-400 hover:bg-slate-800/60 rounded-lg transition-colors relative"
              title="Open Mock SMS Device Simulator"
            >
              <Smartphone className="w-5 h-5" />
              <span className="sr-only">SMS Simulator</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="sr-only">Toggle theme</span>
            </button>

            {/* Authenticated User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-medium transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs border border-teal-500/30">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="max-w-[110px] truncate hidden sm:inline">{user?.email || 'Admin'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 animate-fade-in"
                    onMouseLeave={() => setIsMenuOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-800 text-xs">
                      <p className="text-slate-400">Signed in as:</p>
                      <p className="font-semibold text-slate-200 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {user?.role || 'Admin'}
                      </span>
                    </div>

                    <div className="py-1 md:hidden">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-300 hover:bg-slate-800/80"
                      >
                        <Send className="w-4 h-4 text-teal-400" />
                        <span>Compose</span>
                      </Link>
                      <Link
                        to="/history"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-300 hover:bg-slate-800/80"
                      >
                        <History className="w-4 h-4 text-teal-400" />
                        <span>Logs</span>
                      </Link>
                      <Link
                        to="/network-demo"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-300 hover:bg-slate-800/80"
                      >
                        <Network className="w-4 h-4 text-teal-400" />
                        <span>Network Demo</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-800 my-1 md:border-0 md:my-0">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold shadow-lg shadow-teal-500/20 transition-all"
              >
                <KeyRound className="w-4 h-4" />
                <span>Admin Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
