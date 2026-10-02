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
  ShieldAlert,
  Cpu,
  Zap,
  Fingerprint
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import QRCodeModal from '../components/QRCodeModal';
import Toast from '../components/Toast';

const PRESET_TEMPLATES = [
  {
    label: 'DB & Server Passwords',
    title: 'Confidential Infrastructure Access',
    message: 'Host: db.prod.internal\nUser: admin_root\nPassword: VaultSecret!2026_ProdKey#99\nToken: sk_live_89102482019482',
    icon: KeyRound,
  },
  {
    label: 'Crypto / Recovery Seed',
    title: 'Secret Recovery Passphrase',
    message: '1. velvet  2. eclipse  3. ocean  4. quantum\n5. matrix  6. shield   7. horizon 8. kinetic',
    icon: Fingerprint,
  },
  {
    label: 'Private Personal Note',
    title: 'Personal Confidential Message',
    message: 'Hey, I am sharing these confidential details securely with you. This link will self-destruct once opened.',
    icon: Lock,
  },
  {
    label: 'One-Time Security OTP',
    title: 'Time-Sensitive Verification Passcode',
    message: 'Your One-Time Authentication Code is: 849-204. Valid for 10 minutes only. Do not share with anyone.',
    icon: Zap,
  },
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

  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    showToast('info', 'Template Loaded', `Applied "${tpl.label}" template`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recipientPhone) {
      showToast('error', 'Validation Error', 'Please provide a valid recipient phone number.');
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
        recipientPhone,
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
        // Confetti burst
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#14b8a6', '#06b6d4', '#8b5cf6'],
        });
        showToast(
          'success',
          'Secure Link Generated!',
          sendImmediately 
            ? 'Message created and SMS dispatched successfully.' 
            : 'Cryptographic token created. You can now copy the link or display the QR code.'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in relative">
      
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={Boolean(qrModalData)}
        onClose={() => setQrModalData(null)}
        data={qrModalData}
      />

      {/* Hero Welcome Banner with glowing aura */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-navy-900/90 via-navy-850/80 to-navy-900/90 border border-slate-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span>CSPRNG 256-Bit Cryptographic Pipeline &bull; Zero-Knowledge SHA-256</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              Confidential SMS Payload Vault
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Dispatch end-to-end confidential credentials, sensitive documents, and one-time access links. The database stores zero plain-text tokens—guaranteeing complete forward secrecy.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            <button
              onClick={onOpenSimulator}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-all shadow-md hover:border-teal-500/40"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Mock SMS Device</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-3 hover:scale-[1.02] transition-transform">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Dispatched</p>
            <h4 className="text-xl sm:text-2xl font-bold text-white font-mono">{stats?.totalMessages ?? '—'}</h4>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-3 hover:scale-[1.02] transition-transform">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Vaults</p>
            <h4 className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">{stats?.activeMessages ?? '—'}</h4>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-3 hover:scale-[1.02] transition-transform">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">SMS Transmitted</p>
            <h4 className="text-xl sm:text-2xl font-bold text-white font-mono">{stats?.smsDelivered ?? '—'}</h4>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-3 hover:scale-[1.02] transition-transform">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Opened Links</p>
            <h4 className="text-xl sm:text-2xl font-bold text-indigo-400 font-mono">{stats?.openedMessages ?? '—'}</h4>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-3 hover:scale-[1.02] transition-transform">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Open Rate</p>
            <h4 className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">{stats ? `${stats.openRate}%` : '—'}</h4>
          </div>
        </div>

      </div>

      {/* Main Grid: Message Composer + Live Preview / Result Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Composer Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border-slate-800/80">
            
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 shadow-lg shadow-teal-500/10">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-white">Create Encrypted Vault Link</h3>
                  <p className="text-xs text-slate-400">Generates 256-bit CSPRNG token with instant self-destruct capabilities</p>
                </div>
              </div>

              {createdResult && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Message</span>
                </button>
              )}
            </div>

            {/* Quick Templates Selector */}
            <div className="mb-6 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Quick Payload Templates
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_TEMPLATES.map((tpl, i) => {
                  const Icon = tpl.icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="p-2.5 rounded-xl bg-navy-950/80 border border-slate-800 hover:border-teal-500/40 hover:bg-navy-900 text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 text-slate-300 group-hover:text-teal-400 text-xs font-semibold">
                        <Icon className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                        <span className="truncate">{tpl.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Recipient Phone */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Recipient Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">E.164 Format</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Smartphone className="w-4 h-4 text-teal-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+918639970793 or +14155552671"
                    className="glass-input w-full pl-10 font-mono text-sm tracking-wide"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px]">
                  <span className="text-slate-500">Quick:</span>
                  <button
                    type="button"
                    onClick={() => setRecipientPhone('+918639970793')}
                    className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 hover:text-teal-400 hover:bg-slate-800 font-mono text-[10px] transition-colors"
                  >
                    +91 8639970793
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientPhone('+14155552671')}
                    className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 hover:text-teal-400 hover:bg-slate-800 font-mono text-[10px] transition-colors"
                  >
                    +1 4155552671 (Demo)
                  </button>
                </div>
              </div>

              {/* Optional Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Message Title <span className="text-slate-500 font-normal">(Visible in SMS preview)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Project Defense Confidential Passwords, Private Secure Note"
                  maxLength={120}
                  className="glass-input w-full text-sm"
                />
              </div>

              {/* Secret Message Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Secret Message Content <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">{message.length}/5000 chars</span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your sensitive credentials, confidential notes, private document links, or personalized instructions here..."
                  maxLength={5000}
                  className="glass-input w-full text-sm leading-relaxed font-mono resize-none"
                />
              </div>

              {/* Optional Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Optional Attachment Link <span className="text-slate-500 font-normal">(HTTPS Image URL)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800"
                    className="glass-input w-full pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Expiration Settings */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Link Expiration Window
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
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-md shadow-teal-500/10 ring-1 ring-teal-500/40'
                          : 'bg-navy-950/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>{preset.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Flags: One-Time Burn & Recipient Consent */}
              <div className="space-y-3 pt-2">
                
                {/* One-Time Access Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-navy-950/80 border border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${isOneTime ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500'}`}>
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">One-Time Self-Destruct Access (Burn on Read)</h4>
                      <p className="text-[11px] text-slate-400">Permanently burn cryptographic token and destroy access after the first view</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOneTime}
                      onChange={(e) => setIsOneTime(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>

                {/* Recipient Consent Checkbox */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-navy-950/80 border border-slate-800">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-950 cursor-pointer"
                  />
                  <label htmlFor="consent" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                    <span className="font-semibold text-teal-400">Consent Verification:</span> I confirm that the recipient has explicitly opted in to receive this confidential dispatch in compliance with international telecom privacy regulations.
                  </label>
                </div>

                {/* Immediate SMS Send Checkbox */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-navy-950/80 border border-slate-800">
                  <input
                    type="checkbox"
                    id="sendImmediate"
                    checked={sendImmediately}
                    onChange={(e) => setSendImmediately(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-950 cursor-pointer"
                  />
                  <label htmlFor="sendImmediate" className="text-xs text-slate-300 cursor-pointer">
                    <span className="font-semibold text-slate-200">Dispatch SMS Gateway:</span> Trigger immediate SMS dispatch through Twilio API / Mock Simulator upon creation.
                  </label>
                </div>

              </div>

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{sendImmediately ? 'Generate Token & Dispatch SMS' : 'Generate Secure Link Only'}</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: Live Phone Preview / Generated Token Result (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* If Result Generated: Show Spectacular Success Card */}
          {createdResult ? (
            <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl border-teal-500/40 relative overflow-hidden animate-slide-up hologram-card">
              
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Vault Activated
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {createdResult.isOneTime ? '🔥 One-Time Burn' : '⏳ Time-Locked'}
                </span>
              </div>

              <h3 className="text-lg font-bold font-display text-white mb-1">{createdResult.title}</h3>
              <p className="text-xs text-slate-400 mb-4">
                Recipient: <span className="font-mono text-teal-400 font-semibold">{createdResult.recipientPhoneMasked}</span>
              </p>

              {/* Delivery Link Input with Copy */}
              <div className="space-y-1.5 mb-4">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Generated Secure URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdResult.accessUrl}
                    className="glass-input w-full text-xs font-mono text-teal-300 py-2.5"
                  />
                  <button
                    onClick={() => handleCopyLink(createdResult.accessUrl)}
                    className="p-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors flex-shrink-0 shadow-md"
                    title="Copy Link"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Actions & QR Code Preview */}
              <div className="bg-navy-950/80 border border-slate-800 rounded-2xl p-4 mb-4 flex items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="text-slate-400">
                    Fingerprint: <span className="font-mono text-teal-400 font-semibold">{createdResult.tokenFingerprint}</span>
                  </div>
                  <div className="text-slate-400">
                    Expires: <span className="text-amber-400 font-medium">{new Date(createdResult.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="text-slate-400">
                    Status:{' '}
                    <span className={`font-semibold ${createdResult.smsStatus === 'sent' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {createdResult.smsStatus === 'sent' ? 'Twilio Live Dispatched' : 'Mock Simulator Delivered'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setQrModalData(createdResult)}
                  className="p-2 bg-white rounded-2xl shadow-md border-2 border-teal-500/30 hover:scale-105 transition-transform flex-shrink-0"
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
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20"
                >
                  <span>Open & Test Recipient View</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setQrModalData(createdResult)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-teal-400" />
                    <span>Expand QR</span>
                  </button>

                  <button
                    onClick={onOpenSimulator}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mock Inbox</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Live Smartphone Mock Simulator Preview */
            <div className="glass-panel rounded-3xl p-5 shadow-2xl border border-slate-800 max-w-sm mx-auto">
              
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-teal-400" />
                  Live SMS Device Preview
                </span>
                <span className="font-mono text-[10px] text-teal-400">5G • 100%</span>
              </div>

              {/* Smartphone Frame */}
              <div className="bg-navy-950 rounded-2xl border-2 border-slate-800 p-3.5 shadow-inner space-y-4 min-h-[380px] flex flex-col justify-between">
                
                {/* Simulated SMS Header */}
                <div className="text-center pb-2 border-b border-slate-800/80">
                  <div className="w-8 h-8 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-xs font-bold text-slate-300 mb-1">
                    SEC
                  </div>
                  <p className="text-[11px] font-semibold text-slate-200">
                    {recipientPhone || '+91 86399 70793'}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">End-to-End Encrypted Link Dispatch</p>
                </div>

                {/* Simulated SMS Bubble */}
                <div className="space-y-2">
                  <div className="text-center text-[10px] text-slate-500 font-mono">Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="bg-teal-950/60 border border-teal-500/30 rounded-2xl p-3.5 text-xs text-slate-200 space-y-2 shadow-sm">
                    <div className="flex items-center gap-1.5 text-teal-400 font-semibold text-[11px]">
                      <Lock className="w-3 h-3" />
                      <span>{title || 'Confidential Secure Message'}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      You have received a confidential link. Click below to view the secure payload:
                    </p>
                    <div className="p-2 rounded-lg bg-navy-900 border border-slate-800 text-[10px] font-mono text-teal-300 break-all">
                      https://your-domain.vercel.app/message/8f4c...3e1a
                    </div>
                    <p className="text-[10px] text-amber-400/90 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires in {expiresInMinutes === -1 ? `${customMinutes || 60}m` : `${expiresInMinutes / 60 >= 1 ? `${expiresInMinutes / 60}h` : `${expiresInMinutes}m`}`}
                      {isOneTime && ' • One-Time Burn'}
                    </p>
                  </div>
                </div>

                {/* Device Home Indicator */}
                <div className="w-24 h-1 bg-slate-800 rounded-full mx-auto" />
              </div>

            </div>
          )}

          {/* Educational Quick Note */}
          <div className="p-4 rounded-2xl bg-navy-900/40 border border-slate-800/60 text-xs text-slate-400 space-y-1.5">
            <h5 className="font-semibold text-slate-300 flex items-center gap-1.5 font-display">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Privacy & Cryptographic Guarantee
            </h5>
            <p className="text-[11px] leading-relaxed text-slate-400">
              The plain token is never stored in the MongoDB database. Only its SHA-256 cryptographic digest is persisted. Even if the database is dumped, past tokens cannot be reversed.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
