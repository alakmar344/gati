'use client';

import { DemoUser, AnyApplication, StoredDocument, PaymentReceipt, ChallanRecord, FastagAccount } from './types';
import { DEMO_USERS, INITIAL_SEED_APPLICATIONS, MOCK_CHALLANS, MOCK_FASTAG } from './mockData';
import { generateUTR, generateTransactionId } from './utils';

const USER_STORAGE_KEY = 'gati_current_user_v1';
const APPLICATIONS_STORAGE_KEY = 'gati_applications_v1';
const DOCUMENTS_STORAGE_KEY = 'gati_documents_v1';
const PAYMENTS_STORAGE_KEY = 'gati_payments_v1';
const CHALLANS_STORAGE_KEY = 'gati_challans_v1';
const FASTAG_STORAGE_KEY = 'gati_fastag_v1';

export function getCurrentUser(): DemoUser {
  if (typeof window === 'undefined') return DEMO_USERS[0];
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const matched = DEMO_USERS.find(u => u.id === parsed.id);
      return matched || parsed;
    }
  } catch (e) {
    console.error('Error loading current user:', e);
  }
  return DEMO_USERS[0];
}

export function setCurrentUser(user: DemoUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('gati_user_changed'));
  } catch (e) {
    console.error('Error saving current user:', e);
  }
}

export function getAllApplications(): AnyApplication[] {
  if (typeof window === 'undefined') return INITIAL_SEED_APPLICATIONS;
  try {
    const saved = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_APPLICATIONS));
    return INITIAL_SEED_APPLICATIONS;
  } catch (e) {
    console.error('Error loading applications:', e);
    return INITIAL_SEED_APPLICATIONS;
  }
}

export function getApplicationsForUser(userId: string): AnyApplication[] {
  const all = getAllApplications();
  return all.filter(app => app.userId === userId);
}

export function getApplicationByRef(ref: string): AnyApplication | undefined {
  const all = getAllApplications();
  const cleanRef = ref.trim().toUpperCase();
  return all.find(app => 
    app.referenceNumber.toUpperCase() === cleanRef || 
    app.id.toUpperCase() === cleanRef ||
    app.referenceNumber.replace(/[^A-Z0-9]/g, '') === cleanRef.replace(/[^A-Z0-9]/g, '')
  );
}

export function saveApplication(application: AnyApplication): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getAllApplications();
    const existingIndex = all.findIndex(a => a.id === application.id || a.referenceNumber === application.referenceNumber);
    
    let updated: AnyApplication[];
    if (existingIndex >= 0) {
      updated = [...all];
      updated[existingIndex] = { ...application, updatedAt: new Date().toISOString() };
    } else {
      updated = [application, ...all];
    }
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('gati_applications_updated'));
  } catch (e) {
    console.error('Error saving application:', e);
  }
}

export function getAllDocuments(): StoredDocument[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading documents:', e);
  }
  return [];
}

export function saveDocument(doc: StoredDocument): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getAllDocuments();
    const existingIndex = all.findIndex(d => d.id === doc.id || d.referenceId === doc.referenceId);
    let updated: StoredDocument[];
    if (existingIndex >= 0) {
      updated = [...all];
      updated[existingIndex] = doc;
    } else {
      updated = [doc, ...all];
    }
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('gati_documents_updated'));
  } catch (e) {
    console.error('Error saving document:', e);
  }
}

export function getAllPayments(): PaymentReceipt[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading payments:', e);
  }
  return [];
}

export function savePayment(payment: PaymentReceipt): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getAllPayments();
    const updated = [payment, ...all.filter(p => p.transactionId !== payment.transactionId)];
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('gati_payments_updated'));
  } catch (e) {
    console.error('Error saving payment:', e);
  }
}

export function getAllChallans(): ChallanRecord[] {
  if (typeof window === 'undefined') return MOCK_CHALLANS;
  try {
    const saved = localStorage.getItem(CHALLANS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(CHALLANS_STORAGE_KEY, JSON.stringify(MOCK_CHALLANS));
    return MOCK_CHALLANS;
  } catch (e) {
    console.error('Error loading challans:', e);
    return MOCK_CHALLANS;
  }
}

export function updateChallanStatus(challanId: string, status: 'PAID' | 'DISPUTED', paymentRef?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getAllChallans();
    const updated = all.map(c => {
      if (c.id === challanId) {
        return { ...c, status, paymentRef: paymentRef || c.paymentRef };
      }
      return c;
    });
    localStorage.setItem(CHALLANS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('gati_challans_updated'));
  } catch (e) {
    console.error('Error updating challan:', e);
  }
}

/** One-tap challan settlement — mints a receipt, marks PAID, and persists. */
export function settleChallan(challanId: string, payer?: DemoUser): PaymentReceipt | null {
  const all = getAllChallans();
  const challan = all.find((c) => c.id === challanId);
  if (!challan || challan.status === 'PAID') return null;
  const user = payer || getCurrentUser();
  const receipt: PaymentReceipt = {
    transactionId: generateTransactionId(),
    utrNumber: generateUTR(),
    date: new Date().toISOString(),
    amount: challan.amount,
    convenienceFee: 0,
    gst: 0,
    totalPaid: challan.amount,
    paymentMethod: 'UPI',
    paymentGateway: 'GatiPay NPCI FastTrack (Simulated)',
    serviceType: 'challans',
    serviceTitle: `E-Challan ${challan.challanNumber} — ${challan.violationType}`,
    applicationNumber: challan.challanNumber,
    status: 'SUCCESS',
    payerName: user.name,
    payerEmail: user.email,
  };
  savePayment(receipt);
  updateChallanStatus(challanId, 'PAID', receipt.transactionId);
  return receipt;
}

/** Batch settle multiple challans in one action. */
export function settleAllChallans(ids: string[], payer?: DemoUser): PaymentReceipt[] {
  const receipts: PaymentReceipt[] = [];
  ids.forEach((id) => {
    const r = settleChallan(id, payer);
    if (r) receipts.push(r);
  });
  return receipts;
}

export function getFastagAccount(): FastagAccount {
  if (typeof window === 'undefined') return MOCK_FASTAG;
  try {
    const saved = localStorage.getItem(FASTAG_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(FASTAG_STORAGE_KEY, JSON.stringify(MOCK_FASTAG));
    return MOCK_FASTAG;
  } catch (e) {
    console.error('Error loading fastag:', e);
    return MOCK_FASTAG;
  }
}

export function topupFastagWallet(amount: number): FastagAccount {
  const current = getFastagAccount();
  const updated: FastagAccount = {
    ...current,
    walletBalance: current.walletBalance + amount,
    status: (current.walletBalance + amount > 200) ? 'ACTIVE' : current.status
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(FASTAG_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('gati_fastag_updated'));
  }
  return updated;
}

export function resetDemoState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(APPLICATIONS_STORAGE_KEY);
  localStorage.removeItem(DOCUMENTS_STORAGE_KEY);
  localStorage.removeItem(PAYMENTS_STORAGE_KEY);
  localStorage.removeItem(CHALLANS_STORAGE_KEY);
  localStorage.removeItem(FASTAG_STORAGE_KEY);
  localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_APPLICATIONS));
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEMO_USERS[0]));
  localStorage.setItem(CHALLANS_STORAGE_KEY, JSON.stringify(MOCK_CHALLANS));
  localStorage.setItem(FASTAG_STORAGE_KEY, JSON.stringify(MOCK_FASTAG));
  window.dispatchEvent(new Event('gati_user_changed'));
  window.dispatchEvent(new Event('gati_applications_updated'));
}
