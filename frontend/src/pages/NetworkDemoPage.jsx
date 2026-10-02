import React, { useState } from 'react';
import { 
  Network, 
  Globe, 
  ShieldCheck, 
  Server, 
  Database, 
  Smartphone, 
  Radio, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  Lock, 
  Hash, 
  Layers,
  Activity,
  Zap,
  Repeat
} from 'lucide-react';

export default function NetworkDemoPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const steps = [
    {
      id: 1,
      name: 'DNS Resolution',
      protocol: 'UDP / Port 53',
      layer: 'Layer 7 (Application) -> Layer 4 (UDP) -> Layer 3 (IP)',
      sender: 'Admin Browser',
      receiver: 'Recursive DNS Resolver',
      description: 'The browser queries the local/ISP DNS resolver for the IP address corresponding to the target domain name (e.g. your-domain.com).',
      packetHeader: 'DNS Query (Standard query 0x1a4f A your-domain.com)',
      security: 'DNSSEC (Domain Name System Security Extensions) authenticates cryptographic response records.',
      status: 'Resolved: 104.21.48.91 (TTL 300s)',
    },
    {
      id: 2,
      name: 'TCP 3-Way Handshake',
      protocol: 'TCP / Port 443',
      layer: 'Layer 4 (Transport Layer)',
      sender: 'Client OS Network Stack',
      receiver: 'Web Server Network Stack',
      description: 'Establishes a reliable, full-duplex byte stream connection between client and server before transmitting any application data.',
      packetHeader: '1. SYN (seq=0) -> 2. SYN-ACK (seq=0, ack=1) -> 3. ACK (seq=1, ack=1)',
      security: 'TCP Sequence numbers prevent packet injection and ensure in-order delivery with sliding window flow control.',
      status: 'Connection State: ESTABLISHED',
    },
    {
      id: 3,
      name: 'TLS 1.3 Cryptographic Handshake',
      protocol: 'TLS 1.3 / HTTPS',
      layer: 'Layer 6 (Presentation Layer)',
      sender: 'Client Browser',
      receiver: 'Web Server / Reverse Proxy',
      description: 'Negotiates cryptographic cipher suites (e.g. TLS_AES_256_GCM_SHA384) using Elliptic Curve Diffie-Hellman (ECDHE) ephemeral key exchange.',
      packetHeader: 'Client Hello (supported_versions: TLS 1.3, key_share: X25519) <-> Server Hello + Finished',
      security: 'Forward Secrecy: Compromising future server private keys cannot decrypt past recorded sessions.',
      status: 'Encrypted Tunnel Active: AES-256-GCM',
    },
    {
      id: 4,
      name: 'Encrypted REST API Invocation',
      protocol: 'HTTPS / JSON REST API',
      layer: 'Layer 7 (Application Layer)',
      sender: 'Admin React Single Page App',
      receiver: 'Node.js Express Backend',
      description: 'Admin browser sends an encrypted POST request containing recipient phone, message body, and JWT Bearer authorization header.',
      packetHeader: 'POST /api/messages HTTP/1.1 | Host: api.domain.com | Authorization: Bearer eyJhbGciOi...',
      security: 'Rate limited by express-rate-limit; sanitized with express-validator; protected against XSS/CSRF.',
      status: 'HTTP/1.1 201 Created (Duration: 34ms)',
    },
    {
      id: 5,
      name: 'CSPRNG Tokenization & SHA-256 Hashing',
      protocol: 'Node.js Crypto API & MongoDB Wire Protocol',
      layer: 'Layer 7 / Presentation (BSON Serialization)',
      sender: 'Express Backend Service',
      receiver: 'MongoDB Replica / Storage Engine',
      description: 'Server generates 256 bits of cryptographically secure pseudo-random entropy (crypto.randomBytes(32)). Computes SHA-256 hash digest and saves to MongoDB via persistent TCP socket pool.',
      packetHeader: 'OP_MSG (MongoDB Wire Protocol) insert into secure_sms_delivery.messages',
      security: 'Zero-Knowledge Storage: Plain token is NEVER stored in database. Only one-way SHA-256 digest is persisted.',
      status: 'Token Hash Indexed: e3b0c44298fc1c149afbf4c8996fb924...',
    },
    {
      id: 6,
      name: 'Twilio SMS Gateway & Telecom SS7/SMPP',
      protocol: 'HTTPS REST -> SMPP (Short Message Peer-to-Peer)',
      layer: 'Application -> Telecom SS7 / LTE Radio Interface',
      sender: 'Express Backend',
      receiver: 'Twilio Cloud -> Mobile Carrier SMSC -> Recipient Phone',
      description: 'Express server dispatches secure link via Twilio REST API. Twilio routes via carrier SMS Center (SMSC) across SMPP protocols to the recipient cell tower radio tower.',
      packetHeader: 'SMPP submit_sm (source_addr: +123456, dest_addr: +14155552671, esm_class: 0x00)',
      security: 'Voluntary recipient consent confirmed (TCPA / GDPR compliance). Phone number is masked in public logs.',
      status: 'SMS Delivered to Carrier Base Station',
    },
    {
      id: 7,
      name: 'Recipient Voluntary Link Access & Token Invalidation',
      protocol: 'HTTPS GET / One-Time Token Burn',
      layer: 'Layer 7 Application Layer',
      sender: 'Recipient Mobile Browser',
      receiver: 'Express API -> MongoDB Storage',
      description: 'Recipient opens unique token link. Server computes SHA-256(token), verifies against database record, checks expiration window, logs access audit metadata, and burns the token if one-time access.',
      packetHeader: 'GET /api/messages/8f4c3a219e... HTTP/1.1',
      security: 'Timing-safe hash comparison (crypto.timingSafeEqual) prevents side-channel timing attacks.',
      status: 'Message Decrypted & Token Burned (410 on subsequent requests)',
    },
  ];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setActiveStep(0);

    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      if (current >= steps.length) {
        clearInterval(timer);
        setIsSimulating(false);
      } else {
        setActiveStep(current);
      }
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Network className="w-6 h-6 text-teal-400" />
            <span>Interactive Network Architecture Inspector</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual breakdown of the complete packet flow, transport protocols, cryptographic handshakes, and carrier telecom routing
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
        >
          {isSimulating ? (
            <>
              <Activity className="w-4 h-4 animate-spin text-teal-200" />
              <span>Packet Simulation Active...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Simulate End-to-End Packet Travel</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Step Navigator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {steps.map((step, idx) => {
          const isCurrent = activeStep === idx;
          const isPassed = activeStep > idx;

          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                isCurrent
                  ? 'bg-teal-500/20 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                  : isPassed
                  ? 'bg-slate-900/80 border-slate-700 text-slate-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-teal-400">
                  Step {step.id}
                </span>
                {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {isCurrent && <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />}
              </div>
              <div className="font-semibold text-xs truncate">{step.name}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{step.protocol}</div>
            </button>
          );
        })}
      </div>

      {/* Step Detail Spotlight Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border-teal-500/30 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Info (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
              <Layers className="w-4 h-4" />
              <span>{steps[activeStep].layer}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {steps[activeStep].name}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {steps[activeStep].description}
            </p>

            {/* Nodes Connection Bar */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
              <span className="font-semibold text-slate-200">{steps[activeStep].sender}</span>
              <ArrowRight className="w-4 h-4 text-teal-400 flex-shrink-0 animate-pulse" />
              <span className="font-semibold text-teal-300">{steps[activeStep].receiver}</span>
            </div>

            {/* Security Guarantee */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Cryptographic & Security Guarantee
              </div>
              <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                {steps[activeStep].security}
              </p>
            </div>

          </div>

          {/* Right Inspector Box (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 font-mono text-xs">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                Live Packet Frame
              </span>
              <span className="text-[10px] text-slate-500">{steps[activeStep].protocol}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase mb-1">Packet Payload & Headers:</span>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-teal-300 text-[11px] break-all leading-relaxed">
                {steps[activeStep].packetHeader}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase mb-1">State Transition / Status:</span>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 text-[11px]">
                {steps[activeStep].status}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>Step {activeStep + 1} of {steps.length}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                  disabled={activeStep === 0}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30"
                >
                  Prev
                </button>
                <button
                  onClick={() => setActiveStep((s) => Math.min(steps.length - 1, s + 1))}
                  disabled={activeStep === steps.length - 1}
                  className="px-2.5 py-1 rounded bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* OSI 7-Layer Comparison Table */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800">
        
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-400" />
          <span>Full OSI 7-Layer Protocol Stack Mapping</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          How every component of the Secure SMS Link Delivery System maps directly to the standard ISO/OSI networking model
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">OSI Layer</th>
                <th className="py-3 px-4">System Implementation</th>
                <th className="py-3 px-4">Protocols & Standards</th>
                <th className="py-3 px-4">Security Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-teal-400">Layer 7: Application</td>
                <td className="py-3 px-4">React Dashboard, Express REST APIs, Twilio API</td>
                <td className="py-3 px-4 font-mono text-slate-400">HTTP/1.1, HTTP/2, JSON, Twilio REST</td>
                <td className="py-3 px-4 text-emerald-400">JWT Bearer, CSPRNG Tokenization, Rate Limiting</td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-teal-400">Layer 6: Presentation</td>
                <td className="py-3 px-4">Payload encryption, BSON Serialization, QR Matrix</td>
                <td className="py-3 px-4 font-mono text-slate-400">TLS 1.3, BSON, SHA-256 Digest</td>
                <td className="py-3 px-4 text-emerald-400">AES-256-GCM, One-way cryptographic hashing</td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-teal-400">Layer 5: Session</td>
                <td className="py-3 px-4">Client JWT Auth sessions, Mongoose TCP connection pool</td>
                <td className="py-3 px-4 font-mono text-slate-400">JWT Sessions, MongoDB Socket Pool</td>
                <td className="py-3 px-4 text-emerald-400">Auto-expiring signed tokens (24h lifespan)</td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-teal-400">Layer 4: Transport</td>
                <td className="py-3 px-4">Reliable TCP transport, Port 443 (HTTPS), Port 5000 (API)</td>
                <td className="py-3 px-4 font-mono text-slate-400">TCP (Transmission Control Protocol)</td>
                <td className="py-3 px-4 text-emerald-400">SYN Cookies, TCP sequence verification</td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-teal-400">Layer 3: Network</td>
                <td className="py-3 px-4">Internet routing, Cloud VPC subnets, DNS lookup</td>
                <td className="py-3 px-4 font-mono text-slate-400">IPv4, IPv6, ICMP, DNS (UDP 53)</td>
                <td className="py-3 px-4 text-emerald-400">VPC firewall ingress/egress rules, DNSSEC</td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-teal-400">Layer 2: Data Link</td>
                <td className="py-3 px-4">Local Ethernet, Wi-Fi frames, Cellular LTE / 5G</td>
                <td className="py-3 px-4 font-mono text-slate-400">IEEE 802.3, 802.11ax, 3GPP LTE MAC</td>
                <td className="py-3 px-4 text-emerald-400">WPA3-Enterprise, SIM-based cryptographic auth</td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-teal-400">Layer 1: Physical</td>
                <td className="py-3 px-4">Fiber optical cables, Copper Cat6, RF radio waves</td>
                <td className="py-3 px-4 font-mono text-slate-400">Photonic fiber, RF Carrier waves</td>
                <td className="py-3 px-4 text-emerald-400">Physical carrier facility isolation</td>
              </tr>

            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
