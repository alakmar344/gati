# Gati (गति) — Modern Indian Mobility & Vehicle Services OS

> **A radically better digital public service experience for Indian vehicle and driving services.**  
> Inspired by serene landscape aesthetics, frosted glassmorphism, bold editorial typography, and 10x-speed everyday mobility workflows.

---

## 🌟 Overview

Traditional transport portals are plagued by 40-field bureaucratic forms, unclear document requirements, opaque status tracking, and confusing fees. Even a good portal still makes you *navigate* — find the right screen, fill a form, figure out what's next.

**Gati (गति)** kills navigation as the primary model. It's an **intent + autopilot** mobility OS: the system already knows who you are and what's due, tells you its plan, and completes the work in one tap.

### 🪄 Gati Autopilot & the "Ask Gati" Copilot
- **Autopilot feed** — Gati continuously reads your live state (pending challans, low FASTag balance, in-progress applications, upcoming renewals) and surfaces a **prioritised list of things that need you**, each **resolvable in a single tap** — pay a fine, *pay every fine at once*, top up, or resume a flow. The feed **updates live** as work clears.
- **“Handle everything”** — one button settles all pending challans *and* restores your FASTag balance simultaneously.
- **Ask Gati (⌘K)** — a natural-language command bar that **executes**, not just navigates. Type *“top up fastag 1000”*, *“pay all my challans”*, or *“renew my licence”* and Gati does it (with confetti + a receipt), or deep-links you into a prefilled flow.
- **Proactive & predictive** — Gati infers upcoming insurance/PUC renewals from your records before you think to ask.

Underneath, it still combines **four complete interactive service journeys** with **six breakthrough speed tools** — but they're now the *depth beneath the simplicity*, reached from the feed or the command bar instead of a cluttered menu.

---

## 🇮🇳 Fully Bilingual & Dark-Mode Native

- **One-tap हिन्दी / English toggle** — not a translated landing page: every journey, the Autopilot feed, payment modals, receipts, toasts, empty states, and the command palette are localized end-to-end (180+ dictionary entries, live re-render on switch).
- **True dark mode** — FOUC-free (blocking theme script), token-driven claymorphism surfaces, WCAG-conscious contrast in both themes.
- **Demo-safe** — SSR/hydration-clean rendering, zero console errors, and a one-click **Reset sandbox** that restores a pristine demo state.

> 🎬 Judging or presenting? See **[DEMO.md](./DEMO.md)** for a timed 3-minute demo script with Q&A ammunition.

---

## 📸 Visual Design Language

Inspired by cinematic landscape imagery and modern interface design:
- **Atmospheric Palette**: Soft sky azure, emerald valley greens, mint accents, and deep obsidian slate.
- **Frosted Glassmorphism**: Translucent surfaces (`backdrop-blur-xl`), delicate borders, and floating containers.
- **Authentic Indian HSRP License Plates**: Realistic High-Security Plates with blue `IND` bands, Ashoka Chakra holograms, and laser-etched security PINs across Private White, Luxury Black, EV Green, and Commercial Yellow themes.
- **Micro-Interactions**: Interactive 3D flippable PVC driving licence cards, live sensor collision tracking, and confetti checkout celebrations.

---

## ⚡ 6 Revolutionary Speed & Daily-Life Mobility Tools

### 1. 🔍 Gati Smart Lens OCR (`/scan`)
- Sub-second camera and document OCR for Indian Smart RCs, PVC Driving Licences, and physical HSRP number plates.
- Automatically extracts 17-digit VINs, engine serials, and dates with 100% precision.
- **Statutory Health Audit**: Instantly flags expired PUCC emission certificates, insurance lapses, and pending violations.

### 2. ⚡ 10-Second FastPass Portal (`/fastpass`)
- Pre-authorized DigiLocker + Aadhaar biometric integration for instant single-window issuance in **under 10 seconds**:
  - *Emergency 30-Day Interstate Corridor Pass*
  - *Cryptographic Duplicate RC Pass*
  - *Zero-Emission Green EV FastPass* (100% Free)
- Live stopwatch countdown timer, confetti celebration, and instant QR verification pass.

### 3. 🚨 National E-Challan Radar & Virtual Court Contest (`/challans`)
- Live traffic violation radar across your fleet with automated speed camera photos (Delhi-Meerut Expressway, Bengaluru Sony World Junction, Khandala Ghat).
- **1-Tap Simulated UPI Settlement**: Settle fines in seconds with verifiable receipts.
- **Virtual Traffic Court Contest Generator**: Generates official legal representations for erroneous automated camera captures with instant judicial freeze notices.

