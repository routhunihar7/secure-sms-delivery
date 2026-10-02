import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy, ExternalLink, Check, ShieldCheck, Clock, QrCode } from 'lucide-react';

export default function QRCodeModal({ isOpen, onClose, data }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !data) return null;

  const { accessUrl, title, expiresAt, tokenFingerprint } = data;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accessUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      ctx.fillStyle = '#0a0d1d';
      ctx.fillRect(0, 0, 600, 600);
      
      // Draw white background card for QR
      ctx.fillStyle = '#ffffff';
      ctx.roundRect ? ctx.roundRect(40, 40, 520, 520, 24) : ctx.fillRect(40, 40, 520, 520);
      ctx.fill();

      ctx.drawImage(img, 70, 70, 460, 460);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `secure-qr-${tokenFingerprint || 'payload'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030409]/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0a0d1e] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-accent-500 to-indigo-500" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="text-center relative z-10">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-brand-500/20 to-accent-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-4 shadow-lg shadow-brand-500/10">
            <QrCode className="w-6 h-6" />
          </div>
          
          <h3 className="font-display text-lg font-bold text-white mb-1 tracking-tight">
            Secure Delivery QR Code
          </h3>
          <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto">
            Scan with any standard smartphone camera to authenticate and stream decrypted payload.
          </p>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl mb-5 border-4 border-brand-500/30 transition-transform duration-300 hover:scale-[1.02]">
            <QRCodeSVG
              id="qr-code-svg"
              value={accessUrl}
              size={210}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Fingerprint & Expiry */}
          <div className="bg-[#060813]/80 border border-white/5 rounded-2xl p-3.5 mb-6 text-left text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-medium">SHA-256 Fingerprint:</span>
              <span className="font-mono text-brand-300 font-semibold">{tokenFingerprint || '256-BIT-ENCRYPTED'}</span>
            </div>
            {expiresAt && (
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5 text-accent-400" /> Expiration:</span>
                <span className="text-amber-300 font-mono font-medium">{new Date(expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-all shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white text-xs font-semibold transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
          </div>

          <a
            href={accessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-semibold py-1.5 transition-colors"
          >
            <span>Open & Inspect Recipient Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

        </div>
      </div>
    </div>
  );
}
