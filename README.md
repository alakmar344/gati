# Gati (गति) — Modern Indian Mobility & Vehicle Services OS

> **A simpler, clearer and more useful way to handle Indian vehicle & driving services.**
> One real problem, one complete citizen journey, built with Codex — with every mock clearly labelled.

📨 **Hackathon submission?** See **[SUBMISSION.md](./SUBMISSION.md)** (≤250-word summary, credentials, checklist) and **[DEMO.md](./DEMO.md)** (the 2-minute video script).

---

## 1️⃣ Who is facing the problem?

Every Indian vehicle owner or driver — from a scooter commuter in Kochi to a fleet operator in Chennai — who has to deal with **Parivahan's Vahan/Sarathi ecosystem**: paying e-challans, topping up FASTag, renewing a licence, registering a vehicle, getting permits, or moving a vehicle between states. That is hundreds of millions of citizens, most of them **on mobile devices, on slow connections, and many more comfortable in हिन्दी than English**.

## 2️⃣ What is difficult about the current experience?

- **Navigation is the product**: you must first *find* the right portal and the right screen among Vahan, Sarathi, e-challan, NETC and state RTO sites.
- **40-field bureaucratic forms**, unclear document requirements, and opaque application statuses.
- **Nothing is proactive**: the system knows your fine is pending and your FASTag is empty, but waits for you to discover it.
- English-heavy, desktop-oriented UIs that punish exactly the users who depend on them most.

## 3️⃣ What did we change?

**Gati kills navigation as the primary model.** It's an **intent + autopilot** mobility OS:

### 🪄 Gati Autopilot & the "Ask Gati" Copilot
- **Autopilot feed** — Gati continuously reads your live state (pending challans, low FASTag balance, in-progress applications, upcoming renewals) and surfaces a **prioritised list of things that need you**, each **resolvable in a single tap**. The feed **updates live** as work clears.
- **"Handle everything"** — one button settles all pending challans *and* restores your FASTag balance simultaneously.
- **Ask Gati (⌘K)** — a natural-language command bar that **executes**, not just navigates. Type *"top up fastag 1000"*, *"pay all my challans"*, or *"renew my licence"* and Gati does it (with confetti + a receipt), or deep-links you into a prefilled flow.
- **Voice commands 🎙️** — tap the mic and just say it. Browser speech-to-text (Web Speech API, zero extra dependencies) streams a live transcript in **English or हिन्दी** (`en-IN` / `hi-IN` follows the language toggle), and the same intent engine executes the spoken command.
- **Proactive & predictive** — Gati infers upcoming insurance/PUC renewals from your records before you think to ask.

Underneath, it combines **four complete interactive service journeys** with **six speed tools** — the *depth beneath the simplicity*, reached from the feed or the command bar instead of a cluttered menu.

## 4️⃣ Why is our version better?

| Current experience | Gati |
|---|---|
| Find the portal → find the screen → fill the form | State an intent (typed or spoken) → it's executed |
| You discover problems yourself | Autopilot surfaces them, pre-prioritised, one tap to fix |
| Status is opaque | Live feed updates as work clears; every action ends in a verifiable receipt/document |
| English-first, desktop-first | End-to-end हिन्दी/English, mobile-first, dark-mode native |
| Many portals, many logins | One OS, one command bar, one action bus |

## 5️⃣ What works today, and what is mocked?

**Works end-to-end today** — the interface, interactions and every citizen journey below run start-to-finish, live, with persistent state:
- All four statutory journeys and six speed tools listed below, the Autopilot feed, Ask Gati (text + voice), bilingual toggle, dark mode, payments UX, receipts and downloadable documents.

**Clearly-labelled simulations** (per hackathon rules — no live government systems are touched):

| Mocked dependency | How it's mocked |
|---|---|
| Vahan 4.0 / Sarathi / state RTO APIs | Synthetic records in `lib/mockData.ts` |
| DigiLocker / Aadhaar-based KYC | Simulated auto-fill; **no real Aadhaar/PAN anywhere** |
| NPCI / UPI / NETC payments | `GatiPay` simulated 4-stage settlement; no real money, no real OTPs |
| Citizen accounts | 10 synthetic personas, password `demo123`, localStorage persistence |
| Speed-camera evidence, court notices, certificates | Generated demo artifacts, watermarked as simulated |

