import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  RefreshCw, 
  MessageSquare, 
  ExternalLink, 
  Clock, 
  CheckCheck, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import api from '../api/axios';

export default function LiveSimulatorModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('mock_simulator');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/system/sms-logs');
      if (res.data.success) {
        setLogs(res.data.data);
        setMode(res.data.mode);
      }
    } catch (err) {
      console.error('Failed to fetch SMS logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Simulated SMS Device Inbox
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Mock Mode
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Live simulation stream of outbound SMS messages dispatched by the system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {logs.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-300 mb-1">No Dispatched SMS Messages Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Compose and send a message from the Dashboard. The simulated SMS payload will appear right here in real time.
              </p>
            </div>
          ) : (
            logs.map((item, index) => (
              <div 
                key={item.sid || index}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all group"
              >
                {/* Meta info */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5 pb-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-teal-400 font-mono">{item.to}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      SID: {item.sid}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(item.sentAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* SMS Body Bubble */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 leading-relaxed font-sans mb-3">
                  <p className="whitespace-pre-wrap">{item.body}</p>
                </div>

                {/* Actions & Target Link */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(item.accessUrl, index)}
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Token URL</span>
                        </>
                      )}
                    </button>
                  </div>

                  <a
                    href={item.accessUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-all shadow-sm"
                  >
                    <span>Open Recipient Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4 text-teal-400" />
            Mock mode active: Real SMS is simulated without incurring Twilio billing.
          </span>
          <span className="font-mono text-slate-500">{logs.length} logged events</span>
        </div>

      </div>
    </div>
  );
}
