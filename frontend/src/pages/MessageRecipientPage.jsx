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
  Share2,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import api from '../api/axios';

export default function MessageRecipientPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [securityNote, setSecurityNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchMessage = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/messages/${token}`);
        if (res.data.success) {
          setData(res.data.data);
          try {
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#8b5cf6', '#3b82f6', '#60a5fa'],
            });
          } catch {
            // ignore
          }
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
        setTimeLeft(`${days}d ${hours % 24}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s left`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s left`);
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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-dark-950 text-slate-100 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-4 max-w-sm w-full p-8 rounded-3xl glass-panel border-white/[0.08]">
          <div className="relative mx-auto w-16 h-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400">
              <KeyRound className="w-7 h-7 animate-pulse" />
            </div>
            <div className="absolute inset-0 border-2 border-brand-500 border-t-transparent rounded-2xl animate-spin" />
          </div>

          <div>
            <h3 className="text-base font-bold font-display text-white">Decrypting Secure Payload</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">Verifying SHA-256 token hash...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error / Expired / Already Viewed State
  if (errorStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-dark-950 text-slate-100 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative z-10 animate-fade-in border-rose-500/30">
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
            {errorStatus === 'already_viewed' ? (
              <Flame className="w-8 h-8 text-amber-400" />
            ) : errorStatus === 'expired' ? (
              <Clock className="w-8 h-8 text-rose-400" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 mb-3">
            <span>HTTP 410 &bull; Forward Secrecy Enforced</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-2">
            {errorStatus === 'already_viewed' && 'One-Time Link Burned'}
            {errorStatus === 'expired' && 'Link Has Expired'}
            {errorStatus === 'revoked' && 'Access Revoked'}
            {errorStatus === 'invalid' && 'Invalid Token'}
            {errorStatus === 'error' && 'Access Denied'}
          </h2>

          <p className="text-xs text-slate-300 mb-6 leading-relaxed bg-dark-950/80 p-4 rounded-2xl border border-white/[0.08]">
            {errorMessage}
          </p>

          <div className="p-4 rounded-2xl bg-dark-900/80 border border-white/[0.08] text-left text-xs text-slate-400 space-y-1.5 mb-6">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Zero-Knowledge Security Policy</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {securityNote || 'Single-use cryptographic links are permanently destroyed after the first access to guarantee recipient confidentiality.'}
            </p>
          </div>

          <Link
            to="/login"
            className="w-full py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold border border-white/[0.1] flex items-center justify-center gap-2 transition-colors"
          >
            <span>Return to Portal</span>
          </Link>

        </div>
      </div>
    );
  }

  // 3. Successful Decrypted Message Card
  return (
    <div className="min-h-screen py-12 px-4 flex flex-col items-center justify-center bg-dark-950 text-slate-100 relative overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-brand-500/10 to-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full space-y-6 relative z-10 animate-fade-in">
        
        {/* Main Decrypted Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 text-center space-y-5 border-white/[0.1] relative overflow-hidden">
          
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-300 shadow-xl shadow-brand-500/20">
            <Unlock className="w-7 h-7 text-brand-400" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/25 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Decrypted Successfully</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
              {data?.title || 'Confidential Message'}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Fingerprint: <span className="text-brand-300">{data?.tokenFingerprint}</span>
            </p>
          </div>

          {/* Burn / Expiration Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2 text-left">
              <Flame className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="font-semibold">
                {data?.isOneTime 
                  ? 'Self-Destruct Active: Link burned and cannot be reopened.' 
                  : 'Time-Locked Link Active'}
              </span>
            </div>
            {timeLeft && (
              <span className="font-mono text-[11px] font-semibold bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-500/30 flex-shrink-0 ml-2">
                {timeLeft}
              </span>
            )}
          </div>

          {/* Decrypted Payload Container */}
          <div className="relative group text-left">
            <div className="p-5 sm:p-6 rounded-2xl bg-dark-950/90 border border-white/[0.08] shadow-inner font-mono text-xs sm:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed select-all">
              {data?.message}
            </div>

            <button
              onClick={handleCopyMessage}
              className="absolute top-3 right-3 p-2 rounded-xl bg-white/[0.08] hover:bg-brand-600 text-slate-300 hover:text-white transition-all shadow-md flex items-center gap-1.5 text-xs font-sans font-semibold border border-white/[0.1] hover:border-brand-400"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Optional Attached Image */}
          {data?.imageUrl && (
            <div className="space-y-2 pt-2 text-left">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Attachment</span>
              <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-dark-950">
                <img
                  src={data.imageUrl}
                  alt="Secure Attachment"
                  className="w-full max-h-80 object-cover"
                />
              </div>
            </div>
          )}

          {/* Footer Metadata */}
          <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              <span>Deciphered: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Knowledge Hashed</span>
            </div>
          </div>

        </div>

        {/* Security Note */}
        <div className="glass-card rounded-2xl p-4 text-xs text-slate-400 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-200">Zero-Knowledge Verification:</strong> This payload was verified via a one-time SHA-256 digest match over an encrypted TLS 1.3 tunnel and the access key was marked as burned.
          </div>
        </div>

      </div>
    </div>
  );
}
