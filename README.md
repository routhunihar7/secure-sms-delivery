# 🛡️ Secure SMS Link Delivery System

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-teal.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-brightgreen.svg)](https://www.mongodb.com/)
[![Twilio](https://img.shields.io/badge/Twilio-SMS%20API-red.svg)](https://www.twilio.com/)
[![Security](https://img.shields.io/badge/Security-CSPRNG%20%7C%20SHA--256%20%7C%20JWT-amber.svg)]()

> A full-stack web application for end-to-end encrypted single-use or time-locked confidential payload delivery via SMS with cryptographically secure tokenization, voluntary recipient consent, and zero-knowledge database hashing. Designed as an enterprise-grade academic demonstration for **College Computer Networking, Cryptography, and Full-Stack Engineering**.

---

## 📑 Table of Contents

1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [Key Features](#-key-features)
3. [System Architecture & Data Flow Diagram](#-system-architecture--data-flow-diagram)
4. [Deep-Dive Networking & Protocol Analysis](#-deep-dive-networking--protocol-analysis)
   - [OSI 7-Layer Protocol Mapping](#1-osi-7-layer-protocol-mapping)
   - [Domain Name System (DNS) Resolution](#2-domain-name-system-dns-resolution)
   - [TCP 3-Way Handshake & Reliability](#3-tcp-3-way-handshake--transport-reliability)
   - [TLS 1.3 / HTTPS Cryptographic Handshake](#4-tls-13--https-cryptographic-handshake)
   - [HTTP/1.1 & REST API Interaction](#5-http11--restful-api-interaction)
   - [Twilio SMS Gateway, SMPP & Telecom SS7 Network](#6-twilio-sms-gateway-smpp--carrier-ss7-telecom-network)
   - [MongoDB TCP Wire Protocol & Connection Pooling](#7-mongodb-tcp-wire-protocol--connection-pooling)
5. [Cryptographic & Privacy Security Model](#-cryptographic--privacy-security-model)
   - [CSPRNG 256-bit Token Generation](#1-csprng-256-bit-token-generation)
   - [Zero-Knowledge SHA-256 Token Storage](#2-zero-knowledge-sha-256-token-storage)
   - [One-Time Self-Destruct Mechanism](#3-one-time-self-destruct-mechanism)
   - [Password Hashing (bcrypt-12) & JWT Bearer Sessions](#4-password-hashing-bcrypt-12--jwt-bearer-sessions)
   - [Rate Limiting, Helmet & XSS Protection](#5-rate-limiting-helmet--xss-defense)
6. [Tech Stack](#-tech-stack)
7. [Project Directory Structure](#-project-directory-structure)
8. [Setup, Installation & Quick Start](#-setup-installation--quick-start)
   - [Prerequisites](#prerequisites)
   - [Environment Configuration (`.env`)](#environment-configuration-env)
   - [Backend Installation & Start](#backend-installation--start)
   - [Frontend Installation & Start](#frontend-installation--start)
   - [Running the Mock SMS Simulator](#running-the-mock-sms-simulator)
9. [Automated Testing & Verification](#-automated-testing--verification)
10. [REST API Documentation](#-rest-api-documentation)
11. [Production Deployment Guide](#-production-deployment-guide)

---

## 🎯 Executive Summary & Problem Statement

Standard SMS messaging is unencrypted in transit across cellular radio networks, vulnerable to SIM-swapping, interception via SS7 protocol vulnerabilities, and permanent caching on telecom servers.

The **Secure SMS Link Delivery System** solves this by separating the transmission channel from the sensitive payload:
1. **Zero-Knowledge Payload Storage**: Confidential messages, credentials, or documents are stored on a hardened server indexed only by a **SHA-256 cryptographic hash** of a high-entropy 256-bit token.
2. **Minimalist SMS Dispatch**: Only a transient, unique URL containing the raw CSPRNG token (`https://domain.com/message/<token>`) is transmitted via SMS to the consenting recipient.
3. **Voluntary Decryption & Burn**: The recipient opens the link over **TLS 1.3 / HTTPS**. The backend verifies the token hash, records access audit telemetry, deciphers the payload into a responsive UI with an animated vault unlock, and **permanently burns/destroys** the token after initial viewing.

---

## ✨ Key Features

- 🔐 **256-Bit Cryptographically Secure Tokenization**: Generated with Node.js `crypto.randomBytes(32)` ($2^{256}$ search space).
- 🗄️ **Zero-Knowledge Database Storage**: Plain tokens are never stored. Only SHA-256 digests exist in MongoDB.
- 🔥 **One-Time Access (Self-Destruct)**: Link burns permanently after the first successful recipient view.
- ⏳ **Customizable Time Locks**: Presets for 10 minutes, 1 hour, 24 hours, or 7 days with automated expiration.
- 📱 **Dual SMS Delivery Modes**:
  - **Live Twilio API Mode**: Real-time SMS dispatch across global telecommunication carriers.
  - **Mock SMS Simulator Mode**: Instant local simulation with virtual phone device inbox for zero-cost demonstrations.
- 🔲 **Client-Side & Server-Side QR Code Generation**: Instant QR code download (PNG/SVG) and print capability.
- 🛡️ **Defensive Security Stack**: `bcryptjs` (12 rounds), `jsonwebtoken` (24h expiry), `express-rate-limit`, `helmet` HTTP headers, and strict E.164 phone sanitization.
- 🎨 **Modern Aesthetics**: Built with React 18, Tailwind CSS, Dark/Light mode, interactive vault unlock animations, and responsive smartphone previews.
- 📊 **Delivery Audit & History**: Real-time delivery logs, search/filtering, open status tracking, and revocation controls.
- 🌐 **Interactive Network Visualizer**: Built-in visual packet flow animator demonstrating DNS, TCP 3-way handshake, TLS 1.3, and SMPP protocols.

---

## 🏗️ System Architecture & Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ADMINISTRATOR WORKFLOW                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
   │
   │ 1. Compose Message, Phone & Expiration
   ▼
[ React SPA Dashboard ]
   │
   │ 2. HTTPS POST /api/messages (JWT Bearer Auth)
   ▼
[ Node.js + Express API ] ─── (Generates 256-bit CSPRNG Token 'T')
   │                                   │
   ├─► Computes SHA-256(T)             ├─► Constructs URL: https://app.com/message/T
   │                                   │
   ▼                                   ▼
[ MongoDB Database ]            [ Twilio REST Gateway ] ──► [ Telecom SMPP/SS7 ]
(Stores SHA-256(T) & Payload)                                         │
                                                                      │ (SMS Dispatch)
                                                                      ▼
                                                            [ Recipient Mobile Phone ]

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   RECIPIENT ACCESS FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
   │
   │ 3. Recipient taps SMS Link https://app.com/message/T
   ▼
[ Recipient Browser ]
   │
   │ 4. HTTPS GET /api/messages/T
   ▼
[ Node.js Express API ]
   │
   ├─► Calculates SHA-256(T)
   ├─► Queries MongoDB for matching Hash
   ├─► Checks Expiration & One-Time Access State
   │
   ▼
[ MongoDB Update ] ──► Sets openedAt = NOW, marks burned if one-time
   │
   ▼
[ Recipient Browser ] ──► Displays Animated Vault Unlock & Confidential Payload
```

---

## 🌐 Deep-Dive Networking & Protocol Analysis

### 1. OSI 7-Layer Protocol Mapping

| OSI Layer | Protocol / Technology in System | Role in Secure SMS Delivery |
| :--- | :--- | :--- |
| **7. Application** | `HTTP/1.1`, `HTTP/2`, `HTTPS`, `JSON REST`, `Twilio API` | Handles JSON payload encoding, JWT authentication headers, REST routes. |
| **6. Presentation** | `TLS 1.3`, `AES-256-GCM`, `BSON`, `SHA-256 Digest`, `Base64` | Encrypts data in transit, serializes MongoDB documents, formats QR matrix. |
| **5. Session** | `JWT Bearer Sessions`, `MongoDB TCP Connection Pool` | Manages persistent keep-alive database sockets and client auth state. |
| **4. Transport** | `TCP` (Transmission Control Protocol), `Port 443`, `Port 5000` | Ensures reliable, ordered byte delivery, flow control, and retransmissions. |
| **3. Network** | `IPv4`, `IPv6`, `DNS` (UDP 53), `ICMP` | Resolves domain names to IP addresses; routes IP datagrams across routers. |
| **2. Data Link** | `IEEE 802.3 Ethernet`, `Wi-Fi 802.11`, `Cellular LTE/5G MAC` | Transfers frames between adjacent network interfaces. |
| **1. Physical** | `Fiber Optics`, `Cat6 Twisted Pair`, `Cellular RF Radio Waves` | Modulates electrical, optical, and electromagnetic bitstreams. |

---

### 2. Domain Name System (DNS) Resolution

When an administrator or recipient visits `https://your-domain.com`:
1. **Local Cache Check**: The client browser checks its internal DNS cache, OS resolver cache (`hosts` file), and local gateway.
2. **Recursive Query (`UDP 53`)**: If not cached, the client OS sends a recursive DNS query to the configured DNS resolver (e.g., `8.8.8.8` or ISP resolver).
3. **Iterative Hierarchy Search**:
   - **Root Server (`.`)** $\rightarrow$ Returns `.com` Top-Level Domain (TLD) Nameservers.
   - **TLD Server (`.com`)** $\rightarrow$ Returns Authoritative Nameservers for `your-domain.com`.
   - **Authoritative Nameserver** $\rightarrow$ Returns the `A` record (IPv4: e.g. `104.21.48.91`) or `AAAA` record (IPv6).
4. **Caching**: The resolver caches the IP according to the record's **TTL (Time to Live)**.

---

### 3. TCP 3-Way Handshake & Transport Reliability

Before any HTTP/HTTPS payload can be transmitted, a reliable TCP session is negotiated:
```
Client (Port: 54218)                       Server (Port: 443)
       │                                          │
       │ 1. SYN (Sequence Number = x)             │
       ├─────────────────────────────────────────►│  Server allocates buffer &
       │                                          │  generates SYN cookie
       │ 2. SYN-ACK (Seq = y, Ack = x + 1)        │
       │◄─────────────────────────────────────────┤  State: SYN-RECEIVED
       │                                          │
       │ 3. ACK (Seq = x + 1, Ack = y + 1)        │
       ├─────────────────────────────────────────►│  State: ESTABLISHED
       │                                          │
```
- **Sequence & Acknowledgment Numbers**: Track byte offsets to reconstruct packets in exact order and detect packet loss.
- **Congestion Control & Flow Control**: Employs TCP Sliding Window and algorithms (e.g., BBR / Cubic) to prevent network saturation.

---

### 4. TLS 1.3 / HTTPS Cryptographic Handshake

Modern HTTPS uses **TLS 1.3** to establish an encrypted tunnel in a single round-trip time (1-RTT):
1. **Client Hello**: Client transmits supported cipher suites (e.g. `TLS_AES_256_GCM_SHA384`), supported TLS version (`1.3`), and an **ECDHE (Elliptic Curve Diffie-Hellman Ephemeral)** public key share (`X25519`).
2. **Server Hello & Certificate**: Server selects the cipher suite, returns its `ECDHE` key share, sends its X.509 digital certificate signed by a trusted Certificate Authority (CA), and sends an HMAC-SHA256 finished signature.
3. **Session Key Derivation**: Both client and server compute the identical symmetric master session key ($K_{session}$) independently using Diffie-Hellman math ($g^{ab} \pmod p$).
4. **Encrypted Application Data**: All subsequent HTTP requests and JSON responses are symmetrically encrypted with **AES-256-GCM** (authenticated encryption with associated data).

---

### 5. HTTP/1.1 & RESTful API Interaction

The web application communicates exclusively using **RESTful conventions** over HTTPS:
- `POST /api/auth/login` $\rightarrow$ Authenticates admin credentials, issues JWT bearer token.
- `POST /api/messages` $\rightarrow$ Accepts message body, creates CSPRNG token, stores SHA-256 hash.
- `POST /api/messages/:id/send` $\rightarrow$ Triggers SMS dispatch to recipient phone.
- `GET /api/messages/:token` $\rightarrow$ Public recipient endpoint. Validates token, enforces expiration and one-time access rules, returns sanitized payload.
- `GET /api/messages` $\rightarrow$ Admin audit query returning paginated delivery logs.
- `DELETE /api/messages/:id` $\rightarrow$ Revokes access token immediately.

---

### 6. Twilio SMS Gateway, SMPP & Carrier SS7 Telecom Network

```
[ Express Backend ]
        │  HTTPS REST API (Basic Auth over TLS)
        ▼
[ Twilio Cloud SMS Gateway ]
        │  SMPP Protocol (Short Message Peer-to-Peer v3.4 / v5.0)
        ▼
[ Carrier Short Message Service Center (SMSC) ]
        │  SS7 Protocol (Signaling System No. 7 / MAP Protocol)
        ▼
[ Home Location Register (HLR) / Visitor Location Register (VLR) ]
        │  Determines target subscriber cell tower location
        ▼
[ Base Transceiver Station (BTS / 4G eNodeB / 5G gNodeB) ]
        │  Radio Frequency (RF) Air Interface (GSM/LTE/5G NR)
        ▼
[ Recipient Mobile Handset ]
```

- **SMPP (Short Message Peer-to-Peer)**: Telecommunications industry protocol used by SMS gateways to exchange SMS messages with Mobile Network Operators (MNOs).
- **Consent Compliance (TCPA / GDPR)**: Application requires explicit sender verification of recipient consent prior to dispatch.
- **Fallback Simulation**: If Twilio credentials are omitted, the built-in **Mock SMS Simulator** intercepts the call, generates a simulated SID (`SM_MOCK_xxxxxxxx`), and displays the message in the interactive virtual phone inbox.

---

### 7. MongoDB TCP Wire Protocol & Connection Pooling

- **Wire Protocol**: The Node.js `mongoose` driver communicates with MongoDB over persistent TCP sockets using the **OP_MSG binary wire protocol** ($BSON$ serialization).
- **Connection Pooling**: Reuses a pool of 10–50 pre-established TCP connections to minimize TCP handshake overhead on high-concurrency requests.
- **Embedded In-Memory Fallback**: If a standalone MongoDB instance is not detected, the application automatically boots an embedded `mongodb-memory-server` binary, allowing zero-configuration execution.

---

## 🔒 Cryptographic & Privacy Security Model

### 1. CSPRNG 256-bit Token Generation

Tokens are generated using the OS entropy pool via Node.js `crypto.randomBytes(32)`:
$$\text{Entropy} = 32 \text{ bytes} \times 8 = 256 \text{ bits} \implies 2^{256} \approx 1.157 \times 10^{77} \text{ combinations}$$
Brute-forcing a 256-bit token is computationally infeasible under modern physics and computing architectures.

### 2. Zero-Knowledge SHA-256 Token Storage

When a link is created:
1. Server generates token $T$.
2. Server computes digest $H = \text{SHA-256}(T)$.
3. Only $H$ is written to MongoDB: `{ tokenHash: H, message: "...", expiresAt: ... }`.
4. The plain token $T$ is returned **once** to the client/SMS service and immediately discarded from server memory.

When a recipient visits `/message/T`:
1. Server computes $H' = \text{SHA-256}(T)$.
2. Server queries MongoDB: `Message.findOne({ tokenHash: H' })`.
3. Compares hashes using constant-time `crypto.timingSafeEqual` to eliminate timing side-channel attacks.

### 3. One-Time Self-Destruct Mechanism

If `isOneTime: true`:
- Upon the first successful `GET /api/messages/:token`, `openedAt` is timestamped and `viewCount` is incremented.
- Any subsequent request evaluates `message.isAccessible()`, finds `viewCount >= 1`, and returns **HTTP 410 Gone** with `"One-Time Secure Link has already been opened and burned"`.

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** (Component architecture, Hooks, Context API)
- **Vite 6** (Next-generation lightning fast build tooling)
- **Tailwind CSS 3.4** (Custom design tokens, glassmorphism, responsive UI)
- **Lucide Icons** (Clean, modern iconography)
- **qrcode.react** (Dynamic high-resolution client-side QR generation)
- **canvas-confetti** (Vault opening reward animation)
- **Axios** (Configured HTTP client with JWT interceptors)
- **React Router DOM 6** (Declarative client-side routing)

### Backend
- **Node.js 20+** (Asynchronous event-driven runtime)
- **Express.js 4.21** (RESTful API framework)
- **MongoDB & Mongoose 8** (Document database with embedded in-memory fallback)
- **Twilio Node SDK** (SMS gateway integration with Mock fallback)
- **jsonwebtoken** (Stateless authentication with HMAC-SHA256)
- **bcryptjs** (Adaptive password hashing with 12 salt rounds)
- **express-rate-limit** (Strict rate limiting on login, SMS dispatch, and token verification)
- **Helmet** (HTTP security header hardening)
- **express-validator** (Strict request sanitization and schema validation)

---

## 📁 Project Directory Structure

```
secure-sms-delivery/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB connection + in-memory fallback
│   │   │   └── env.js               # Environment variables & configuration
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login, registration, session verification
│   │   │   ├── messageController.js # Message creation, token validation, burn logic
│   │   │   └── systemController.js  # System health, simulated SMS logs, network info
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT Bearer verification
│   │   │   ├── errorHandler.js      # Centralized error handler & 404 router
│   │   │   ├── rateLimiter.js       # Tiered rate limiters (Auth, SMS, API, Tokens)
│   │   │   └── validator.js         # express-validator schemas (E.164 phone, etc.)
│   │   ├── models/
│   │   │   ├── Message.js           # Message schema, tokenHash, masked phone helper
│   │   │   └── User.js              # Admin user schema, bcrypt password hashing
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # /api/auth routes
│   │   │   ├── messageRoutes.js     # /api/messages routes
│   │   │   └── systemRoutes.js      # /api/system status & mock logs
│   │   ├── services/
│   │   │   ├── smsService.js        # Twilio client + Mock SMS simulator
│   │   │   └── tokenService.js      # CSPRNG 256-bit generator & SHA-256 hasher
│   │   ├── utils/
│   │   │   └── seedAdmin.js         # Default administrator bootstrap seeder
│   │   └── server.js                # Express application entrypoint
│   ├── test-e2e.js                  # Automated 7-step End-to-End integration test
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios client with JWT interceptors
│   │   ├── components/
│   │   │   ├── Footer.jsx           # Global footer with security badges
│   │   │   ├── LiveSimulatorModal.jsx# Simulated phone device inbox for mock SMS
│   │   │   ├── Navbar.jsx           # Top navigation, status indicator, user menu
│   │   │   ├── ProtectedRoute.jsx   # Client-side authentication route guard
│   │   │   ├── QRCodeModal.jsx      # High-res QR code viewer & PNG download
│   │   │   └── Toast.jsx            # Toast notification popup system
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Global authentication state provider
│   │   │   └── ThemeContext.jsx     # Dark/Light mode theme state provider
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx    # Message composer, presets, live phone preview
│   │   │   ├── HistoryPage.jsx      # Delivery logs table, audit modal, resend SMS
│   │   │   ├── LoginPage.jsx        # Admin sign-in with demo autofill
│   │   │   ├── MessageRecipientPage.jsx # Recipient vault unlock view
│   │   │   └── NetworkDemoPage.jsx  # Interactive networking packet simulator
│   │   ├── App.jsx                  # Main router setup
│   │   ├── index.css                # Tailwind CSS custom styles & animations
│   │   └── main.jsx                 # React root mount
│   ├── index.html                   # HTML5 template with SEO & Google Fonts
│   ├── vite.config.js               # Vite config + /api proxy
│   ├── tailwind.config.js           # Custom color palette & keyframes
│   ├── postcss.config.js
│   └── package.json
├── .env.example                     # Reference environment variables
├── .gitignore                       # Git ignore rules
└── README.md                        # Master documentation & college project report
```

---

## 🚀 Setup, Installation & Quick Start

### Prerequisites
- **Node.js**: Version 18.x or higher (`node -v`)
- **npm**: Version 9.x or higher (`npm -v`)
- *(Optional)* **MongoDB**: Local `mongod` or MongoDB Atlas URI (If unavailable, embedded memory server starts automatically)
- *(Optional)* **Twilio Account**: Account SID, Auth Token & Twilio Phone (If unavailable, Mock SMS Simulator starts automatically)

---

### Environment Configuration (`.env`)

Create `.env` in the project root or `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
PUBLIC_APP_URL=http://localhost:5173

# Database Connection (Leave default for auto-embedded memory MongoDB)
MONGODB_URI=mongodb://localhost:27017/secure_sms_delivery

# Authentication & JWT
JWT_SECRET=super_secret_jwt_key_change_in_production_min_32_chars_long_12345
JWT_EXPIRES_IN=24h

# Default Seeded Admin Account
DEFAULT_ADMIN_EMAIL=admin@securesms.local
DEFAULT_ADMIN_PASSWORD=AdminSecure@123456

# Twilio SMS API (Leave blank to use Mock SMS Simulator mode)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SMS_RATE_LIMIT_MAX=10
```

---

### Backend Installation & Start

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend in development mode:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000`. It will connect to MongoDB (or embedded memory server) and auto-seed the default admin.*

---

### Frontend Installation & Start

1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at:
   ```
   http://localhost:5173
   ```

---

### Running the Mock SMS Simulator

When running without Twilio credentials:
1. Log in at `http://localhost:5173/login` using **Auto Fill** (`admin@securesms.local` / `AdminSecure@123456`).
2. Compose a message and click **"Generate Token & Dispatch SMS"**.
3. Click the **"Mock SMS Simulator"** button in the top navbar.
4. A virtual smartphone inbox pops up displaying the simulated SMS message, destination phone number, timestamp, and clickable recipient link!

---

## 🧪 Automated Testing & Verification

The project includes an automated end-to-end integration test covering all 7 core subsystems:

```bash
cd backend
node test-e2e.js
```

### Verified Test Cases:
- [x] **Test 1**: Backend health check & system telemetry (`GET /api/system/status`)
- [x] **Test 2**: Admin login with bcrypt verification and JWT issuance (`POST /api/auth/login`)
- [x] **Test 3**: Message creation, 256-bit token generation & SHA-256 storage (`POST /api/messages`)
- [x] **Test 4**: Recipient first-time token access & payload decryption (`GET /api/messages/:token`)
- [x] **Test 5**: Verification of One-Time Token Burn (Second fetch returns `410 Gone`)
- [x] **Test 6**: Dashboard metrics aggregation (`GET /api/messages/stats/summary`)
- [x] **Test 7**: Admin delivery log audit listing (`GET /api/messages`)

---

## 📡 REST API Documentation

### 1. Authentication
- `POST /api/auth/login`
  - **Body**: `{ "email": "admin@securesms.local", "password": "AdminSecure@123456" }`
  - **Response `200`**: `{ "success": true, "token": "eyJhbGci...", "user": { ... } }`
- `GET /api/auth/me`
  - **Headers**: `Authorization: Bearer <token>`
  - **Response `200`**: `{ "success": true, "user": { ... } }`

### 2. Message Management
- `POST /api/messages`
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**:
    ```json
    {
      "recipientPhone": "+14155552671",
      "title": "Confidential Document Passcode",
      "message": "Vault PIN: 849204 | Key: Alpha-99",
      "expiresInMinutes": 60,
      "isOneTime": true,
      "consentGiven": true,
      "sendImmediately": true
    }
    ```
  - **Response `201`**:
    ```json
    {
      "success": true,
      "data": {
        "id": "679f...",
        "rawToken": "8f4c3a219e...",
        "tokenFingerprint": "8F4C-3A21-9E01",
        "accessUrl": "http://localhost:5173/message/8f4c3a219e...",
        "qrCode": "data:image/png;base64,...",
        "recipientPhoneMasked": "+1 •••• •••• 2671",
        "expiresAt": "2026-10-02T12:00:00.000Z",
        "smsStatus": "mock_sent"
      }
    }
    ```

- `GET /api/messages/:token` *(Public Recipient Route)*
  - **Params**: `:token` (64-character hex token)
  - **Response `200` (First View)**:
    ```json
    {
      "success": true,
      "status": "valid",
      "data": {
        "title": "Confidential Document Passcode",
        "message": "Vault PIN: 849204 | Key: Alpha-99",
        "isOneTime": true,
        "tokenFingerprint": "8F4C-3A21-9E01",
        "expiresAt": "2026-10-02T12:00:00.000Z"
      }
    }
    ```
  - **Response `410` (Second View / Expired)**:
    ```json
    {
      "success": false,
      "status": "already_viewed",
      "error": "This one-time secure link has already been opened and destroyed."
    }
    ```

- `GET /api/messages` *(Admin Route)*
  - **Headers**: `Authorization: Bearer <token>`
  - **Query**: `?page=1&limit=20&status=active&search=+1415`
  - **Response `200`**: List of all message records with masked phone numbers.

- `DELETE /api/messages/:id` *(Admin Route)*
  - **Headers**: `Authorization: Bearer <token>`
  - **Response `200`**: Revokes message access immediately.

---

## 🚢 Production Deployment Guide

### Option A: Full-Stack Monolith (Serve Frontend from Node.js)
1. Build the frontend production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. The compiled assets will be placed in `frontend/dist`.
3. In `backend/src/server.js`, uncomment static serving:
   ```javascript
   const path = require('path');
   app.use(express.static(path.join(__dirname, '../../frontend/dist')));
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
   });
   ```
4. Start the backend with `NODE_ENV=production node src/server.js`.

### Option B: Cloud Hosting (Render / Railway / Vercel)
1. **Backend** $\rightarrow$ Deploy on **Render / Railway / AWS EC2**:
   - Environment variables: Set `MONGODB_URI`, `JWT_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `CLIENT_URL`, `PUBLIC_APP_URL`.
   - Build Command: `npm install`
   - Start Command: `node src/server.js`
2. **Frontend** $\rightarrow$ Deploy on **Vercel / Netlify**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment variable: `VITE_API_BASE_URL=https://your-backend-domain.com/api`

---

## 🎓 Academic Viva & Presentation Highlights

When presenting this project for evaluation:
1. **Explain the Cryptographic Flow**: Emphasize that the database is *zero-knowledge* regarding the plaintext token. Even with full database access, an attacker cannot reverse the SHA-256 hash to fabricate a valid access URL.
2. **Demonstrate the Interactive Network Visualizer**: Navigate to `/network-demo` in the application and click **"Simulate End-to-End Packet Travel"** to show real-time packet movement across OSI layers.
3. **Trigger One-Time Destruction**: Show creating a link with One-Time Access enabled, opening it once in the recipient tab, and refreshing the tab to demonstrate the immediate **HTTP 410 Burn** response.
4. **Demonstrate Twilio vs Mock Mode**: Show the status indicator in the top navigation and explain how carrier SS7/SMPP routing works compared to the local mock simulator.

---

## 📄 License
This project is licensed under the MIT License - open for educational and demonstration use.
