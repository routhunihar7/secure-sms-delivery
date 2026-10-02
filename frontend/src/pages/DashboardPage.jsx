import React, { useState, useEffect } from 'react';
import { 
  Send, 
  ShieldCheck, 
  Smartphone, 
  Clock, 
  Lock, 
  Flame, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  Image as ImageIcon, 
  Sparkles, 
  AlertCircle,
  Radio,
  CheckCircle2,
  RefreshCw,
  Eye,
  Layers,
  ArrowUpRight,
  KeyRound,
  Zap,
  Globe,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import QRCodeModal from '../components/QRCodeModal';
import Toast from '../components/Toast';

const PRESET_TAGS = [
  { label: '🔑 Passwords', title: 'Confidential Access Credentials', msg: 'Host: db.internal.cloud\nUser: admin\nPassword: Vault#2026_SecretPass!' },
  { label: '🔒 Private Note', title: 'Confidential Personal Note', msg: 'Here is the private information you requested. This link burns once opened.' },
  { label: '⚡ One-Time OTP', title: 'Authentication Security Passcode', msg: 'Your one-time authentication code is: 938-102. Valid for 10 minutes.' },
  { label: '📜 Contract & Terms', title: 'Private Document Link', msg: 'Please review the confidential document at: https://internal.doc/v8492' },
];

export default function DashboardPage({ onOpenSimulator }) {
  // Form States
  const [recipientPhone, setRecipientPhone] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState(1440); // 24 hours
  const [customMinutes, setCustomMinutes] = useState('');
  const [isOneTime, setIsOneTime] = useState(true);
  const [consentGiven, setConsentGiven] = useState(true);
  const [sendImmediately, setSendImmediately] = useState(true);

  // Status & Async States
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [createdResult, setCreatedResult] = useState(null);
  const [qrModalData, setQrModalData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  // Character & Segment Calculations
  const charCount = message.length;
  const segments = charCount === 0 ? 0 : Math.ceil(charCount / (charCount <= 160 ? 160 : 153));

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/messages/stats/summary');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleExpirationSelect = (mins) => {
    setExpiresInMinutes(mins);
    if (mins !== -1) {
      setCustomMinutes('');
    }
  };

  const handleCountryPrefix = (prefix) => {
    const clean = recipientPhone.replace(/^\+\d{1,3}/, '');
    setRecipientPhone(`${prefix}${clean}`);
  };

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setMessage(preset.msg);
    showToast('info', 'Preset Loaded', `Applied "${preset.label}" template.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanPhone = recipientPhone.replace(/[\s\-()]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      showToast('error', 'Validation Error', 'Please enter a valid international phone number (e.g. +918639970793).');
      return;
    }

    if (!message.trim()) {
      showToast('error', 'Validation Error', 'Message body cannot be empty.');
      return;
    }

    if (!consentGiven) {
      showToast('error', 'Consent Required', 'You must verify that the recipient has consented to receive this SMS.');
      return;
    }

    const finalMinutes = expiresInMinutes === -1 
      ? parseInt(customMinutes, 10) || 60 
      : expiresInMinutes;

    setLoading(true);
    try {
      const payload = {
        recipientPhone: cleanPhone,
        title: title.trim() || 'Confidential Secure Message',
        message: message.trim(),
        imageUrl: imageUrl.trim(),
        expiresInMinutes: finalMinutes,
        isOneTime,
        consentGiven,
        sendImmediately,
      };

      const res = await api.post('/messages', payload);

      if (res.data.success) {
        setCreatedResult(res.data.data);
        confetti({
          particleCount: 45,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#8b5cf6', '#3b82f6', '#60a5fa'],
        });
        showToast(
          'success',
          'Secure Link Created',
          sendImmediately 
            ? 'Encrypted link generated & SMS dispatched.' 
            : 'Cryptographic single-use token ready.'
        );
        fetchStats();
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create secure message';
      showToast('error', 'Submission Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('info', 'Copied to Clipboard', 'Secure message URL copied.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetForm = () => {
    setRecipientPhone('');
    setTitle('');
    setMessage('');
    setImageUrl('');
    setCreatedResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={Boolean(qrModalData)}
        onClose={() => setQrModalData(null)}
        data={qrModalData}
      />

      {/* Hero Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>Zero-Knowledge SHA-256 Vault Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
            Secure Message Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate self-destructing, time-locked links and deliver raw tokens directly to mobile devices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.08] text-brand-300 border border-brand-500/30 transition-all shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5 text-brand-400" />
            <span>Mock Simulator</span>
          </button>
        </div>
      </div>

      {/* SaaS KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Total Created</p>
            <h4 className="text-lg sm:text-xl font-bold text-white font-mono">{stats?.totalMessages ?? '0'}</h4>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Active Vaults</p>
            <h4 className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">{stats?.activeMessages ?? '0'}</h4>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-400 flex-shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">SMS Dispatched</p>
            <h4 className="text-lg sm:text-xl font-bold text-white font-mono">{stats?.smsDelivered ?? '0'}</h4>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Opened Links</p>
            <h4 className="text-lg sm:text-xl font-bold text-indigo-300 font-mono">{stats?.openedMessages ?? '0'}</h4>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 glass-card rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Open Rate</p>
            <h4 className="text-lg sm:text-xl font-bold text-amber-400 font-mono">{stats ? `${stats.openRate}%` : '0%'}</h4>
          </div>
        </div>

      </div>

      {/* Main Grid: Message Composer (Left) + Result Card / Live Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Message Composer Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            
            {/* Card Header */}
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-brand-500/15 border border-brand-500/30 text-brand-300 shadow-lg shadow-brand-500/10">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display text-white">Send a Message</h2>
                  <p className="text-xs text-slate-400">Compose payload and generate a 256-bit single-use token</p>
                </div>
              </div>

              {createdResult && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs font-semibold text-brand-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Message</span>
                </button>
              )}
            </div>

            {/* Preset Tags Chips */}
            <div className="mb-5 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Presets</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_TAGS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] hover:bg-brand-500/15 text-slate-300 hover:text-brand-200 border border-white/[0.08] hover:border-brand-500/30 transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Recipient Phone Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Recipient <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-500">Prefix:</span>
                    <button
                      type="button"
                      onClick={() => handleCountryPrefix('+91')}
                      className="px-1.5 py-0.5 rounded bg-white/[0.05] hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 font-mono text-[10px]"
                    >
                      🇮🇳 +91
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCountryPrefix('+1')}
                      className="px-1.5 py-0.5 rounded bg-white/[0.05] hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 font-mono text-[10px]"
                    >
                      🇺🇸 +1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCountryPrefix('+44')}
                      className="px-1.5 py-0.5 rounded bg-white/[0.05] hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 font-mono text-[10px]"
                    >
                      🇬🇧 +44
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Smartphone className="w-4 h-4 text-brand-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+91 Enter recipient phone number"
                    className="glass-input w-full pl-10 font-mono text-sm tracking-wide"
                  />
                </div>
              </div>

              {/* Message Title (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
                  Title <span className="text-slate-500 font-normal">(Optional preview text)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Project Credentials, Confidential Statement"
                  maxLength={120}
                  className="glass-input w-full text-sm"
                />
              </div>

              {/* Your Message Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Your Message <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {charCount} / 160 chars ({segments} seg)
                  </span>
                </div>

                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your sensitive message, confidential password, or private link here..."
                  maxLength={5000}
                  className="glass-input w-full text-sm leading-relaxed font-sans resize-none"
                />
              </div>

              {/* Expiration Settings */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                  Access Expiration
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: '10 Minutes', mins: 10 },
                    { label: '1 Hour', mins: 60 },
                    { label: '24 Hours', mins: 1440 },
                    { label: '7 Days', mins: 10080 },
                  ].map((preset) => (
                    <button
                      key={preset.mins}
                      type="button"
                      onClick={() => handleExpirationSelect(preset.mins)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        expiresInMinutes === preset.mins
                          ? 'bg-brand-500/20 text-brand-200 border-brand-500/50 shadow-sm shadow-brand-500/10'
                          : 'bg-dark-950/80 text-slate-400 border-white/[0.08] hover:border-white/[0.15] hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-400" />
                        <span>{preset.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Switches */}
              <div className="space-y-3 pt-1">
                
                {/* One-Time Access Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-dark-950/80 border border-white/[0.08]">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${isOneTime ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500'}`}>
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">One-Time Self-Destruct</h4>
                      <p className="text-[11px] text-slate-400">Permanently burn token and destroy access after the first view</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOneTime}
                      onChange={(e) => setIsOneTime(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                  </label>
                </div>

                {/* Recipient Consent Checkbox */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-dark-950/80 border border-white/[0.08]">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500 focus:ring-offset-dark-950 cursor-pointer"
                  />
                  <label htmlFor="consent" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                    <span className="font-semibold text-brand-300">Recipient Consent:</span> I verify that the recipient has consented to receive this confidential SMS communication.
                  </label>
                </div>

                {/* Immediate SMS Send Checkbox */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-dark-950/80 border border-white/[0.08]">
                  <input
                    type="checkbox"
                    id="sendImmediate"
                    checked={sendImmediately}
                    onChange={(e) => setSendImmediately(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500 focus:ring-offset-dark-950 cursor-pointer"
                  />
                  <label htmlFor="sendImmediate" className="text-xs text-slate-300 cursor-pointer">
                    <span className="font-semibold text-slate-200">Dispatch SMS Gateway:</span> Transmit message via Twilio / Mock Simulator immediately.
                  </label>
                </div>

              </div>

              {/* Main Submit Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{sendImmediately ? '✈ Send Message' : 'Generate Secure Link Only'}</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: Live Phone Preview / Generated Token Result (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* If Result Generated: Show Result Vault Card */}
          {createdResult ? (
            <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl border-brand-500/40 relative overflow-hidden animate-slide-up">
              
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-accent-400" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Vault Link Active
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {createdResult.isOneTime ? '🔥 One-Time Burn' : '⏳ Time-Locked'}
                </span>
              </div>

              <h3 className="text-lg font-bold font-display text-white mb-1">{createdResult.title}</h3>
              <p className="text-xs text-slate-400 mb-4">
                Target: <span className="font-mono text-brand-300 font-semibold">{createdResult.recipientPhoneMasked}</span>
              </p>

              {/* Delivery Link Input with Copy */}
              <div className="space-y-1.5 mb-4">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Generated URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdResult.accessUrl}
                    className="glass-input w-full text-xs font-mono text-brand-200 py-2.5"
                  />
                  <button
                    onClick={() => handleCopyLink(createdResult.accessUrl)}
                    className="p-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-colors flex-shrink-0 shadow-md"
                    title="Copy Link"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Details & QR Preview */}
              <div className="bg-dark-950/90 border border-white/[0.08] rounded-2xl p-4 mb-4 flex items-center justify-between gap-4">
                <div className="space-y-1.5 text-xs">
                  <div className="text-slate-400">
                    Fingerprint: <span className="font-mono text-brand-300 font-semibold">{createdResult.tokenFingerprint}</span>
                  </div>
                  <div className="text-slate-400">
                    Expires: <span className="text-amber-400 font-medium">{new Date(createdResult.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="text-slate-400">
                    Status:{' '}
                    <span className={`font-semibold ${createdResult.smsStatus === 'sent' ? 'text-emerald-400' : 'text-brand-300'}`}>
                      {createdResult.smsStatus === 'sent' ? 'Twilio Dispatched' : 'Mock Simulator Delivered'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setQrModalData(createdResult)}
                  className="p-2 bg-white rounded-2xl shadow-md border-2 border-brand-500/30 hover:scale-105 transition-transform flex-shrink-0"
                  title="Click to expand QR Code"
                >
                  <img src={createdResult.qrCode} alt="QR Code" className="w-16 h-16" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <a
                  href={createdResult.accessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20"
                >
                  <span>Open Recipient Vault View</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setQrModalData(createdResult)}
                    className="py-2.5 px-3 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-200 text-xs font-semibold border border-white/[0.08] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-brand-400" />
                    <span>Expand QR</span>
                  </button>

                  <button
                    onClick={onOpenSimulator}
                    className="py-2.5 px-3 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-200 text-xs font-semibold border border-white/[0.08] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-brand-400" />
                    <span>Mock Inbox</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Live Smartphone Mock Simulator Preview */
            <div className="glass-panel rounded-3xl p-5 shadow-2xl border-white/[0.08] max-w-sm mx-auto">
              
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08] text-xs text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-brand-400" />
                  Live SMS Device Preview
                </span>
                <span className="font-mono text-[10px] text-brand-400">5G • 100%</span>
              </div>

              {/* Smartphone Frame */}
              <div className="bg-dark-950 rounded-2xl border border-white/[0.08] p-3.5 shadow-inner space-y-4 min-h-[380px] flex flex-col justify-between">
                
                {/* Simulated SMS Header */}
                <div className="text-center pb-2 border-b border-white/[0.06]">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-300 mx-auto flex items-center justify-center text-xs font-bold mb-1">
                    SEC
                  </div>
                  <p className="text-[11px] font-semibold text-slate-200">
                    {recipientPhone || '+91 86399 70793'}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">Encrypted Link Transmission</p>
                </div>

                {/* Simulated SMS Bubble */}
                <div className="space-y-2">
                  <div className="text-center text-[10px] text-slate-500 font-mono">Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="bg-brand-950/60 border border-brand-500/30 rounded-2xl p-3.5 text-xs text-slate-200 space-y-2 shadow-sm">
                    <div className="flex items-center gap-1.5 text-brand-300 font-semibold text-[11px]">
                      <Lock className="w-3 h-3" />
                      <span>{title || 'Confidential Secure Message'}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      You have received a confidential link. Click below to view the secure payload:
                    </p>
                    <div className="p-2 rounded-lg bg-dark-900 border border-white/[0.08] text-[10px] font-mono text-brand-200 break-all">
                      https://your-app.vercel.app/message/8f4c...3e1a
                    </div>
                    <p className="text-[10px] text-amber-400/90 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      Expires in {expiresInMinutes === -1 ? `${customMinutes || 60}m` : `${expiresInMinutes / 60 >= 1 ? `${expiresInMinutes / 60}h` : `${expiresInMinutes}m`}`}
                      {isOneTime && ' • One-Time Burn'}
                    </p>
                  </div>
                </div>

                {/* Device Home Indicator */}
                <div className="w-24 h-1 bg-white/[0.1] rounded-full mx-auto" />
              </div>

            </div>
          )}

          {/* Educational Security Card */}
          <div className="p-4 rounded-2xl bg-dark-900/60 border border-white/[0.08] text-xs text-slate-400 space-y-1.5">
            <h5 className="font-semibold text-slate-200 flex items-center gap-1.5 font-display">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              Privacy & Forward Secrecy
            </h5>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Plain tokens are never stored in the database. Only their irreversible SHA-256 cryptographic digest is persisted.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
