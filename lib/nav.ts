import {
  Car,
  Sparkles,
  CreditCard,
  Compass,
  ScanLine,
  Zap,
  AlertTriangle,
  Radio,
  Gamepad2,
  Repeat,
  LayoutDashboard,
  Search,
  FolderLock,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  name: string;
  short?: string;
  href: string;
  icon: LucideIcon;
  desc: string;
  /** tailwind text + bg tint used for the icon chip */
  tint: string;
  keywords?: string;
}

/** The four flagship end-to-end service journeys. */
export const CORE_SERVICES: NavItem[] = [
  {
    name: 'Vehicle Registration',
    short: 'Registration',
    href: '/vehicle-licensing',
    icon: Car,
    desc: 'New RC, transfers, EV road-tax rebates & instant Smart RC card.',
    tint: 'text-emerald-700 bg-emerald-100',
    keywords: 'rc register vehicle licensing smart card road tax ev',
  },
  {
    name: 'VIP Number Plates',
    short: 'VIP Plates',
    href: '/fancy-numbers',
    icon: Sparkles,
    desc: 'Reserve rare choice numbers with live HSRP plate studio.',
    tint: 'text-amber-700 bg-amber-100',
    keywords: 'fancy vip number plate 0001 0007 auction numerology',
  },
  {
    name: 'Driver Licence',
    short: 'Driver Licence',
    href: '/driver-licence',
    icon: CreditCard,
    desc: 'LL, DL & IDP with ADTT slot booking and 3D PVC card.',
    tint: 'text-sky-700 bg-sky-100',
    keywords: 'dl driving licence learner idp adtt slot pvc card',
  },
  {
    name: 'Vehicle Permits',
    short: 'Permits',
    href: '/vehicle-permit',
    icon: Compass,
    desc: 'All-India Tourist, goods carrier & interstate corridor permits.',
    tint: 'text-teal-700 bg-teal-100',
    keywords: 'permit aitp goods carrier national interstate form 47',
  },
];

/** Fast, single-purpose power tools — grouped under progressive disclosure. */
export const SPEED_TOOLS: NavItem[] = [
  {
    name: 'Smart Lens OCR',
    short: 'Lens OCR',
    href: '/scan',
    icon: ScanLine,
    desc: 'Scan any RC or plate to extract VIN & flag expired PUCC.',
    tint: 'text-emerald-700 bg-emerald-100',
    keywords: 'scan ocr camera vin pucc lens document',
  },
  {
    name: '10-Second FastPass',
    short: 'FastPass',
    href: '/fastpass',
    icon: Zap,
    desc: 'Mint interstate & green EV passes with one biometric tap.',
    tint: 'text-amber-700 bg-amber-100',
    keywords: 'fastpass instant pass biometric digilocker green ev',
  },
  {
    name: 'E-Challan Radar',
    short: 'Challans',
    href: '/challans',
    icon: AlertTriangle,
    desc: 'Inspect camera evidence, 1-tap UPI pay, or contest in court.',
    tint: 'text-rose-700 bg-rose-100',
    keywords: 'challan fine violation traffic court dispute upi settle',
  },
  {
    name: 'FASTag Hub',
    short: 'FASTag',
    href: '/fastag',
    icon: Radio,
    desc: 'Live wallet balance, 1-tap top-up & expressway toll calculator.',
    tint: 'text-sky-700 bg-sky-100',
    keywords: 'fastag toll netc wallet balance topup expressway',
  },
  {
    name: 'ADTT Simulator',
    short: 'ADTT Game',
    href: '/adtt-simulator',
    icon: Gamepad2,
    desc: 'Practice the sensor test track — 8-figure & parallel parking.',
    tint: 'text-violet-700 bg-violet-100',
    keywords: 'adtt simulator game driving test track 8 figure parking',
  },
  {
    name: 'Interstate NOC',
    short: 'Interstate NOC',
    href: '/interstate-noc',
    icon: Repeat,
    desc: 'Road-tax refund calculator with Form 28 & 27 auto-dossiers.',
    tint: 'text-teal-700 bg-teal-100',
    keywords: 'noc interstate relocation road tax refund form 28 27',
  },
];

/** Personal account surfaces. */
export const ACCOUNT_LINKS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    desc: 'Applications, digital garage & payment history.',
    tint: 'text-slate-700 bg-slate-100',
    keywords: 'dashboard home account applications garage',
  },
  {
    name: 'Track Application',
    href: '/track',
    icon: Search,
    desc: 'Live status timeline for any reference number.',
    tint: 'text-slate-700 bg-slate-100',
    keywords: 'track status timeline reference',
  },
  {
    name: 'GatiLocker Documents',
    href: '/documents',
    icon: FolderLock,
    desc: 'All issued smart cards, licences & permits.',
    tint: 'text-slate-700 bg-slate-100',
    keywords: 'documents gatilocker cards licences permits',
  },
  {
    name: 'Demo Personas',
    href: '/login',
    icon: Users,
    desc: 'Browse the 10 demo citizen profiles.',
    tint: 'text-slate-700 bg-slate-100',
    keywords: 'login personas demo accounts users switch',
  },
];

export const ALL_NAV: NavItem[] = [...CORE_SERVICES, ...SPEED_TOOLS, ...ACCOUNT_LINKS];
