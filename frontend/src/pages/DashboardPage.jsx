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
  ArrowUpRight
} from 'lucide-react';
import api from '../api/axios';
import QRCodeModal from '../components/QRCodeModal';
import Toast from '../components/Toast';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={Boolean(qrModalData)}
        onClose={() => setQrModalData(null)}
        data={qrModalData}
      />

      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Created</p>
            <h4 className="text-xl sm:text-2xl font-bold text-white font-mono">{stats?.totalMessages ?? '—'}</h4>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Links</p>
            <h4 className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">{stats?.activeMessages ?? '—'}</h4>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">SMS Dispatched</p>
            <h4 className="text-xl sm:text-2xl font-bold text-white font-mono">{stats?.smsDelivered ?? '—'}</h4>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Opened Links</p>
            <h4 className="text-xl sm:text-2xl font-bold text-indigo-400 font-mono">{stats?.openedMessages ?? '—'}</h4>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-3">
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
          <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Create Secure Message</h3>
                  <p className="text-xs text-slate-400">Generate a single-use or time-locked cryptographically hashed link</p>
                </div>
              </div>

              {createdResult && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Message</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Recipient Phone */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Recipient Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">E.164 International Format</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+1234567890 or +919876543210"
                    className="glass-input w-full pl-10 font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setRecipientPhone('+14155552671')}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors"
                  >
                    +1 Demo Phone
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientPhone('+919876543210')}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors"
                  >
                    +91 Demo Phone
                  </button>
                </div>
              </div>

              {/* Optional Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Message Title <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Confidential Financial Statement, One-Time Access Pass"
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
                  <span className="text-[11px] text-slate-500">{message.length}/5000 chars</span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your sensitive credentials, confidential notes, private document links, or personalized instructions here..."
                  maxLength={5000}
                  className="glass-input w-full text-sm leading-relaxed"
                />
              </div>

              {/* Optional Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Optional Image URL <span className="text-slate-500 font-normal">(HTTPS Link)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <ImageIcon className="w-4 h-4" />
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
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        expiresInMinutes === preset.mins
                          ? 'bg-teal-500/20 text-teal-400 border-teal-500/50 shadow-sm'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{preset.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Flags: One-Time Burn & Recipient Consent */}
              <div className="space-y-3 pt-2">
                
                {/* One-Time Access Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-0.5 ${isOneTime ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-500'}`}>
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">One-Time Self-Destruct Access</h4>
                      <p className="text-[11px] text-slate-400">Permanently burn token and destroy access after first recipient viewing</p>
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

                {/* Recipient Consent Checkbox (Privacy Requirement) */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-950 cursor-pointer"
                  />
                  <label htmlFor="consent" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                    <span className="font-semibold text-teal-400">Consent Verification:</span> I confirm that the recipient has explicitly opted in and consented to receive this automated SMS communication in accordance with telecommunication compliance standards.
                  </label>
                </div>

                {/* Immediate SMS Send Checkbox */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <input
                    type="checkbox"
                    id="sendImmediate"
                    checked={sendImmediately}
                    onChange={(e) => setSendImmediately(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-950 cursor-pointer"
                  />
                  <label htmlFor="sendImmediate" className="text-xs text-slate-300 cursor-pointer">
                    <span className="font-semibold text-slate-200">Dispatch SMS Gateway:</span> Trigger SMS delivery immediately via Twilio / Mock Simulator upon link creation.
                  </label>
                </div>

              </div>

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
            <div className="glass-panel rounded-2xl p-6 sm:p-7 shadow-2xl border-teal-500/40 relative overflow-hidden animate-slide-up">
              
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Secure Payload Activated
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {createdResult.isOneTime ? '🔥 One-Time Access' : '⏳ Time-Locked'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{createdResult.title}</h3>
              <p className="text-xs text-slate-400 mb-4">
                Target Recipient: <span className="font-mono text-teal-400 font-semibold">{createdResult.recipientPhoneMasked}</span>
              </p>

              {/* Delivery Link Input with Copy */}
              <div className="space-y-1.5 mb-4">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Generated Secure URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdResult.accessUrl}
                    className="glass-input w-full text-xs font-mono text-teal-300 py-2"
                  />
                  <button
                    onClick={() => handleCopyLink(createdResult.accessUrl)}
                    className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors flex-shrink-0"
                    title="Copy Link"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Actions & QR Code Preview */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-4 flex items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="text-slate-400">
                    Token Fingerprint: <span className="font-mono text-teal-400 font-semibold">{createdResult.tokenFingerprint}</span>
                  </div>
                  <div className="text-slate-400">
                    Expires: <span className="text-amber-400 font-medium">{new Date(createdResult.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="text-slate-400">
                    SMS Status:{' '}
                    <span className={`font-semibold ${createdResult.smsStatus === 'sent' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {createdResult.smsStatus === 'sent' ? 'Twilio Live Dispatched' : 'Mock Simulator Delivered'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setQrModalData(createdResult)}
                  className="p-2 bg-white rounded-xl shadow-md border-2 border-teal-500/30 hover:scale-105 transition-transform flex-shrink-0"
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
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-600/20"
                >
                  <span>Open & Test Recipient View in New Tab</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setQrModalData(createdResult)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-teal-400" />
                    <span>Expand QR Code</span>
                  </button>

                  <button
                    onClick={onOpenSimulator}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mock SMS Logs</span>
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
              <div className="bg-slate-950 rounded-2xl border-2 border-slate-800 p-3.5 shadow-inner space-y-4 min-h-[380px] flex flex-col justify-between">
                
                {/* Simulated SMS Header */}
                <div className="text-center pb-2 border-b border-slate-800/80">
                  <div className="w-8 h-8 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-xs font-bold text-slate-300 mb-1">
                    SEC
                  </div>
                  <p className="text-[11px] font-semibold text-slate-200">
                    {recipientPhone || '+1 (555) 000-0000'}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">End-to-End Encrypted Link Dispatch</p>
                </div>

                {/* Simulated SMS Bubble */}
                <div className="space-y-2">
                  <div className="text-center text-[10px] text-slate-500 font-mono">Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="bg-teal-600/20 border border-teal-500/30 rounded-2xl p-3.5 text-xs text-slate-200 space-y-2 shadow-sm">
                    <div className="flex items-center gap-1.5 text-teal-400 font-semibold text-[11px]">
                      <Lock className="w-3 h-3" />
                      <span>{title || 'Confidential Secure Message'}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      You have received a secure encrypted link. Click below to voluntary view the confidential payload:
                    </p>
                    <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-teal-300 break-all">
                      https://your-domain.com/message/8f4c...3e1a
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
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 space-y-1.5">
            <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
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