The in-app footer carries this disclosure in **both English and हिन्दी** on every page.

## 6️⃣ How could this work safely at larger scale?

The architecture was designed so simulations are swappable, not load-bearing:
- **One storage layer** — every mutation in the app goes through `lib/storage.ts`. Going real means replacing this one module with authenticated API clients (Vahan/Sarathi/NETC), with zero UI changes.
- **One typed action bus** — `lib/intent.ts` parses natural language into typed actions (`topup`, `settleAll`, `resume`…). The autopilot feed and the command bar share the same execution engine, so auditing/authorising actions happens in exactly one place.
- **Consent & safety posture** — real deployment would sit behind DigiLocker/Aadhaar consent flows and NPCI-compliant payment rails; the prototype deliberately keeps all sensitive integrations synthetic.
- **Zero-backend prototype** → trivially hostable today; server-backed later without redesign.

## 7️⃣ Designed for real Indian users

- **🇮🇳 Fully bilingual** — one-tap हिन्दी/English, not a translated landing page: every journey, the Autopilot feed, payment modals, receipts, toasts, empty states and the command palette are localized end-to-end (180+ dictionary entries, live re-render).
- **📱 Mobile-first** — responsive layouts, 44px minimum touch targets, a bottom dock on small screens.
- **🐢 Slow-connection friendly** — no external APIs or database calls after first load; the entire app is client-side and instant thereafter.
- **♿ Accessible** — focus rings, aria labels, WCAG-conscious contrast in light *and* dark themes (FOUC-free theme script).
- **🗣️ Limited digital experience** — voice commands and one-tap autopilot actions remove form-hunting entirely.
- **🧪 Demo-safe** — SSR/hydration-clean rendering, zero console errors, one-click **Reset sandbox**.

---

## ⚡ 6 Speed & Daily-Life Mobility Tools

### 1. 🔍 Gati Smart Lens OCR (`/scan`)
- Sub-second camera and document OCR for Indian Smart RCs, PVC Driving Licences, and physical HSRP number plates (simulated OCR over demo documents).
- Extracts 17-digit VINs, engine serials, and dates.
- **Statutory Health Audit**: flags expired PUCC emission certificates, insurance lapses, and pending violations.

### 2. ⚡ 10-Second FastPass Portal (`/fastpass`)
- Simulated pre-authorized DigiLocker + biometric flow for instant single-window issuance in **under 10 seconds**:
  - *Emergency 30-Day Interstate Corridor Pass*
  - *Cryptographic Duplicate RC Pass*
  - *Zero-Emission Green EV FastPass* (100% Free)
- Live stopwatch countdown, confetti celebration, and instant QR verification pass.

### 3. 🚨 National E-Challan Radar & Virtual Court Contest (`/challans`)
- Live traffic violation radar across your fleet with simulated speed-camera photos (Delhi–Meerut Expressway, Bengaluru Sony World Junction, Khandala Ghat).
- **1-Tap Simulated UPI Settlement** with verifiable receipts.
- **Virtual Traffic Court Contest Generator**: files an appeal against erroneous automated captures with an instant judicial freeze notice.

### 4. 🛣️ FASTag Autopilot & Expressway Route Hub (`/fastag`)
- Simulated NETC wallet telemetry, low-balance emergency shields, and instant 1-tap top-ups (+₹500, +₹1,000, +₹2,000).
- **Interactive Expressway Route Toll Calculator**: Delhi–Mumbai (NE-4), Mumbai–Pune, Bengaluru–Mysuru (NH-275), Yamuna Expressway, Hyderabad ORR.

### 5. 🎮 Playable ADTT Driving Test Simulator (`/adtt-simulator`)
- Interactive HTML5 canvas simulator of Indian Automated Driving Test Tracks: 8-figure maneuver, parallel parking sensor box, reverse S-bend.
- Real-time sensor fault telemetry (kerb collision: −10 pts), timer, live scoring (80+ to pass), and track clearance certification.

### 6. 🔄 Interstate NOC Express & Road Tax Refund Calculator (`/interstate-noc`)
- Solves the interstate relocation nightmare across Karnataka, Maharashtra, Delhi, Tamil Nadu, Telangana, and Gujarat.
- Computes pro-rata road tax refunds (180-month lifespan) and tax payable on depreciated valuation in the destination state.
- Auto-generates **Form 28 (NOC)** and **Form 27 (Re-Registration)** demo dossiers in 1 click.

