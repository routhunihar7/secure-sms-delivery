import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Clock, 
  Eye, 
  Flame, 
  Trash2, 
  Send, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  X
} from 'lucide-react';
import api from '../api/axios';
import QRCodeModal from '../components/QRCodeModal';
import Toast from '../components/Toast';

export default function HistoryPage({ onOpenSimulator }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [qrModalData, setQrModalData] = useState(null);
  const [toast, setToast] = useState(null);
  const [resendingId, setResendingId] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/messages', {
        params: {
          page,
          limit: 10,
          search,
          status: statusFilter,
        },
      });

      if (res.data.success) {
        setMessages(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
      showToast('error', 'Fetch Failed', 'Could not load message history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMessages();
  };

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this secure link? The recipient will no longer be able to open it.')) {
      return;
    }

    try {
      const res = await api.delete(`/messages/${id}`);
      if (res.data.success) {
        showToast('success', 'Link Revoked', 'The secure link has been disabled.');
        fetchMessages();
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (err) {
      showToast('error', 'Revocation Failed', err.response?.data?.error || err.message);
    }
  };

  const handleResendSMS = async (messageItem) => {
    setResendingId(messageItem.id);
    try {
      const res = await api.post(`/messages/${messageItem.id}/send`, {});
      if (res.data.success) {
        showToast('success', 'SMS Dispatched', 'A fresh SMS notification was sent.');
        fetchMessages();
      }
    } catch (err) {
      showToast('error', 'Resend Failed', err.response?.data?.error || err.message);
    } finally {
      setResendingId(null);
    }
  };

  const handleOpenDetailModal = async (id) => {
    try {
      const res = await api.get(`/messages/details/${id}`);
      if (res.data.success) {
        setSelectedMessage(res.data.data);
      }
    } catch (err) {
      showToast('error', 'Error', 'Failed to retrieve message details.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={Boolean(qrModalData)}
        onClose={() => setQrModalData(null)}
        data={qrModalData}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-teal-400" />
            <span>Message Delivery Log & Audit</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track created secure links, recipient open states, expiration windows, and SMS dispatch status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition-all"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mock SMS Device</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="md:col-span-7 flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by phone number (+1...) or message title..."
              className="glass-input w-full pl-10 text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Status Filters */}
        <div className="md:col-span-5 flex items-center gap-1 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'opened', label: 'Opened' },
            { id: 'unopened', label: 'Unopened' },
            { id: 'expired', label: 'Expired' },
            { id: 'revoked', label: 'Revoked' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Messages Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Recipient Phone</th>
                <th className="py-3.5 px-4">Title & Preview</th>
                <th className="py-3.5 px-4">SMS Status</th>
                <th className="py-3.5 px-4">Link State</th>
                <th className="py-3.5 px-4">Expiration</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-medium">
                    <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading delivery records...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-medium">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No delivery records match the current criteria.
                  </td>
                </tr>
              ) : (
                messages.map((item) => {
                  const isExpired = item.isExpired;
                  const isOpened = item.isOpened;
                  const isRevoked = !item.isActive;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono font-medium text-teal-400 whitespace-nowrap">
                        {item.recipientPhoneMasked}
                      </td>

                      {/* Title & snippet */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-100 truncate">{item.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{item.messageSnippet}</div>
                      </td>

                      {/* SMS Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.smsStatus === 'sent' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Twilio Live
                          </span>
                        )}
                        {item.smsStatus === 'mock_sent' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Smartphone className="w-3 h-3" /> Mock Sent
                          </span>
                        )}
                        {item.smsStatus === 'failed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                        {item.smsStatus === 'not_sent' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                            Link Only
                          </span>
                        )}
                      </td>

                      {/* Link State */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isRevoked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Revoked
                          </span>
                        ) : isOpened ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Eye className="w-3 h-3" /> {item.isOneTime ? 'Burned (Opened)' : `Opened (${item.viewCount})`}
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Expiration */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(item.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View details */}
                          <button
                            onClick={() => handleOpenDetailModal(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="View Full Details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Resend SMS */}
                          {item.isActive && !item.isExpired && (
                            <button
                              onClick={() => handleResendSMS(item)}
                              disabled={resendingId === item.id}
                              className="p-1.5 rounded-lg text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors"
                              title="Resend SMS"
                            >
                              <Send className={`w-4 h-4 ${resendingId === item.id ? 'animate-spin' : ''}`} />
                            </button>
                          )}

                          {/* Revoke / Delete */}
                          {item.isActive && (
                            <button
                              onClick={() => handleRevoke(item.id)}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                              title="Revoke Secure Link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing Page <span className="font-semibold text-white">{pagination.page}</span> of{' '}
              <span className="font-semibold text-white">{pagination.pages}</span> ({pagination.total} total records)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                Delivery Audit Record
              </h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient:</span>
                  <span className="text-teal-400 font-bold">{selectedMessage.recipientPhoneMasked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Title:</span>
                  <span className="text-slate-200">{selectedMessage.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Access Mode:</span>
                  <span className="text-amber-400">{selectedMessage.isOneTime ? 'One-Time Self-Destruct' : 'Multi-View Time-Locked'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SMS SID:</span>
                  <span className="text-slate-300">{selectedMessage.smsSid || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SMS Status:</span>
                  <span className="text-slate-300 capitalize">{selectedMessage.smsStatus}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Encrypted Payload Message:</label>
                <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 text-slate-200 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {selectedMessage.openedMeta && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-indigo-300 space-y-1">
                  <div className="font-semibold text-indigo-200 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Recipient Open Telemetry
                  </div>
                  <div>Opened At: {new Date(selectedMessage.openedAt).toLocaleString()}</div>
                  <div className="truncate">User-Agent: {selectedMessage.openedMeta.userAgent}</div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
