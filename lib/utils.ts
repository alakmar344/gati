import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateReferenceNumber(servicePrefix: 'VL' | 'FN' | 'DL' | 'VP'): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `GATI-${servicePrefix}-${year}-${randomDigits}`;
}

export function generateUTR(): string {
  const timestamp = Date.now().toString().slice(-6);
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `UTR${timestamp}${randomHex}`;
}

export function generateTransactionId(): string {
  const rand = Math.floor(10000000 + Math.random() * 90000000);
  return `TXN-GATI-${rand}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Just now';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}
