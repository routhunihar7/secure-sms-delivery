import React from 'react';
import { ShieldCheck, Lock, Cpu, Globe, Server, Hash, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#070913]/90 backdrop-blur-xl mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-white tracking-tight">Secure SMS</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Zero-knowledge ephemeral payload dispatch platform with cryptographically secure CSPRNG 256-bit tokenization and recipient authorization.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400/90 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              All systems operational
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-brand-400" />
              Security Architecture
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <Lock className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>256-bit CSPRNG Entropy</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <Hash className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>SHA-256 Vault Hash Ring</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <Cpu className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>Self-Destruct (Burn-on-Read)</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>Helmet & IP Rate-Limiting</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-accent-400" />
              Infrastructure
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <Globe className="w-3.5 h-3.5 text-accent-400 shrink-0" />
                <span>TLS 1.3 End-to-End Tunnel</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <Server className="w-3.5 h-3.5 text-accent-400 shrink-0" />
                <span>Stateless JWT Auth Guard</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition-colors">
                <Cpu className="w-3.5 h-3.5 text-accent-400 shrink-0" />
                <span>Twilio REST & SMPP Pipeline</span>
              </li>
              <li className="pt-1">
                <Link to="/network-demo" className="text-brand-400 hover:text-brand-300 font-medium inline-flex items-center gap-1 hover:underline">
                  Live Network Inspector →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Compliance & Privacy</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Strict adherence to recipient consent frameworks (TCPA / GDPR). Phone numbers are strictly masked and sensitive payloads never stored in cleartext.
            </p>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-slate-400 font-mono">
              Enterprise Grade • End-to-End Cryptographic Isolation
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Secure SMS Link Delivery System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 transition-colors">RFC-7519 Compliant</span>
            <span className="hover:text-slate-300 transition-colors">AES-256 / SHA-256</span>
            <span className="hover:text-slate-300 transition-colors">Zero Knowledge</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
