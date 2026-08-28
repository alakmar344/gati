import {
  Car,
  Sparkles,
  CreditCard,
  Compass,
  ScanLine,
  Zap,
  AlertTriangle,
  Radio,
  ShieldCheck,
  Repeat,
  LayoutDashboard,
  Search,
  FolderLock,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { TranslationKey } from './i18n';

export interface NavItem {
  name: string;
  short?: string;
  href: string;
  icon: LucideIcon;
  desc: string;
  /** tailwind text + bg tint used for the icon chip */
  tint: string;
  keywords?: string;
  /** i18n dictionary keys so surfaces can localise name/desc */
  nameKey?: TranslationKey;
  descKey?: TranslationKey;
  shortKey?: TranslationKey;
}

type Translator = (key: TranslationKey, fallback?: string) => string;

/** Localised display name for a nav item (falls back to the English literal). */
export function navItemName(item: NavItem, t: Translator): string {
  return item.nameKey ? t(item.nameKey, item.name) : item.name;
}

/** Localised description for a nav item (falls back to the English literal). */
export function navItemDesc(item: NavItem, t: Translator): string {
  return item.descKey ? t(item.descKey, item.desc) : item.desc;
}

/** Localised compact name for tight surfaces like the footer. */
export function navItemShort(item: NavItem, t: Translator): string {
  if (item.shortKey) return t(item.shortKey, item.short || item.name);
  return item.short || navItemName(item, t);
}

/** The four flagship end-to-end service journeys. */
export const CORE_SERVICES: NavItem[] = [
  {
    name: 'Vehicle Registration',
    short: 'Registration',
    shortKey: 'shortVehicleLicensing',
    href: '/vehicle-licensing',
    nameKey: 'svcVehicleLicensing',
    descKey: 'svcVehicleLicensingDesc',
    icon: Car,
    desc: 'New RC, transfers, EV road-tax rebates & instant Smart RC card.',
    tint: 'text-olive-800 bg-olive-100 dark:text-olive-300 dark:bg-olive-950/60',
    keywords: 'rc register vehicle licensing smart card road tax ev',
  },
  {
    name: 'VIP Number Plates',
    short: 'VIP Plates',
    shortKey: 'shortFancyNumbers',
    href: '/fancy-numbers',
    nameKey: 'svcFancyNumbers',
    descKey: 'svcFancyNumbersDesc',
    icon: Sparkles,
    desc: 'Reserve rare choice numbers with live HSRP plate studio.',
    tint: 'text-saffron-700 bg-saffron-100 dark:text-saffron-300 dark:bg-saffron-950/60',
    keywords: 'fancy vip number plate 0001 0007 auction numerology',
  },
  {
    name: 'Driver Licence',
    short: 'Driver Licence',
    shortKey: 'shortDriverLicence',
    href: '/driver-licence',
    nameKey: 'svcDriverLicence',
    descKey: 'svcDriverLicenceDesc',
    icon: CreditCard,
    desc: 'LL, DL & IDP with ADTT slot booking and 3D PVC card.',
    tint: 'text-ashoka-800 bg-ashoka-100 dark:text-ashoka-300 dark:bg-ashoka-950/60',
    keywords: 'dl driving licence learner idp adtt slot pvc card',
  },
  {
    name: 'Vehicle Permits',
    short: 'Permits',
    shortKey: 'shortVehiclePermit',
    href: '/vehicle-permit',
    nameKey: 'svcVehiclePermit',
    descKey: 'svcVehiclePermitDesc',
    icon: Compass,
    desc: 'All-India Tourist, goods carrier & interstate corridor permits.',
    tint: 'text-olive-700 bg-olive-100 dark:text-olive-300 dark:bg-olive-950/60',
    keywords: 'permit aitp goods carrier national interstate form 47',
  },
];

/** Fast, single-purpose power tools — grouped under progressive disclosure. */
export const SPEED_TOOLS: NavItem[] = [
  {
    name: 'Smart Lens OCR',
    short: 'Lens OCR',
    shortKey: 'shortScan',
    href: '/scan',
    nameKey: 'toolScan',
    descKey: 'toolScanDesc',
    icon: ScanLine,
    desc: 'Scan any RC or plate to extract VIN & flag expired PUCC.',
    tint: 'text-olive-800 bg-olive-100 dark:text-olive-300 dark:bg-olive-950/60',
    keywords: 'scan ocr camera vin pucc lens document',
  },
  {
    name: '10-Second FastPass',
    short: 'FastPass',
    shortKey: 'shortFastpass',
    href: '/fastpass',
    nameKey: 'toolFastpass',
    descKey: 'toolFastpassDesc',
    icon: Zap,
    desc: 'Mint interstate & green EV passes with one biometric tap.',
    tint: 'text-saffron-700 bg-saffron-100 dark:text-saffron-300 dark:bg-saffron-950/60',
    keywords: 'fastpass instant pass biometric digilocker green ev',
  },
  {
    name: 'E-Challan Radar',
    short: 'Challans',
    shortKey: 'shortChallans',
    href: '/challans',
    nameKey: 'toolChallans',
    descKey: 'toolChallansDesc',
    icon: AlertTriangle,
    desc: 'Inspect camera evidence, 1-tap UPI pay, or contest in court.',
    tint: 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/60',
    keywords: 'challan fine violation traffic court dispute upi settle',
  },
  {
    name: 'FASTag Hub',
    short: 'FASTag',
    shortKey: 'shortFastag',
    href: '/fastag',
    nameKey: 'toolFastag',
    descKey: 'toolFastagDesc',
    icon: Radio,
    desc: 'Live wallet balance, 1-tap top-up & expressway toll calculator.',
    tint: 'text-ashoka-800 bg-ashoka-100 dark:text-ashoka-300 dark:bg-ashoka-950/60',
    keywords: 'fastag toll netc wallet balance topup expressway',
  },
  {
    name: 'Online ADTT Test',
    short: 'ADTT Test',
    href: '/adtt-simulator',
    nameKey: 'toolAdtt',
    descKey: 'toolAdttDesc',
    icon: ShieldCheck,
    desc: 'Official sensor track competency evaluation — 8-figure, parking & hill hold.',
    tint: 'text-olive-900 bg-olive-200/80 dark:text-olive-200 dark:bg-olive-900/50',
    keywords: 'adtt online test driving competency sensor track cmvr 8 figure parking',
  },
  {
    name: 'Interstate NOC',
    short: 'Interstate NOC',
    href: '/interstate-noc',
    nameKey: 'toolInterstate',
    descKey: 'toolInterstateDesc',
    icon: Repeat,
    desc: 'Road-tax refund calculator with Form 28 & 27 auto-dossiers.',
    tint: 'text-olive-700 bg-olive-100 dark:text-olive-300 dark:bg-olive-950/60',
    keywords: 'noc interstate relocation road tax refund form 28 27',
  },
];

/** Personal account surfaces. */
export const ACCOUNT_LINKS: NavItem[] = [
  {
    name: 'Dashboard',
    nameKey: 'acctDashboard',
    descKey: 'acctDashboardDesc',
    href: '/dashboard',
    icon: LayoutDashboard,
    desc: 'Applications, digital garage & payment history.',
    tint: 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800',
    keywords: 'dashboard home account applications garage',
  },
  {
    name: 'Track Application',
    nameKey: 'acctTrack',
    descKey: 'acctTrackDesc',
    href: '/track',
    icon: Search,
    desc: 'Live status timeline for any reference number.',
    tint: 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800',
    keywords: 'track status timeline reference',
  },
  {
    name: 'GatiLocker Documents',
    nameKey: 'acctDocuments',
    descKey: 'acctDocumentsDesc',
    href: '/documents',
    icon: FolderLock,
    desc: 'All issued smart cards, licences & permits.',
    tint: 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800',
    keywords: 'documents gatilocker cards licences permits',
  },
  {
    name: 'Demo Personas',
    nameKey: 'acctPersonas',
    descKey: 'acctPersonasDesc',
    href: '/login',
    icon: Users,
    desc: 'Browse the 10 demo citizen profiles.',
    tint: 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800',
    keywords: 'login personas demo accounts users switch',
  },
];

export const ALL_NAV: NavItem[] = [...CORE_SERVICES, ...SPEED_TOOLS, ...ACCOUNT_LINKS];
