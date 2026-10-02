import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Clock, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Copy, 
  Check, 
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Share2
} from 'lucide-react';
import api from '../api/axios';

export default function MessageRecipientPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [securityNote, setSecurityNote] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchMessage = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/messages/${token}`);
        if (res.data.success) {
          setData(res.data.data);
          // Trigger confetti burst on successful decipher
          try {
            confetti({
              particleCount: 60,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#14b8a6', '#10b981', '#38bdf8'],
            });
          } catch {
            // ignore
          }
          setIsUnlocked(true);
        }
      } catch (err) {
        const resData = err.response?.data;
        setErrorStatus(resData?.status || 'error');
        setErrorMessage(resData?.error || 'Unable to retrieve secure message.');
        setSecurityNote(resData?.securityNote || 'The requested link is inaccessible.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMessage();
    }
  }, [token]);

  // Expiration countdown timer
  useEffect(() => {
    if (!data?.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(data.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h remaining`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s remaining`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s remaining`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const handleCopyMessage = async () => {
    if (!data?.message) return;
    try {
      await navigator.clipboard.writeText(data.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // 1. Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-950 text-slate-100">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <div className="absolute inset-0 border-2 border-teal-500 border-t-transparent rounded-2xl animate-spin" />
        </div>
        <h3 className="text-base font-bold text-white mt-6 mb-1">Decrypting Secure Payload</h3>
        <p className="text-xs text-slate-400 font-mono">Verifying SHA-256 token hash & expiration...</p>
      </div>
    );
  }

  // 2. Error / Expired / Already Viewed State
  if (errorStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative z-10 animate-fade-in border-rose-500/30">
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
            {errorStatus === 'already_viewed' ? (
              <Flame className="w-8 h-8 text-amber-400" />
            ) : errorStatus === 'expired' ? (
              <Clock className="w-8 h-8 text-rose-400" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            )}
          </div>

          <h3 className="text-xl font-extrabold text-white mb-2">
            {errorStatus === 'already_viewed' && 'One-Time Link Burned'}
            {errorStatus === 'expired' && 'Secure Link Expired'}
            {errorStatus === 'revoked' && 'Access Revoked'}
            {errorStatus === 'not_found' && 'Link Not Found'}
            {(!['already_viewed', 'expired', 'revoked', 'not_found'].includes(errorStatus)) && 'Access Denied'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
            {errorMessage}
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 mb-6 text-left space-y-1">
            <span className="font-semibold text-slate-300 block">Security Notice:</span>
            <p className="text-[11px] leading-relaxed">{securityNote}</p>
          </div>

          <div className="space-y-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <span>Return to Secure SMS Portal</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // 3. Success Unlocked State
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full space-y-6 relative z-10 animate-fade-in">
        
        {/* Top Header Card with Vault Status */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Vault Unlocked</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {data.title || 'Confidential Secure Message'}
          </h2>
          <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
            <span>Verified Token:</span>
            <span className="font-mono text-teal-400 font-semibold">{data.tokenFingerprint}</span>
          </p>
        </div>

        {/* Main Message Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border-teal-500/30 relative overflow-hidden">
          
          {/* Top subtle bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500" />

          {/* Self-Destruct / One-Time Warning Banner */}
          {data.isOneTime && (
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
              <Flame className="w-5 h-5 flex-shrink-0 text-amber-400" />
              <div>
                <p className="font-bold text-amber-200">One-Time Access Link</p>
                <p className="text-[11px] text-amber-300/80">
                  This secure message link has been permanently burned. If you refresh or close this tab, access will be barred.
                </p>
              </div>
            </div>
          )}

          {/* Optional Attached Image */}
          {data.imageUrl && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-96 flex items-center justify-center">
              <img
                src={data.imageUrl}
                alt="Encrypted Payload Asset"
                className="w-full h-auto object-contain max-h-96 rounded-2xl hover:scale-102 transition-transform"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Message Content Bubble */}
          <div className="relative bg-slate-950/80 rounded-2xl p-5 sm:p-6 border border-slate-800/90 shadow-inner mb-6">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/70 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                Confidential Payload Content
              </span>
              <button
                onClick={handleCopyMessage}
                className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-semibold px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 transition-colors"
                title="Copy Message Text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="text-sm sm:text-base text-slate-100 font-normal leading-relaxed whitespace-pre-wrap selection:bg-teal-500 selection:text-white">
              {data.message}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/50 rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>Created: {new Date(data.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Status: <strong className="text-amber-400 font-mono">{timeLeft}</strong></span>
            </div>
          </div>

        </div>

        {/* Security & Cryptography Assurance Footer */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center text-xs text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1.5 text-slate-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            End-to-End Secure Link Protocol
          </p>
          <p className="text-[11px] text-slate-500">
            Delivered voluntarily to registered recipient. Protected by SHA-256 digest authentication and transport layer security.
          </p>
        </div>

      </div>
    </div>
  );
}