---

## 🚗 Four Core Interactive Workflows

| Service | Route | Description |
| :--- | :--- | :--- |
| **Vehicle Registration** | `/vehicle-licensing` | 5-step wizard with EV 0% road tax rebates, VIN decoder, simulated DigiLocker auto-KYC, simulated checkout, and downloadable **Digital Smart RC Card**. |
| **VIP Number Allocation** | `/fancy-numbers` | Live HSRP plate studio (`0001`, `0007`, `0786`, `1111`, `9999`), lucky numerology sum filter, and **90-Day Allotment Order Certificate**. |
| **Driver Licence Portal** | `/driver-licence` | Form 1A health declaration, ADTT slot booking, and an **Interactive 3D Flippable PVC DL Card**. |
| **Vehicle Permit Portal** | `/vehicle-permit` | All India Tourist Permits (AITP), goods carriers, corridor matrix, and **Form 47 National Permit Pass**. |

## 💳 GatiPay: Universal Simulated Payment Engine

- Methods: **UPI Instant** (GPay, PhonePe, Paytm, QR Scan), **RuPay / Cards**, and **Net Banking** — all simulated, no real money or OTPs.
- Realistic 4-stage processing timeline and downloadable/printable PDF-style receipts with bank UTR numbers and QR verification.

## 👤 10 Demo Personas & Client-Side Persistence

Switch between 10 synthetic Indian citizen personas with 1 click on `/login` (**password: `demo123`** for all):

1. **Vikramaditya Sharma** (Bengaluru) — EV Tech Pioneer · 2. **Priya Sundaram** (Chennai) — Logistics Fleet Operator · 3. **Arjun Singhania** (Mumbai) — Luxury Vehicle Collector · 4. **Ananya Deshmukh** (Pune) — First-Time DL Applicant · 5. **Rajeshwar Verma** (Delhi) — Interstate Bus Operator · 6. **Kavita Menon** (Kochi) — Urban Commuter · 7. **Gurpreet Singh** (Chandigarh) — Heavy Freight Transporter · 8. **Rohan Banerjee** (Kolkata) — Vintage Vehicle Restorer · 9. **Meera Joshi** (Ahmedabad) — EV Cab Fleet Partner · 10. **Amanullah Khan** (Hyderabad) — International Driving Permit Traveler

*All applications, documents, garage vehicles, challans, and FASTag balances persist locally via `localStorage`.*

---

## 🤖 How it was built (Codex)

Codex was a meaningful part of the build, not a submission checkbox:
- **Scaffolding & iteration** — each journey (challans, FASTag, licensing, permits) and the speed tools were scaffolded and iterated with Codex against the design system.
- **The intent engine** — `lib/intent.ts` (natural language → typed actions) was developed and refined through Codex iterations, including the Hindi command patterns.
- **Bilingual dictionary** — the 180+ entry English/हिन्दी i18n dictionary in `lib/i18n.tsx` was generated and reconciled with Codex.
- **Review passes** — accessibility, SSR/hydration safety and dark-mode contrast audits were run as AI-assisted review loops.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/) · **Language**: [TypeScript](https://www.typescriptlang.org/) · **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/) · **Micro-Interactions**: [Framer Motion](https://www.framer.com/motion/) & [Canvas-Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Deployment**: Vercel-ready — zero external database or API key requirements.

## 🚀 Quick Start

```bash
git clone https://github.com/alakmar344/gati.git
cd gati
npm install
npm run dev        # http://localhost:3000
# production:
npm run build && npm start
```

**Demo login**: `/login` → pick any persona (e.g. `vikram@demo.gati.in`) → password `demo123`.

> 🎬 Recording the submission video? Follow the timed 2-minute script in **[DEMO.md](./DEMO.md)**.

---

## ⚖️ Trust & Compliance Disclosure

> **Disclaimer**: Gati is an independent design prototype created for demonstration and hackathon purposes. It is **not an official government website, ministry portal, or state transport department service**, and no government approval or partnership is implied. It does not connect to, test, or interfere with any live government system. All payment transactions, registration cards, driving licences, challans, and permit documents generated inside the prototype are simulated demo artifacts built entirely from synthetic data — no real Aadhaar numbers, PAN details, passwords, OTPs, or payment information are used or collected.