### 4. 🛣️ FASTag Autopilot & Expressway Route Hub (`/fastag`)
- Real-time NETC wallet balance telemetry, low-balance emergency shields, and instant 1-tap top-ups (+₹500, +₹1,000, +₹2,000).
- **Interactive Expressway Route Toll Calculator**: Live distance, travel time, and toll budget for:
  - *Delhi - Mumbai Expressway (NE-4)*
  - *Mumbai - Pune Expressway*
  - *Bengaluru - Mysuru Expressway (NH-275)*
  - *Yamuna Expressway*
  - *Hyderabad Outer Ring Road (ORR)*

### 5. 🎮 Playable ADTT Driving Test Simulator (`/adtt-simulator`)
- Interactive HTML5 canvas simulator of Indian Automated Driving Test Tracks (ADTT):
  - *♾️ 8-Figure Maneuver (Steering & Trajectory)*
  - *🅿️ Parallel Parking Sensor Box*
  - *🔄 Reverse S-Bend Track*
- Real-time sensor fault telemetry (kerb collision detection: -10 pts per touch), timer, live scoring (80+ to pass), and track clearance certification.

### 6. 🔄 Interstate NOC Express & Road Tax Refund Calculator (`/interstate-noc`)
- Solves the interstate vehicle relocation nightmare across Karnataka, Maharashtra, Delhi, Tamil Nadu, Telangana, and Gujarat.
- Computes pro-rata road tax refunds from origin state RTOs (based on 180-month lifespan).
- Calculates exact tax payable on depreciated vehicle valuation in the destination state.
- Auto-generates official **Form 28 (NOC)** and **Form 27 (Re-Registration)** dossiers in 1 click.

---

## 🚗 Four Core Interactive Workflows

| Service | Route | Description |
| :--- | :--- | :--- |
| **Vehicle Registration** | `/vehicle-licensing` | 5-step wizard with EV 0% road tax rebates, VIN decoder, DigiLocker auto-KYC, simulated checkout, and downloadable **Digital Smart RC Card**. |
| **VIP Number Allocation** | `/fancy-numbers` | Live HSRP plate studio (`0001`, `0007`, `0786`, `1111`, `9999`), lucky numerology sum filter, and official **90-Day Allotment Order Certificate**. |
| **Driver Licence Portal** | `/driver-licence` | Form 1A health declaration, Automated Driving Test Track (ADTT) slot booking, and an **Interactive 3D Flippable PVC DL Card**. |
| **Vehicle Permit Portal** | `/vehicle-permit` | All India Tourist Permits (AITP), Goods carriers, corridor matrix, and **Form 47 National Permit Pass**. |

---

## 💳 GatiPay: Universal Simulated Payment Engine

- Methods: **UPI Instant** (GPay, PhonePe, Paytm, QR Scan), **RuPay / Cards**, and **Net Banking**.
- **Realistic 4-Stage Processing Timeline**:
  1. *Initiating encrypted 256-bit handshake with NPCI...*
  2. *Allocating statutory treasury credit to State RTO...*
  3. *Validating cryptographic settlement ledger...*
  4. *Payment verified & digital receipt minted!*
- Downloadable/printable PDF-style simulated payment receipts with bank UTR numbers and QR verification.

---

## 👤 10 Demo Personas & Client-Side Persistence

Switch effortlessly between 10 realistic Indian citizen personas with 1 click:
1. **Vikramaditya Sharma** (Bengaluru) — EV Tech Pioneer (Tata Nexon EV owner)
2. **Priya Sundaram** (Chennai) — Logistics Fleet Operator (18 Commercial Trucks)
3. **Arjun Singhania** (Mumbai) — Luxury Vehicle Collector
4. **Ananya Deshmukh** (Pune) — First-Time Applicant for DL
5. **Rajeshwar Verma** (Delhi) — Interstate Tourist Bus Operator
6. **Kavita Menon** (Kochi) — Urban Commuter & Scooter Owner
7. **Gurpreet Singh** (Chandigarh) — Heavy Freight Transporter
8. **Rohan Banerjee** (Kolkata) — Vintage Vehicle Restorer
9. **Meera Joshi** (Ahmedabad) — Urban EV Cab Fleet Partner
10. **Amanullah Khan** (Hyderabad) — International Driving Permit Traveler

*All applications, documents, garage vehicles, challans, and FASTag balances persist locally via `localStorage`.*

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Micro-Interactions**: [Framer Motion](https://www.framer.com/motion/) & [Canvas-Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Deployment**: Vercel-Ready (Zero external database or API key requirements)

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/alakmar344/gati.git
cd gati
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## ⚖️ Trust & Compliance Disclosure

> **Disclaimer**: Gati is an independent design prototype created for demonstration and hackathon purposes. It is not an official government website, ministry portal, or state transport department service. All payment transactions, registration cards, driving licences, challans, and permit documents generated inside the prototype are simulated demo artifacts.
