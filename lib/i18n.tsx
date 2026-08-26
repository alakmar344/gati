'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi';

export const DICTIONARY = {
  en: {
    // Brand & App
    appName: 'GATI',
    appTagline: 'Mobility OS',
    heroTag: 'Gati Autopilot · भारत Mobility OS',
    taglineSubtitle: 'A radically faster digital public service platform for Indian vehicle and driver services.',

    // Navigation & Global
    services: 'Services',
    speedTools: 'Speed Tools',
    track: 'Track',
    dashboard: 'Dashboard',
    askGati: 'Ask Gati',
    askGatiPlaceholder: 'Ask Gati to do something…',
    switchPersona: 'Switch Persona',
    demoProfiles: 'Demo Profiles',
    demoBadge: 'Prototype Sandbox',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
    notifications: 'Notifications',

    // Hero Cockpit
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    heroHeadingMain: 'Tell Gati what you need.',
    heroHeadingHighlight: 'It gets done.',
    heroHeadingPersonal: 'What should I handle?',
    heroSearchPlaceholderPrefix: 'Ask Gati to',
    hoursSaved: 'hours saved with Gati',
    zeroForms: 'Zero physical paperwork',
    pressK: '⌘K to Ask',

    // Command Dock / Action Hub
    allActions: 'All Services',
    vehicleRc: 'Vehicle & RC',
    driverLicence: 'Licence & ADTT',
    tollsPasses: 'FastPass & Tolls',
    instantTools: 'Instant Tools',
    searchServicesPlaceholder: 'Search any transport service, fee, or document…',

    // Service Names & Descriptions
    svcVehicleLicensing: 'Vehicle Licensing & RC',
    svcVehicleLicensingDesc: 'Paperless registration for new vehicles, ownership transfers, and EV green fleets.',
    svcFancyNumbers: 'VIP & Choice Plates',
    svcFancyNumbersDesc: 'Simulate, bid, and reserve prestigious Indian registration series with instant allotment.',
    svcDriverLicence: 'Driver Licence & ADTT',
    svcDriverLicenceDesc: 'Apply for driving credentials, automated track test slot bookings, and instant renewals.',
    svcVehiclePermit: 'Commercial Transport Permit',
    svcVehiclePermitDesc: 'All India Tourist Permits (AITP) and interstate goods carrier clearance with zero border tax.',

    // Speed Tools
    toolScan: 'AI Smart Scanner',
    toolScanDesc: 'Instant camera OCR for RC, DL & Insurance cards',
    toolFastpass: 'FastPass 30-Sec',
    toolFastpassDesc: 'Emergency interstate corridor passes',
    toolChallans: 'Challan Radar',
    toolChallansDesc: 'Real-time traffic camera fines & virtual court',
    toolFastag: 'FASTag 1-Click',
    toolFastagDesc: 'Instant toll wallet top-up & NHAI lookup',
    toolInterstate: 'Interstate NOC',
    toolInterstateDesc: 'Inter-state transfer tax & road tax calculator',
    toolAdtt: 'ADTT Simulator',
    toolAdttDesc: 'Physics driving test simulation (8-track & parallel)',

    // Action Feed / Copilot
    autopilotTitle: 'Autopilot Action Feed',
    autopilotSubtitle: 'Proactive compliance radar and pending actions detected across your vehicle garage.',
    predictedBadge: 'Predicted Next Action',
    runAction: 'Run',
    resolved: 'Resolved',
    noActions: 'All systems clear! No pending vehicle or compliance actions required.',
    viewAllGarage: 'View Digital Garage',

    // Common Actions
    startNow: 'Start Now',
    exploreService: 'Explore Service',
    viewDetails: 'View Details',
    back: 'Back',
    continue: 'Continue',
    submit: 'Submit',
    pay: 'Pay Now',
    downloadPdf: 'Download PDF',
    printCard: 'Print Card',
    verified: 'Verified',
    issued: 'Issued & Active',
    inProgress: 'In Progress',
    savedToLocker: 'Saved to GatiLocker',

    // Dashboard
    citizenProfile: 'Citizen Profile',
    applications: 'Applications',
    digitalGarage: 'Digital Garage',
    payments: 'Payments',
    smartCards: 'Smart Cards',
    newApplication: 'New Application',
  },
  hi: {
    // Brand & App
    appName: 'गति',
    appTagline: 'मोबिलिटी ओएस',
    heroTag: 'गति ऑटोपायलट · भारत मोबिलिटी ओएस',
    taglineSubtitle: 'भारतीय वाहन एवं चालक सेवाओं के लिए तीव्र एवं आधुनिक डिजिटल लोक सेवा मंच।',

    // Navigation & Global
    services: 'सेवाएं',
    speedTools: 'त्वरित उपकरण',
    track: 'स्थिति जांचें',
    dashboard: 'डैशबोर्ड',
    askGati: 'गति से पूछें',
    askGatiPlaceholder: 'गति से कुछ भी कराने के लिए कहें…',
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
    heroHeadingMain: 'गति को बताएं क्या चाहिए।',
    heroHeadingHighlight: 'काम तुरंत होगा।',
    heroHeadingPersonal: 'आज क्या कार्य करना है?',
    heroSearchPlaceholderPrefix: 'गति से कहें',
    hoursSaved: 'घंटे गति द्वारा बचाए गए',
    zeroForms: 'शून्य कागजी कार्यवाही',
    pressK: 'पूछने के लिए ⌘K',

    // Command Dock / Action Hub
    allActions: 'सभी सेवाएं',
    vehicleRc: 'वाहन एवं आरसी',
    driverLicence: 'लाइसेंस एवं टेस्ट',
    tollsPasses: 'फास्टपास एवं टोल',
    instantTools: 'त्वरित टूल्स',
    searchServicesPlaceholder: 'किसी भी परिवहन सेवा, शुल्क या दस्तावेज़ को खोजें…',

    // Service Names & Descriptions
    svcVehicleLicensing: 'वाहन पंजीकरण एवं स्मार्ट आरसी',
    svcVehicleLicensingDesc: 'नए वाहनों, स्वामित्व हस्तांतरण और ईवी ग्रीन फ्लीट के लिए पेपरलेस रजिस्ट्रेशन।',
    svcFancyNumbers: 'वीआईपी एवं पसंदीदा नंबर प्लेट्स',
    svcFancyNumbersDesc: 'प्रतिष्ठित भारतीय नंबर श्रृंखला की नीलामी, सिमुलेशन और त्वरित आवंटन।',
    svcDriverLicence: 'ड्राइविंग लाइसेंस एवं एडीटीटी',
    svcDriverLicenceDesc: 'ड्राइविंग लाइसेंस आवेदन, स्वचालित ड्राइविंग ट्रैक टेस्ट स्लॉट बुकिंग और नवीनीकरण।',
    svcVehiclePermit: 'व्यावसायिक परिवहन परमिट',
    svcVehiclePermitDesc: 'अखिल भारतीय पर्यटक परमिट (AITP) और शून्य सीमा कर के साथ मालवाहक परमिट।',

    // Speed Tools
    toolScan: 'एआई स्मार्ट स्कैनर',
    toolScanDesc: 'आरसी, डीएल और बीमा का त्वरित कैमरा ओसीआर',
    toolFastpass: 'फास्टपास 30-सेकंड',
    toolFastpassDesc: 'आपातकालीन अंतर्राज्यीय कॉरिडोर पास',
    toolChallans: 'चालान रडार',
    toolChallansDesc: 'ट्रैफिक कैमरा चालान और वर्चुअल कोर्ट',
    toolFastag: 'फास्टैग 1-क्लिक',
    toolFastagDesc: 'त्वरित टोल वॉलेट रीचार्ज और एनएचएआई जांच',
    toolInterstate: 'अंतर्राज्यीय एनओसी',
    toolInterstateDesc: 'राज्य स्थानांतरण कर एवं रोड टैक्स कैलकुलेटर',
    toolAdtt: 'एडीटीटी सिम्युलेटर',
    toolAdttDesc: 'स्वचालित ड्राइविंग टेस्ट सिमुलेशन (8-ट्रैक और समानांतर पार्किंग)',

    // Action Feed / Copilot
    autopilotTitle: 'ऑटोपायलट एक्शन फीड',
    autopilotSubtitle: 'आपके वाहन गैरेज में सक्रिय अनुपालन रडार और लंबित आवश्यक कार्रवाइयां।',
    predictedBadge: 'अनुमानित अगली कार्रवाई',
    runAction: 'शुरू करें',
    resolved: 'समाधान हो गया',
    noActions: 'सब कुछ दुरुस्त है! कोई लंबित वाहन कार्रवाई शेष नहीं है।',
    viewAllGarage: 'डिजिटल गैरेज देखें',

    // Common Actions
    startNow: 'शुरू करें',
    exploreService: 'सेवा देखें',
    viewDetails: 'विवरण देखें',
    back: 'वापस',
    continue: 'आगे बढ़ें',
    submit: 'जमा करें',
    pay: 'भुगतान करें',
    downloadPdf: 'पीडीएफ डाउनलोड',
    printCard: 'कार्ड प्रिंट करें',
    verified: 'सत्यापित',
    issued: 'जारी एवं सक्रिय',
    inProgress: 'प्रगति पर है',
    savedToLocker: 'गति लॉकर में सुरक्षित',

    // Dashboard
    citizenProfile: 'नागरिक प्रोफाइल',
    applications: 'आवेदन',
    digitalGarage: 'डिजिटल गैरेज',
    payments: 'भुगतान',
    smartCards: 'स्मार्ट कार्ड्स',
    newApplication: 'नया आवेदन',
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
