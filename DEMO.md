# 🎬 GATI — 2-Minute Submission Video Script

> Format required by the hackathon: **max 2 minutes** — first minute demo the project **as a citizen**, second minute explain **how you built it and why you made those choices**. Both teammates may present.

## Before recording (30 seconds of prep)

1. Open the app, click **Reset sandbox** in the footer → clean, deterministic demo state.
2. Record on a **phone-width viewport** (or resize the browser) for at least part of minute 1 — judges care about mobile users.
3. Start in **Light mode + English**; you'll flip both live.
4. One tab, full screen, screen-record at 1080p. Rehearse once against a timer.

---

## Minute 1 — The citizen journey (0:00–1:00)

### 0:00 — The hook (over the homepage)
> "Paying a traffic fine or topping up FASTag today means hunting across portals and 40-field forms. Gati inverts that: it already knows what's due and fixes it in one tap."

Point at the **Autopilot feed** — pending challans, low FASTag balance, an in-progress application, all computed live from state.

### 0:12 — The killer moment: Ask Gati
- Press **⌘K**, type `pay all my challans`, hit Enter.
- **Fines settle, confetti fires, a receipt appears, the feed clears itself live.**
> "I didn't navigate anywhere. I said what I wanted — the system executed it."
- Press ⌘K again, tap the **🎙️ mic**, *say* "top up fastag 1000" → wallet updates.

### 0:32 — Bilingual + mobile, instantly
- Tap the **हिन्दी** toggle → the entire OS flips: feed, buttons, receipts, everything. Flip **dark mode** in the same breath.
- Show the phone-width view scrolling smoothly.
> "Every flow speaks the citizen's language, on the device citizens actually have."

### 0:42 — One complete journey, start to finish
Open **Challans** → show the camera-evidence photo → settle one fine through the simulated UPI modal → downloadable receipt with UTR. (Alternative: contest a fine and show the virtual-court freeze notice.)

> "Every journey here ends in a verifiable artifact — a receipt, a card, a certificate. Nothing is a dead-end mockup."

---

## Minute 2 — How & why we built it (1:00–2:00)

### 1:00 — How it's built
> "We built Gati with **Codex** as a core part of the workflow — scaffolding each journey, generating the 180-entry bilingual dictionary, and iterating on the intent parser — on Next.js and TypeScript, 100% client-side."

Show the repo / architecture for a few seconds:
- `lib/intent.ts` — natural language → **typed actions** (`settleAll`, `topup`, `resume`…)
- `lib/storage.ts` — **one storage layer** every mutation flows through
- `lib/mockData.ts` — all synthetic data in one clearly-labelled place

### 1:20 — Why these choices
> "Three deliberate choices. **One:** intent-first, because the hardest part of every sarkari portal is *finding* the right screen — so we deleted that step. **Two:** bilingual and mobile-first from day one, because that's who the real user is. **Three:** honest simulation — Vahan, Sarathi, DigiLocker and UPI are mocked and labelled as mocked, in-app, in both languages. No real Aadhaar, OTPs or payments anywhere."

### 1:40 — Scale path + close
> "To go real, you swap the storage layer for real API clients — the UI and the action bus don't change. Four statutory journeys, six speed tools, one command bar that executes. This is what Parivahan could feel like: the citizen states an intent, and the state machine does the paperwork."

**— cut at ≤ 2:00.**

---

## Q&A ammunition (for mentorship week & the live finale)

| Likely question | Answer |
|---|---|
| "Is the data real?" | No — simulated Vahan 4.0 / Sarathi / NPCI APIs, clearly labelled a sandbox in-app. The UX and state machine are the product. |
| "How would this integrate?" | Every mutation goes through one storage layer (`lib/storage.ts`); swap it for real API clients without touching UI. |
| "Why does the copilot matter?" | `lib/intent.ts` parses natural language into typed actions — the same action bus the autopilot feed uses. One execution engine, two front doors. |
| "Accessibility?" | Focus rings, aria labels, 44px touch targets, dark mode, bilingual, mobile-first. |
| "Slow connections?" | No external APIs or database after first load; fully client-side and instant thereafter. |
| "What breaks under a hard refresh?" | Nothing — SSR-safe storage guards + hydration-safe rendering; console shows zero errors. |

## Failure drills (live demo insurance)

- Anything looks stale → footer **Reset sandbox** restores a pristine state in one click.
- Confetti/sound blocked → toasts and receipts still prove the action; keep talking.
- Bad venue Wi-Fi → irrelevant: the app is 100% client-side after first load.
