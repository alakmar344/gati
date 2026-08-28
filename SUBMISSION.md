# 📨 Hackathon Submission Pack — Gati (गति)

> Everything needed for the submission form, in one place.
> **Deadline: August 28, 2026 · 8:00 PM IST — no grace period.**

---

## ✅ Submission checklist

| # | Requirement | Status / Where |
|---|---|---|
| 1 | **Live public link** (opens in browser, no access request, no app download) | Deploy to Vercel: `vercel --prod` → paste the URL. Verify it opens in an **incognito window** before submitting. |
| 2 | **Mock consumer login credentials** | Any of the 10 personas on `/login` — e.g. email `vikram@demo.gati.in`, password `demo123` (every persona uses `demo123`; the login page 1-click-fills them). |
| 3 | **Video ≤ 2 minutes** | Script in **[DEMO.md](./DEMO.md)** — minute 1: citizen demo, minute 2: how & why it was built. |
| 4 | **Project summary < 250 words** | Copy-paste block below (≈240 words). |
| 5 | **Partner's registered email** (blank if solo) | Both teammates must register and submit each other's registered email. |
| 6 | **Same email at every step** | Stage 1 shortlist (Aug 28–Sep 1) → Stage 2 mentorship + resubmit by **Sep 7, 2026** → finalists announced Sep 8–12 → live finale in Bengaluru **Sep 12, 2026**. |

Before submitting: open every link in an incognito window to confirm nothing asks for access.

---

## 📝 Project summary (copy-paste, <250 words)

> **Gati (गति)** rethinks India's vehicle and driving services — the journeys citizens today endure across Parivahan's Vahan/Sarathi portals: paying e-challans, FASTag top-ups, licence and RC applications, permits and interstate NOCs. The current experience means hunting across portals, 40-field forms, unclear document lists, opaque statuses and English-heavy desktop UIs.
>
> Gati inverts the model from *navigation* to **intent + autopilot**. An Autopilot feed reads the citizen's live state — pending fines, low FASTag balance, expiring documents, stalled applications — and resolves each item in **one tap**, or everything at once via "Handle everything." **Ask Gati (⌘K)**, a natural-language command bar with voice input in English and हिन्दी, *executes* commands ("pay all my challans", "top up fastag 1000") instead of merely linking to pages.
>
> Every journey works end-to-end today: challan settlement and virtual-court contest, FASTag wallet, vehicle registration, driving licence with a playable test-track simulator, VIP numbers, permits and interstate NOC — each ending in a verifiable receipt or document. The entire OS is bilingual, dark-mode native, mobile-first and lightweight for slow connections.
>
> **Honesty:** all government systems (Vahan, Sarathi, DigiLocker, NPCI/UPI) are clearly-labelled simulations; data is synthetic and persists client-side. No real Aadhaar, PAN, OTPs or payments are used.
>
> **Scale path:** every mutation flows through one storage layer and one typed action bus — swapping simulations for real APIs requires no UI changes. Built with Codex as a core part of the workflow.

---

## 🔑 Mock credentials (for the form's credentials field)

```
URL:      <your deployed link>/login
Email:    vikram@demo.gati.in   (or 1-click any of the 10 personas)
Password: demo123
```

No OTP, no signup, no real personal data — the login is a labelled demo sandbox.

---

## 🚫 Compliance self-check (from the "what not to do" list)

- ✅ No live government system is accessed, tested or interfered with — 100% client-side simulation.
- ✅ No private/undocumented APIs, no scraping — all data is hand-authored synthetic mock data (`lib/mockData.ts`).
- ✅ No real Aadhaar, PAN, passwords, OTPs, payment or health data anywhere in the repo.
- ✅ Not presented as an official government product — in-app disclaimer in the footer (English + हिन्दी) and in the README.
- ✅ No government logos used in a way suggesting approval or partnership.
- ✅ All code and assets are original or properly licensed (open-source npm packages).
