export type ServiceType = 
  | 'vehicle-licensing'
  | 'fancy-numbers'
  | 'driver-licence'
  | 'vehicle-permit'
  | 'fastpass'
  | 'challans'
  | 'interstate-noc';

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'biometric_verified'
  | 'rto_approved'
  | 'card_generated'
  | 'active'
  | 'dispatched';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  city: string;
  state: string;
  aadhaarMasked: string;
  panMasked: string;
  bio: string;
  vehiclesCount: number;
  activePermitsCount: number;
}

export interface PaymentReceipt {
  transactionId: string;
  utrNumber: string;
  date: string;
  amount: number;
  convenienceFee: number;
  gst: number;
  totalPaid: number;
  paymentMethod: 'UPI' | 'RuPay Card' | 'Net Banking' | 'Credit/Debit Card';
  paymentGateway: 'GatiPay NPCI FastTrack (Simulated)';
  serviceType: ServiceType;
  serviceTitle: string;
  applicationNumber: string;
  status: 'SUCCESS' | 'SETTLING' | 'REFUNDED';
  payerName: string;
  payerEmail: string;
}

export interface BaseApplication {
  id: string;
  referenceNumber: string;
  serviceType: ServiceType;
  title: string;
  userId: string;
  applicantName: string;
  phone: string;
  email: string;
  state: string;
  rtoCode: string;
  rtoName: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  estimatedCompletion: string;
  payment?: PaymentReceipt;
  currentStepIndex: number;
  totalSteps: number;
  nextActionLabel?: string;
  timeline: {
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
    current?: boolean;
  }[];
}

export interface VehicleLicensingData extends BaseApplication {
  serviceType: 'vehicle-licensing';
  registrationCategory: 'New Private Vehicle' | 'Ownership Transfer' | 'Commercial Green Fleet' | 'Vintage / Classic';
  vehicleType: '2W Motorcycle / Scooter' | '4W Passenger Car' | 'Electric Vehicle (EV)' | 'Heavy Commercial';
  maker: string;
  model: string;
  fuelType: 'Electric' | 'Petrol' | 'Diesel' | 'Strong Hybrid' | 'CNG';
  chassisNumberMasked: string;
  engineNumberMasked: string;
  invoiceValue: number;
  roadTaxCalculated: number;
  greenCess: number;
  smartCardFee: number;
  totalFee: number;
  registrationNumberAssigned?: string;
  digitalRcCard?: {
    rcNumber: string;
    ownerName: string;
    fatherName: string;
    address: string;
    modelName: string;
    cubicCapacityOrKw: string;
    seatingCapacity: number;
    color: string;
    issueDate: string;
    validUpto: string;
    financer?: string;
    chipUid: string;
    qrData: string;
  };
}

export interface FancyNumberItem {
  id: string;
  number: string;
  series: string;
  fullPlateText: string;
  category: 'Super VIP' | 'Quad Mirror' | 'Auspicious' | 'Milestone' | 'Sequence' | 'Power Single';
  price: number;
  state: string;
  rto: string;
  numerologySum: number;
  tag: string;
  isPopular?: boolean;
  bidsCount?: number;
  auctionEndsIn?: string;
}

export interface FancyNumberApplication extends BaseApplication {
  serviceType: 'fancy-numbers';
  selectedNumber: FancyNumberItem;
  targetVehicleNumber?: string;
  chassisNumber?: string;
  allotmentCertificate?: {
    allotmentId: string;
    allocatedNumber: string;
    series: string;
    allotteeName: string;
    rtoJurisdiction: string;
    allotmentDate: string;
    validityWindowDays: number;
    receiptRef: string;
    qrData: string;
  };
}

export interface DriverLicenceApplication extends BaseApplication {
  serviceType: 'driver-licence';
  licenceType: 'Learner Licence (LL)' | 'Permanent DL (New)' | 'DL Renewal' | 'International Driving Permit (IDP)';
  vehicleClasses: ('MCWG (Motorcycle with Gear)' | 'LMV (Light Motor Vehicle)' | 'TRANS (Transport Goods/Pass)')[];
  bloodGroup: string;
  organDonor: boolean;
  slotBooking?: {
    trackName: string;
    slotDate: string;
    slotTime: string;
    trackAddress: string;
    confirmationCode: string;
  };
  digitalLicenceCard?: {
    dlNumber: string;
    holderName: string;
    fatherName: string;
    dob: string;
    bloodGroup: string;
    validFrom: string;
    validTill: string;
    allowedVehicles: string[];
    rtoAuthority: string;
    organDonor: boolean;
    chipSerial: string;
    qrData: string;
  };
}

export interface VehiclePermitApplication extends BaseApplication {
  serviceType: 'vehicle-permit';
  permitCategory: 'All India Tourist Permit (AITP)' | 'National Goods Carrier' | 'Interstate Stage Carriage' | 'Temporary Interstate Pass (30 Days)';
  vehicleRegNumber: string;
  grossVehicleWeightKg: number;
  seatingOrPayload: string;
  routeCorridors: string[];
  permitPeriodYears: number;
  fitnessValidTill: string;
  insuranceValidTill: string;
  puccValidTill: string;
  digitalPermitDocument?: {
    permitNumber: string;
    vehicleNumber: string;
    permitHolder: string;
    permitType: string;
    authorizedZones: string[];
    goodsOrPassengersAllowed: string;
    issueDate: string;
    expiryDate: string;
    authRto: string;
    qrData: string;
  };
}

export interface ChallanRecord {
  id: string;
  challanNumber: string;
  vehicleNumber: string;
  violationType: string;
  actSection: string;
  date: string;
  location: string;
  city: string;
  amount: number;
  status: 'PENDING' | 'DISPUTED' | 'PAID';
  photoEvidenceUrl: string;
  detectedSpeed?: string;
  speedLimit?: string;
  courtNoticeDate?: string;
  paymentRef?: string;
}

export interface FastPassItem {
  id: string;
  passType: '30-Day Interstate Pass' | 'Duplicate RC Smart Card' | 'Green EV FastTrack Pass' | 'High-Speed Commercial Express Pass';
  vehicleNumber: string;
  holderName: string;
  amount: number;
  durationSeconds: number;
  passCode: string;
  validTill: string;
  qrData: string;
}

export interface FastagAccount {
  tagId: string;
  vehicleNumber: string;
  walletBalance: number;
  issuingBank: string;
  status: 'ACTIVE' | 'LOW_BALANCE' | 'BLACKLISTED';
  recentTolls: {
    plazaName: string;
    date: string;
    amount: number;
    lane: string;
  }[];
}

export type AnyApplication = 
  | VehicleLicensingData 
  | FancyNumberApplication 
  | DriverLicenceApplication 
  | VehiclePermitApplication;

export interface StoredDocument {
  id: string;
  type: 'RC_SMART_CARD' | 'VIP_ALLOTMENT_ORDER' | 'DRIVING_LICENCE_PVC' | 'NATIONAL_PERMIT_FORM47' | 'FASTPASS_PERMIT' | 'PAYMENT_RECEIPT';
  title: string;
  documentNumber: string;
  holderName: string;
  issueDate: string;
  expiryDate?: string;
  status: 'VALID' | 'ACTIVE' | 'SUBMITTED';
  referenceId: string;
  details: Record<string, string | number | boolean | string[]>;
}
