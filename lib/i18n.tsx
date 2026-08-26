'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi';

export const DICTIONARY = {
  en: {
    // Brand & App
    appName: 'GATI',
    appTagline: 'Parivahan OS',
    heroTag: 'National Digital Transport Portal · भारत Parivahan 2.0',
    taglineSubtitle: 'A 10x faster, zero-paperwork digital infrastructure for Indian vehicle registration, driver licensing, and national transit passes.',

    // Navigation & Global
    services: 'Services',
    speedTools: 'Speed Tools',
    track: 'Track Status',
    dashboard: 'Dashboard',
    askGati: 'FastTrack Command',
    askGatiPlaceholder: 'Search any transport service, license renewal, or challan…',
    switchPersona: 'Switch Persona',
    demoProfiles: 'Demo Profiles',
    demoBadge: 'MoRTH Prototype Sandbox',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
    notifications: 'Notifications',

    // Hero Cockpit
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    heroHeadingMain: 'Unified Indian Transport Services.',
    heroHeadingHighlight: 'Instant & 100% Paperless.',
    heroHeadingPersonal: 'Your Digital Vehicle Command Center.',
    heroSearchPlaceholderPrefix: 'Search service or fast command',
    hoursSaved: 'hours saved for citizens',
    zeroForms: 'Zero physical paperwork',
    pressK: '⌘K for Fast Command',

    // Command Dock / Action Hub
    allActions: 'All Parivahan Services',
    vehicleRc: 'Vehicle & RC (VAHAN)',
    driverLicence: 'Licence & ADTT (SARATHI)',
    tollsPasses: 'FASTag & Corridor Tolls',
    instantTools: 'Speed Tools & OCR',
    searchServicesPlaceholder: 'Search any transport service, fee, license renewal, or reference ID…',

    // Service Names & Descriptions
    svcVehicleLicensing: 'Vehicle Registration & Smart RC',
    svcVehicleLicensingDesc: 'Paperless registration for new vehicles, ownership transfers, and green EV fleets.',
    svcFancyNumbers: 'VIP & Choice Plates Studio',
    svcFancyNumbersDesc: 'Reserve rare choice numbers with live HSRP plate studio and instant allotment.',
    svcDriverLicence: 'Driving Licence & Online ADTT',
    svcDriverLicenceDesc: 'Apply for learner & permanent licences, book automated track slots, and get 3D PVC cards.',
    svcVehiclePermit: 'Commercial Transport Permit',
    svcVehiclePermitDesc: 'All India Tourist Permits (AITP) and interstate goods carrier clearance with zero border tax.',

    // Speed Tools
    toolScan: 'Smart Lens Document OCR',
    toolScanDesc: 'Instant camera OCR for RC, DL, Insurance & PUCC status',
    toolFastpass: '10-Second FastPass',
    toolFastpassDesc: 'Instant emergency interstate corridor and green EV passes',
    toolChallans: 'E-Challan Radar & Virtual Court',
    toolChallansDesc: 'Real-time traffic camera fines, 1-tap UPI pay & court dispute',
    toolFastag: 'FASTag 1-Click Hub',
    toolFastagDesc: 'Instant toll wallet top-up & NHAI expressway toll calculator',
    toolInterstate: 'Interstate Transfer & NOC',
    toolInterstateDesc: 'Road-tax refund calculator with Form 28 & 27 auto-dossiers',
    toolAdtt: 'Online ADTT Test',
    toolAdttDesc: 'Official sensor track competency evaluation (8-track, parking & hill hold)',

    // Action Feed / Copilot
    autopilotTitle: 'Active Compliance Radar',
    autopilotSubtitle: 'Proactive compliance monitor watching pending challans, FASTag balances, and document expiries.',
    predictedBadge: 'High Priority Action',
    runAction: 'Resolve',
    resolved: 'All Clear',
    noActions: 'All systems clear! No pending vehicle or compliance actions required.',
    viewAllGarage: 'View Digital Garage',

    // Common Actions
    startNow: 'Start FastTrack',
    exploreService: 'Explore Service',
    viewDetails: 'View Details',
    back: 'Back',
    continue: 'Continue',
    submit: 'Submit Application',
    pay: 'Pay & Issue',
    downloadPdf: 'Download Official PDF',
    printCard: 'Print Document',
    verified: 'DigiLocker Verified',
    issued: 'Issued & Active',
    inProgress: 'In Progress',
    savedToLocker: 'Saved to GatiLocker',

    // Dashboard
    citizenProfile: 'Citizen Profile',
    applications: 'Applications',
    digitalGarage: 'Digital Garage',
    payments: 'Payment Receipts',
    smartCards: 'Issued Smart Cards',
    newApplication: 'New Service Application',
  },
  hi: {
    // Brand & App
    appName: 'गति',
    appTagline: 'परिवहन ओएस',
    heroTag: 'राष्ट्रीय डिजिटल परिवहन मंच · भारत परिवहन 2.0',
    taglineSubtitle: 'भारतीय वाहन एवं चालक सेवाओं के लिए तीव्र एवं आधुनिक 100% पेपरलेस डिजिटल लोक सेवा मंच।',

    // Navigation & Global
    services: 'सेवाएं',
    speedTools: 'त्वरित टूल्स',
    track: 'स्थिति जांचें',
    dashboard: 'डैशबोर्ड',
    askGati: 'फास्टट्रैक कमांड',
    askGatiPlaceholder: 'किसी भी परिवहन सेवा, चालान या लाइसेंस को खोजें…',
    switchPersona: 'प्रोफाइल बदलें',
    demoProfiles: 'डेमो प्रोफाइल्स',
    demoBadge: 'प्रोटोटाइप सैंडबॉक्स',
    themeLight: 'लाइट',
    themeDark: 'डार्क',
    language: 'भाषा',
    notifications: 'सूचनाएं',

    // Hero Cockpit
    goodMorning: 'शुभ प्रभात',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    heroHeadingMain: 'एकीकृत भारतीय परिवहन सेवाएं।',
    heroHeadingHighlight: 'त्वरित एवं 100% पेपरलेस।',
    heroHeadingPersonal: 'आपका डिजिटल वाहन नियंत्रण केंद्र।',
    heroSearchPlaceholderPrefix: 'सेवा या कमांड खोजें',
    hoursSaved: 'घंटे नागरिकों द्वारा बचाए गए',
    zeroForms: 'शून्य कागजी कार्यवाही',
    pressK: 'कमांड के लिए ⌘K',

    // Command Dock / Action Hub
    allActions: 'सभी परिवहन सेवाएं',
    vehicleRc: 'वाहन एवं आरसी (वाहन)',
    driverLicence: 'लाइसेंस एवं टेस्ट (सारथी)',
    tollsPasses: 'फास्टैग एवं टोल',
    instantTools: 'त्वरित टूल्स एवं स्कैनर',
    searchServicesPlaceholder: 'किसी भी परिवहन सेवा, शुल्क, आवेदन या दस्तावेज़ को खोजें…',

    // Service Names & Descriptions
    svcVehicleLicensing: 'वाहन पंजीकरण एवं स्मार्ट आरसी',
    svcVehicleLicensingDesc: 'नए वाहनों, स्वामित्व हस्तांतरण और ग्रीन ईवी फ्लीट के लिए 100% पेपरलेस रजिस्ट्रेशन।',
    svcFancyNumbers: 'वीआईपी एवं पसंदीदा नंबर प्लेट्स',
    svcFancyNumbersDesc: 'प्रतिष्ठित भारतीय नंबर श्रृंखला की लाइव एचएसआरपी स्टूडियो और त्वरित आवंटन।',
    svcDriverLicence: 'ड्राइविंग लाइसेंस एवं ऑनलाइन एडीटीटी',
    svcDriverLicenceDesc: 'ड्राइविंग लाइसेंस आवेदन, स्वचालित ड्राइविंग ट्रैक टेस्ट और 3D पीवीसी कार्ड।',
    svcVehiclePermit: 'व्यावसायिक परिवहन परमिट',
    svcVehiclePermitDesc: 'अखिल भारतीय पर्यटक परमिट (AITP) और शून्य सीमा कर के साथ राष्ट्रीय मालवाहक परमिट।',

    // Speed Tools
    toolScan: 'स्मार्ट लेंस दस्तावेज़ ओसीआर',
    toolScanDesc: 'आरसी, डीएल और बीमा का त्वरित कैमरा ओसीआर एवं स्थिति जांच',
    toolFastpass: '10-सेकंड फास्टपास',
    toolFastpassDesc: 'आपातकालीन अंतर्राज्यीय कॉरिडोर एवं ग्रीन ईवी पास',
    toolChallans: 'ई-चालान रडार एवं वर्चुअल कोर्ट',
    toolChallansDesc: 'ट्रैफिक कैमरा चालान, 1-टैप यूपीआई भुगतान और कोर्ट अपील',
    toolFastag: 'फास्टैग 1-क्लिक हब',
    toolFastagDesc: 'त्वरित टोल वॉलेट रीचार्ज और एनएचएआई टोल कैलकुलेटर',
    toolInterstate: 'अंतर्राज्यीय एनओसी एवं टैक्स',
    toolInterstateDesc: 'राज्य स्थानांतरण कर एवं रोड टैक्स कैलकुलेटर व फॉर्म 28/27',
    toolAdtt: 'ऑनलाइन एडीटीटी टेस्ट',
    toolAdttDesc: 'स्वचालित सेंसर ट्रैक ड्राइविंग क्षमता परीक्षण (8-ट्रैक, पार्किंग और ढलान)',

    // Action Feed / Copilot
    autopilotTitle: 'सक्रिय अनुपालन रडार',
    autopilotSubtitle: 'लंबित चालान, फास्टैग बैलेंस और दस्तावेज़ समाप्ति की सक्रिय निगरानी।',
    predictedBadge: 'प्राथमिकता कार्रवाई',
    runAction: 'समाधान करें',
    resolved: 'सब कुछ दुरुस्त है',
    noActions: 'सब कुछ दुरुस्त है! कोई लंबित वाहन कार्रवाई शेष नहीं है।',
    viewAllGarage: 'डिजिटल गैरेज देखें',

    // Common Actions
    startNow: 'शुरू करें',
    exploreService: 'सेवा देखें',
    viewDetails: 'विवरण देखें',
    back: 'वापस',
    continue: 'आगे बढ़ें',
    submit: 'आवेदन जमा करें',
    pay: 'भुगतान व जारी करें',
    downloadPdf: 'आधिकारिक पीडीएफ डाउनलोड',
    printCard: 'दस्तावेज़ प्रिंट करें',
    verified: 'डिजिलॉकर सत्यापित',
    issued: 'जारी एवं सक्रिय',
    inProgress: 'प्रगति पर है',
    savedToLocker: 'गति लॉकर में सुरक्षित',

    // Dashboard
    citizenProfile: 'नागरिक प्रोफाइल',
    applications: 'आवेदन',
    digitalGarage: 'डिजिटल गैरेज',
    payments: 'भुगतान रसीदें',
    smartCards: 'जारी स्मार्ट कार्ड्स',
    newApplication: 'नया सेवा आवेदन',
  },
} as const;

export type TranslationKey = keyof typeof DICTIONARY['en'];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gati_language') as Language | null;
      if (saved === 'en' || saved === 'hi') {
        setLanguageState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('gati_language', lang);
      window.dispatchEvent(new CustomEvent('gati_language_changed', { detail: lang }));
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = DICTIONARY[language] || DICTIONARY.en;
    const val = dict[key];
    if (val !== undefined) return val;
    return fallback || DICTIONARY.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (k, fb) => DICTIONARY.en[k] || fb || String(k),
    };
  }
  return context;
};
