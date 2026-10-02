const mongoose = require('mongoose');
const smsService = require('../services/smsService');
const config = require('../config/env');

/**
 * GET /api/system/status
 */
const getSystemStatus = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const smsMode = smsService.isLiveMode() ? 'twilio_live' : 'mock_simulator';

  return res.status(200).json({
    success: true,
    data: {
      appName: 'Secure SMS Link Delivery System',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      environment: config.nodeEnv,
      database: {
        status: dbStatus,
        host: mongoose.connection.host || 'embedded-memory',
        name: mongoose.connection.name || 'secure_sms_delivery',
      },
      smsService: {
        mode: smsMode,
        isLive: smsService.isLiveMode(),
        senderPhoneMasked: config.twilio.phoneNumber
          ? config.twilio.phoneNumber.slice(0, 4) + '••••' + config.twilio.phoneNumber.slice(-2)
          : 'MOCK-SIMULATOR',
      },
      security: {
        tokenAlgorithm: 'CSPRNG-256bit + SHA-256',
        passwordHashing: 'bcrypt-12-rounds',
        sessionAuth: 'JWT Bearer (HMAC-SHA256)',
        rateLimiting: 'Active (express-rate-limit)',
        headersSecurity: 'Helmet enabled',
        cors: 'Configured',
      },
    },
  });
};

/**
 * GET /api/system/sms-logs
 * Inspect simulated SMS deliveries in Mock Mode
 */
const getSmsLogs = (req, res) => {
  const logs = smsService.getMockLogs();
  return res.status(200).json({
    success: true,
    data: logs,
    count: logs.length,
    mode: smsService.isLiveMode() ? 'live' : 'mock_simulator',
  });
};

/**
 * GET /api/system/network-info
 * Returns detailed networking and protocol metadata for academic / presentation demonstrations
 */
const getNetworkInfo = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      layers: [
        {
          layer: 7,
          name: 'Application Layer',
          protocols: ['HTTP/1.1 & HTTP/2', 'HTTPS (TLS)', 'JSON REST API', 'Twilio REST API'],
          description: 'Handles client requests, JSON payload formatting, authentication headers, and response serialization.',
        },
        {
          layer: 6,
          name: 'Presentation Layer',
          protocols: ['TLS 1.3 / SSL', 'BSON Serialization', 'Base64 & Hex Encoding', 'CSPRNG Tokenization'],
          description: 'Handles encryption, decryption, compression, and format translation between client and MongoDB.',
        },
        {
          layer: 5,
          name: 'Session Layer',
          protocols: ['JWT (JSON Web Tokens)', 'MongoDB TCP Connection Pool', 'Keep-Alive Sockets'],
          description: 'Maintains authenticated sessions and persistent database connection pooling.',
        },
        {
          layer: 4,
          name: 'Transport Layer',
          protocols: ['TCP (Transmission Control Protocol)'],
          description: 'Guarantees reliable, ordered byte streams via TCP 3-way handshake (SYN -> SYN-ACK -> ACK) and congestion control.',
        },
        {
          layer: 3,
          name: 'Network Layer',
          protocols: ['IPv4 / IPv6', 'ICMP', 'DNS Resolution (UDP 53)'],
          description: 'Routes IP datagrams across the public Internet and internal cloud subnets.',
        },
        {
          layer: 2,
          name: 'Data Link Layer',
          protocols: ['Ethernet IEEE 802.3', 'Wi-Fi 802.11', 'Cellular LTE / 5G Radio Link'],
          description: 'Transfers frames between adjacent network nodes over physical/wireless mediums.',
        },
        {
          layer: 1,
          name: 'Physical Layer',
          protocols: ['Fiber Optics', 'Copper Cat6', 'RF Electromagnetic Waves (Cell Towers)'],
          description: 'Transmits raw bitstreams over optical, electrical, and radio frequency channels.',
        },
      ],
      flowSteps: [
        {
          step: 1,
          title: 'DNS Resolution',
          protocol: 'UDP / Port 53',
          actor: 'Browser -> DNS Resolver',
          summary: 'Client resolves domain name to target IP address via recursive DNS lookups.',
        },
        {
          step: 2,
          title: 'TCP 3-Way Handshake',
          protocol: 'TCP',
          actor: 'Client -> Server',
          summary: 'SYN -> SYN-ACK -> ACK establishes a stateful, reliable full-duplex connection.',
        },
        {
          step: 3,
          title: 'TLS 1.3 Handshake',
          protocol: 'HTTPS / TLS 1.3',
          actor: 'Client <-> Server',
          summary: 'Asymmetric cryptography negotiates ephemeral session keys for AES-256-GCM symmetric encryption.',
        },
        {
          step: 4,
          title: 'Secure Message Creation & Tokenization',
          protocol: 'REST / POST',
          actor: 'Admin Dashboard -> Express API',
          summary: 'Server generates a 256-bit CSPRNG token, computes SHA-256 digest, and saves to MongoDB.',
        },
        {
          step: 5,
          title: 'SMS Gateway Dispatch',
          protocol: 'HTTPS REST / SMPP',
          actor: 'Express API -> Twilio API -> Telecom Carrier (SS7/SMPP) -> Recipient Device',
          summary: 'Server securely invokes Twilio REST API, which forwards via telecom Short Message Peer-to-Peer protocol to mobile cell tower.',
        },
        {
          step: 6,
          title: 'Recipient Link Access & One-Time Burn',
          protocol: 'HTTPS GET',
          actor: 'Recipient Mobile -> Express API -> MongoDB',
          summary: 'Recipient visits unique URL. Server verifies SHA-256 hash, delivers encrypted content, and invalidates token.',
        },
      ],
    },
  });
};

module.exports = {
  getSystemStatus,
  getSmsLogs,
  getNetworkInfo,
};
