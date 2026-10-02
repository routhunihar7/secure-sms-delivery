import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy, ExternalLink, Check, ShieldCheck, Clock } from 'lucide-react';

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
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 600, 600);
      ctx.drawImage(img, 50, 50, 500, 500);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `secure-qr-${tokenFingerprint || 'code'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          
          <h3 className="text-lg font-bold text-white mb-1">
            Secure Delivery QR Code
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Recipients can scan this QR code directly with any standard camera app to securely open the payload.
          </p>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl inline-block shadow-xl mb-4 border-4 border-teal-500/20">
            <QRCodeSVG
              id="qr-code-svg"
              value={accessUrl}
              size={220}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Fingerprint & Expiry */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 mb-5 text-left text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span>Token Fingerprint:</span>
              <span className="font-mono text-teal-400 font-medium">{tokenFingerprint || '256-BIT-SECURE'}</span>
            </div>
            {expiresAt && (
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Expiration:</span>
                <span className="text-amber-400 font-medium">{new Date(expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700/80 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors shadow-lg shadow-teal-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
          </div>

          <a
            href={accessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-medium py-1"
          >
            <span>Open & Test Recipient Link in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

        </div>
      </div>
    </div>
  );
}
