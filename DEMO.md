# 🎬 GATI — 3-Minute Judge Demo Script

> Goal: in 180 seconds, prove that GATI replaces *navigation* with *intent + autopilot*, works in two languages, and ships four complete statutory journeys — not mockups.

## Before you go on stage (30 seconds of prep)

1. Open the app, click **Reset sandbox** in the footer → confirms a clean, deterministic demo state.
2. Set **Light mode** and **English** (you'll flip both live — that's part of the wow).
3. Keep one browser tab, full screen. Nothing else.

---

## The script

### 0:00 — The hook (say this over the homepage)
> "Every Indian transport portal makes you *navigate* — find a form, fill 40 fields, wait. GATI inverts that. It already knows what's due on your vehicles and fixes it in one tap."

Point at the **Active Compliance Radar** on the home page — live pending challans, low FASTag balance, in-progress applications, all computed from state, not hardcoded.

### 0:20 — The killer moment: Ask Gati
- Press **⌘K** (or click the search dock).
- Type: `pay all my challans` → hit Enter.
- **Fines settle, confetti fires, a signed receipt appears, and the radar clears itself live.**
> "I didn't navigate anywhere. I said what I wanted; the system executed it."

- Press ⌘K again, type `top up fastag 1000` → executed instantly, wallet balance updates.

### 0:50 — Bilingual, instantly
- Click the **हिन्दी** toggle in the navbar.
- **The entire OS flips to Hindi** — navigation, the autopilot feed, buttons, the payment modal, receipts, every page. Flip the **dark mode** toggle in the same breath.
> "Digital public infrastructure has to speak the citizen's language. This isn't a translated landing page — every flow, every toast, every receipt is bilingual."

### 1:10 — A complete statutory journey (pick ONE)
**Option A — VIP Number Plates** (most visual): open *VIP Number Studio* → browse rare numbers → reserve one → pay via the simulated **Bharat e-Pay** UPI modal → watch the **live HSRP plate render** with Ashoka Chakra hologram.

**Option B — E-Challan Virtual Court**: open *Challans* → show **camera evidence photo** → click *Contest / Dispute* → file a virtual-court appeal → fine enforcement freezes with a judicial notice.

### 1:50 — Speed tools blitz (20 seconds each, pick two)
- **Smart Lens OCR** (`/scan`): scan an RC → VIN extracted, expired PUCC flagged.
- **10-Second FastPass** (`/fastpass`): mint a green EV pass against a live stopwatch.
- **ADTT Simulator** (`/adtt-simulator`): the automated driving-track test with live sensor tracking.

### 2:30 — The close (over the dashboard)
> "Four complete statutory journeys, six speed tools, a natural-language command bar that *executes*, full Hindi + dark mode, zero backend — 100% client-side and deployable anywhere. This is what Parivahan 2.0 should feel like: the citizen states an intent, and the state machine does the paperwork."

---

## Q&A ammunition

| Likely question | Answer |
|---|---|
| "Is the data real?" | Simulated Vahan 4.0 / Sarathi / NPCI APIs, clearly labeled a sandbox — the UX and state machine are the product. |
| "How would this integrate?" | Every mutation goes through one storage layer (`lib/storage.ts`); swap it for real API clients without touching UI. |
| "Why does the copilot matter?" | `lib/intent.ts` parses natural language into typed actions (`topup`, `settleAll`, `resume`…) — the same action bus the autopilot feed uses. One execution engine, two front doors. |
| "Accessibility?" | Focus rings, aria labels, min 44px touch targets, dark mode, bilingual — audited pass in commit history. |
| "What breaks under a hard refresh?" | Nothing — SSR-safe storage guards + hydration-safe rendering everywhere; open the console: zero errors. |

## Failure drills (just in case)
- Anything looks stale → footer **Reset sandbox** returns to pristine state in one click.
- Confetti/sound blocked by browser → the toasts and receipts still prove the action; keep talking.
- Offline venue Wi-Fi → irrelevant: the app is 100% client-side after first load.
