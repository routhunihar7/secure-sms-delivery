import React from 'react';
import { ShieldCheck, Lock, Cpu, Globe, Server, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <span>Secure SMS Link Delivery</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Cryptographically secure payload delivery using Node.js CSPRNG 256-bit tokenization, SHA-256 hash lookup, and voluntary recipient consent.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5">Security Features</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-teal-400" /> 256-bit Random Tokenization</li>
              <li className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-teal-400" /> SHA-256 Hashed DB Lookup</li>
              <li className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-teal-400" /> Auto Self-Destruct & Expiration</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Express Rate-Limiting & Helmet</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5">Network Architecture</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-teal-400" /> DNS + TLS 1.3 / HTTPS</li>
              <li className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-teal-400" /> REST API + JSON Web Tokens</li>
              <li className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-teal-400" /> Twilio REST & SMPP Protocol</li>
              <li>
                <Link to="/network-demo" className="text-teal-400 hover:text-teal-300 underline font-medium">
                  Open Interactive Network Inspector →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5">Privacy & Compliance</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict compliance with recipient consent regulations (TCPA / GDPR). Phone numbers are masked and never exposed to the public recipient view.
            </p>
            <div className="mt-3 text-[11px] text-slate-500 font-mono">
              Demo Version 1.0.0 • College Full-Stack & Networking Project
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
