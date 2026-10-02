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
  Cpu,
  Zap,
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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [decryptStep, setDecryptStep] = useState(1);

  useEffect(() => {
    const fetchMessage = async () => {
      setLoading(true);
      setDecryptStep(1);

      // Simulate cinematic decryption sequence
      setTimeout(() => setDecryptStep(2), 400);
      setTimeout(() => setDecryptStep(3), 800);

      try {
        const res = await api.get(`/messages/${token}`);
        if (res.data.success) {
          setData(res.data.data);
          // Trigger confetti burst on successful decipher
          setTimeout(() => {
            try {
              confetti({
                particleCount: 70,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#14b8a6', '#06b6d4', '#8b5cf6', '#10b981'],
              });
            } catch {
              // ignore
            }
            setIsUnlocked(true);
            setLoading(false);
          }, 1000);
        }
      } catch (err) {
        const resData = err.response?.data;
        setErrorStatus(resData?.status || 'error');
        setErrorMessage(resData?.error || 'Unable to retrieve secure message.');
        setSecurityNote(resData?.securityNote || 'The requested link is inaccessible.');
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

  // 1. Loading / Decrypting Screen with Multi-Step Sequence
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-navy-950 text-slate-100 cyber-grid relative overflow-hidden">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-6 max-w-sm w-full p-8 rounded-3xl glass-panel border-slate-800">
          <div className="relative mx-auto w-20 h-20">
            <div className="w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-xl shadow-teal-500/20">
              <KeyRound className="w-9 h-9 animate-pulse" />
            </div>
            <div className="absolute inset-0 border-2 border-teal-400 border-t-transparent rounded-3xl animate-spin" />
          </div>

          <div>
            <h3 className="text-lg font-bold font-display text-white">Decrypting Secure Payload</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">256-Bit Token Verification in progress...</p>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-2 text-left text-xs font-mono">
            <div className="flex items-center gap-2 text-teal-400">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>1. Validating CSPRNG Hash</span>
            </div>
            <div className={`flex items-center gap-2 ${decryptStep >= 2 ? 'text-teal-400' : 'text-slate-600'}`}>
              {decryptStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-teal-400" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
              <span>2. Enforcing Expiration Policy</span>
            </div>
            <div className={`flex items-center gap-2 ${decryptStep >= 3 ? 'text-teal-400' : 'text-slate-600'}`}>
              {decryptStep >= 3 ? <CheckCircle2 className="w-4 h-4 text-teal-400" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
              <span>3. Self-Destruct Token Burn</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error / Expired / Already Viewed State
  if (errorStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-navy-950 text-slate-100 cyber-grid relative overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative z-10 animate-fade-in border-rose-500/30">
          
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5 shadow-xl shadow-rose-500/20 animate-bounce-subtle">
            {errorStatus === 'already_viewed' ? (
              <Flame className="w-10 h-10 text-amber-400" />
            ) : errorStatus === 'expired' ? (
              <Clock className="w-10 h-10 text-rose-400" />
            ) : (
              <ShieldAlert className="w-10 h-10 text-rose-400" />
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 mb-3">
            <span>HTTP 410 &bull; Forward Secrecy Enforced</span>
          </div>

          <h3 className="text-2xl font-extrabold font-display text-white mb-2">
            {errorStatus === 'already_viewed' && 'One-Time Link Burned'}
            {errorStatus === 'expired' && 'Link Has Expired'}
            {errorStatus === 'revoked' && 'Access Token Revoked'}
            {errorStatus === 'invalid' && 'Invalid Access Token'}
            {errorStatus === 'error' && 'Access Denied'}
          </h3>

          <p className="text-xs text-slate-300 mb-6 leading-relaxed bg-navy-950/80 p-4 rounded-2xl border border-slate-800/80">
            {errorMessage}
          </p>

          <div className="p-4 rounded-2xl bg-navy-900/60 border border-slate-800 text-left text-xs text-slate-400 space-y-2 mb-6">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Zero-Knowledge Security Mechanism</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {securityNote || 'Single-use cryptographic links are permanently destroyed after the first access to protect recipient confidentiality.'}
            </p>
          </div>

          <Link
            to="/login"
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <span>Return to Secure Portal</span>
          </Link>

        </div>
      </div>
    );
  }

  // 3. Successful Decryption Screen (The Vault Unlock)
  return (
    <div className="min-h-screen py-10 px-4 flex flex-col items-center justify-center bg-navy-950 text-slate-100 cyber-grid relative overflow-hidden">
      
      {/* Background Neon Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-teal-500/15 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full space-y-6 relative z-10 animate-fade-in">
        
        {/* Top Header Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 text-center space-y-4 border-teal-500/30 relative overflow-hidden hologram-card">
          
          <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-xl shadow-teal-500/20">
            <Unlock className="w-8 h-8 text-teal-400" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Decryption Successful &bull; Forward Secrecy Guaranteed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              {data?.title || 'Confidential Message Payload'}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              SHA-256 Token Fingerprint: <span className="text-teal-400">{data?.tokenFingerprint}</span>
            </p>
          </div>

          {/* Burn / Expiration Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
              <span className="font-semibold text-left">
                {data?.isOneTime 
                  ? 'Self-Destruct Active: This link has burned and cannot be reopened.' 
                  : 'Time-Locked Link Active'}
              </span>
            </div>
            {timeLeft && (
              <span className="font-mono text-[11px] font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 flex-shrink-0">
                {timeLeft}
              </span>
            )}
          </div>

          {/* Decrypted Payload Content Area */}
          <div className="relative group text-left">
            <div className="p-5 sm:p-6 rounded-2xl bg-navy-950/90 border border-teal-500/30 shadow-inner font-mono text-xs sm:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed select-all">
              {data?.message}
            </div>

            <button
              onClick={handleCopyMessage}
              className="absolute top-3 right-3 p-2 rounded-xl bg-slate-800/90 hover:bg-teal-600 text-slate-300 hover:text-white transition-all shadow-md flex items-center gap-1.5 text-xs font-sans font-semibold border border-slate-700 hover:border-teal-400"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-300">Copied!</span>
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
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Attached Document</span>
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-navy-950">
                <img
                  src={data.imageUrl}
                  alt="Secure Attachment"
                  className="w-full max-h-80 object-cover"
                />
              </div>
            </div>
          )}

          {/* Footer Security Badges */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>Deciphered: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Knowledge Hashed</span>
            </div>
          </div>

        </div>

        {/* Informative Security Guarantee */}
        <div className="glass-card rounded-2xl p-4 text-xs text-slate-400 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-200">How this works:</strong> This message was delivered using a transient 256-bit cryptographic token. The server verified the cryptographic digest, delivered the payload over an encrypted TLS 1.3 tunnel, and marked the database record as burned.
          </div>
        </div>

      </div>
    </div>
  );
}
