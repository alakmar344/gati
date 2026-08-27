'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  Zap,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  ScanLine
} from 'lucide-react';
import { STATES_AND_RTOS } from '@/lib/mockData';
import { VehicleLicensingData, PaymentReceipt } from '@/lib/types';
import { getCurrentUser, saveApplication, saveDocument } from '@/lib/storage';
import { formatINR, generateReferenceNumber } from '@/lib/utils';
import { GatiPayModal } from '@/components/payment/GatiPayModal';
import { DigitalRcSmartCard } from '@/components/documents/DigitalRcSmartCard';
import { SectionHeading, Pill } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import { Field, TextInput, MoneyInput, OptionGrid, SelectInput, VerifiedChip, amountInWords } from '@/components/ui/Form';
import { useLanguage } from '@/lib/i18n';

const WIZARD_STEPS = [
  { num: 1, label: 'Vehicle Specs' },
  { num: 2, label: 'RTO & Region' },
  { num: 3, label: 'Owner & KYC' },
  { num: 4, label: 'Tax & Review' },
  { num: 5, label: 'Smart RC' },
];

export default function VehicleLicensingPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  const WIZARD_STEPS = [
    { num: 1, label: t('vlStep1') },
    { num: 2, label: t('vlStep2') },
    { num: 3, label: t('vlStep3') },
    { num: 4, label: t('vlStep4') },
    { num: 5, label: t('vlStep5') },
  ];

  // Form State
  const [registrationCategory, setRegistrationCategory] = useState<'New Private Vehicle' | 'Ownership Transfer' | 'Commercial Green Fleet' | 'Vintage / Classic'>('New Private Vehicle');
  const [vehicleType, setVehicleType] = useState<'2W Motorcycle / Scooter' | '4W Passenger Car' | 'Electric Vehicle (EV)' | 'Heavy Commercial'>('Electric Vehicle (EV)');
  const [maker, setMaker] = useState('Tata Motors');
  const [model, setModel] = useState('Nexon.ev Empowered+ LR');
  const [fuelType, setFuelType] = useState<'Electric' | 'Petrol' | 'Diesel' | 'Strong Hybrid' | 'CNG'>('Electric');
  const [invoiceValue, setInvoiceValue] = useState<number>(1850000);
  
  const [selectedState, setSelectedState] = useState<string>('KA');
  const [selectedRtoCode, setSelectedRtoCode] = useState<string>('KA-01');
  
  const [chassisNumber, setChassisNumber] = useState('MAT629482NZ91024');
  const [engineNumber, setEngineNumber] = useState('EV40KWH928104');
  const [ownerName, setOwnerName] = useState(currentUser.name);
  const [ownerPhone, setOwnerPhone] = useState(currentUser.phone);
  const [ownerEmail, setOwnerEmail] = useState(currentUser.email);
  const [address, setAddress] = useState(`${currentUser.city}, ${currentUser.state}`);

  // Simulated Document Upload states
  const [docsUploaded, setDocsUploaded] = useState({
    invoice: true,
    insurance: true,
    form21: true,
    aadhaarKyc: true,
  });

  // Modal and Submission State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedApplication, setCompletedApplication] = useState<VehicleLicensingData | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    setCurrentUser(u);
    setOwnerName(u.name);
    setOwnerPhone(u.phone);
    setOwnerEmail(u.email);
  }, []);

  // Update RTOs when state changes
  const stateData = STATES_AND_RTOS[selectedState] || STATES_AND_RTOS['KA'];
  const rtoList = stateData.rtos;

  // Calculate Taxes & Fees
  const isEV = fuelType === 'Electric';
  const roadTaxRate = isEV ? 0 : selectedState === 'KA' ? 0.14 : selectedState === 'MH' ? 0.12 : 0.10;
  const roadTax = Math.round(invoiceValue * roadTaxRate);
  const greenCess = isEV ? 0 : 500;
  const smartCardFee = 450;
  const totalFee = roadTax + greenCess + smartCardFee;

  const currentRto = rtoList.find(r => r.code === selectedRtoCode) || rtoList[0];

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleProceedToPayment = () => {
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (receipt: PaymentReceipt) => {
    setIsPaymentOpen(false);

    const refNo = generateReferenceNumber('VL');
    const randomAssignedNumber = `${currentRto.code} EK ${Math.floor(1000 + Math.random() * 9000)}`;

    const newApp: VehicleLicensingData = {
      id: `app-vl-${Date.now()}`,
      referenceNumber: refNo,
      serviceType: 'vehicle-licensing',
      title: `${registrationCategory} (${maker} ${model})`,
      userId: currentUser.id,
      applicantName: ownerName,
      phone: ownerPhone,
      email: ownerEmail,
      state: stateData.name,
      rtoCode: currentRto.code,
      rtoName: currentRto.name,
      status: 'card_generated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedCompletion: 'Instant Smart Card Issued',
      currentStepIndex: 5,
      totalSteps: 5,
      nextActionLabel: 'Download Smart RC',
      registrationCategory,
      vehicleType,
      maker,
      model,
      fuelType,
      chassisNumberMasked: `${chassisNumber.slice(0, 6)}******${chassisNumber.slice(-3)}`,
      engineNumberMasked: `${engineNumber.slice(0, 4)}******${engineNumber.slice(-2)}`,
      invoiceValue,
      roadTaxCalculated: roadTax,
      greenCess,
      smartCardFee,
      totalFee,
      registrationNumberAssigned: randomAssignedNumber,
      payment: receipt,
      timeline: [
        { title: 'Application Submitted', description: 'Chassis VIN and invoice verified', timestamp: 'Just now', completed: true },
        { title: 'Aadhaar e-KYC Verified', description: 'Biometric authorization match 99.4%', timestamp: 'Just now', completed: true },
        { title: 'Statutory Fee Settled', description: `${formatINR(totalFee)} paid via ${receipt.paymentMethod}`, timestamp: 'Just now', completed: true },
        { title: 'RTO Scrutiny Approved', description: 'Zero-inspection fast-track clearance', timestamp: 'Just now', completed: true },
        { title: 'Smart RC Card Minted', description: `Assigned: ${randomAssignedNumber}`, timestamp: 'Just now', completed: true, current: true }
      ],
      digitalRcCard: {
        rcNumber: randomAssignedNumber,
        ownerName: ownerName.toUpperCase(),
        fatherName: `${ownerName.trim().split(/\s+/).slice(-1)[0].toUpperCase()} (GUARDIAN)`,
        address: address,
        modelName: `${maker} ${model}`.toUpperCase(),
        cubicCapacityOrKw: isEV ? '106.4 kW (EV)' : '1498 CC',
        seatingCapacity: 5,
        color: 'Arctic White',
        issueDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
        validUpto: 'AUG 2041',
        financer: 'HDFC AUTO FINANCE',
        chipUid: `IND-${currentRto.code.replace('-', '')}-${Date.now().toString().slice(-6)}`,
        qrData: `GATI-RC:${randomAssignedNumber}:${ownerName}:VALID`
      }
    };

    saveApplication(newApp);

    // Save to GatiLocker
    if (newApp.digitalRcCard) {
      saveDocument({
        id: `doc-rc-${Date.now()}`,
        type: 'RC_SMART_CARD',
        title: `Smart RC: ${randomAssignedNumber}`,
        documentNumber: randomAssignedNumber,
        holderName: ownerName,
        issueDate: new Date().toISOString(),
        expiryDate: '2041-08-25',
        status: 'VALID',
        referenceId: refNo,
        details: {
          maker,
          model,
          fuelType,
          rto: currentRto.name,
          state: stateData.name
        }
      });
    }

    setCompletedApplication(newApp);
    setCurrentStep(5); // Completion step

    toast({
      title: t('vlToastIssued'),
      description: `${randomAssignedNumber} · Ref ${refNo}`,
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <SectionHeading
        className="mb-8 animate-rise"
        eyebrow={t('vlEyebrow')}
        icon={<Car className="w-3.5 h-3.5" />}
        title={t('vlTitle')}
        subtitle={t('vlSubtitle')}
      />

      {/* Horizontal Stepper */}
      {currentStep <= 4 && (
        <div className="mb-8 animate-rise">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="eyebrow text-olive-800 dark:text-olive-300">
              {t('vlStepOf')} {currentStep} {t('vlStepOfTotal')} — {WIZARD_STEPS[currentStep - 1].label}
            </p>
            <Pill tone="olive">{t('vlPaperlessFastTrack')}</Pill>
          </div>

          <div className="flex items-start">
            {WIZARD_STEPS.map((step, i) => {
              const done = currentStep > step.num;
              const active = currentStep === step.num;
              return (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center gap-2 w-16 shrink-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        done
                          ? 'bg-olive-700 text-white shadow-sm'
                          : active
                            ? 'bg-olive-700 text-white ring-4 ring-olive-100 dark:ring-olive-900/60'
                            : 'bg-white border-2 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
                      }`}
                    >
                      {done ? <CheckCircle className="w-5 h-5" /> : step.num}
                    </div>
                    <span
                      className={`text-[11px] leading-tight text-center ${
                        active
                          ? 'text-olive-800 dark:text-olive-300 font-bold'
                          : done
                            ? 'text-slate-700 dark:text-slate-300 font-semibold'
                            : 'text-slate-400 dark:text-slate-500 font-medium'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < WIZARD_STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mt-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-olive-600 transition-all duration-500 ${
                          currentStep > step.num ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Content Container */}
      <div className="animate-rise">        {/* ================= STEP 1: VEHICLE TYPE ================= */}
        {currentStep === 1 && (
          <div className="clay-card p-6 sm:p-8 space-y-7 animate-overlay-in">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t('vlVehicleSpecs')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('vlVehicleSpecsDesc')}</p>
            </div>

            {/* Registration Category */}
            <Field label={t('vlRegCategory')} hint={t('vlRegCategoryHint')}>
              <OptionGrid
                value={registrationCategory}
                onChange={(v) => setRegistrationCategory(v as any)}
                options={[
                  { value: 'New Private Vehicle', label: t('vlNewPrivate'), desc: t('vlNewPrivateDesc') },
                  { value: 'Ownership Transfer', label: t('vlTransfer'), desc: t('vlTransferDesc') },
                  { value: 'Commercial Green Fleet', label: t('vlGreenFleet'), desc: t('vlGreenFleetDesc') },
                  { value: 'Vintage / Classic', label: t('vlVintage'), desc: t('vlVintageDesc') },
                ]}
              />
            </Field>

            {/* Vehicle Type */}
            <Field label={t('vlVehicleType')}>
              <OptionGrid
                value={vehicleType}
                onChange={(v) => {
                  setVehicleType(v as any);
                  if (v === 'Electric Vehicle (EV)') setFuelType('Electric');
                }}
                options={[
                  { value: '2W Motorcycle / Scooter', label: t('vl2Wheeler'), icon: '🛵' },
                  { value: '4W Passenger Car', label: t('vl4Wheeler'), icon: '🚗' },
                  { value: 'Electric Vehicle (EV)', label: t('vlElectric'), icon: '⚡', badge: '0% tax' },
                  { value: 'Heavy Commercial', label: t('vlCommercial'), icon: '🚚' },
                ]}
              />
            </Field>

            {/* Make / Model / Fuel / Invoice Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5 pt-1">
              <Field label={t('vlManufacturer')} hint={t('vlManufacturerHint')}>
                <TextInput value={maker} onValue={setMaker} placeholder="e.g. Tata Motors, Ather" />
              </Field>

              <Field label={t('vlModel')} hint={t('vlModelHint')}>
                <TextInput value={model} onValue={setModel} placeholder="e.g. Nexon EV Empowered+" />
              </Field>

              <Field label={t('vlFuelType')} hint={isEV ? t('vlFuelTypeHintEV') : t('vlFuelTypeHint')}>
                <SelectInput value={fuelType} onValue={(v) => setFuelType(v as any)}>
                  <option value="Electric">⚡ Electric — 100% tax exemption</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Strong Hybrid">Strong Hybrid</option>
                  <option value="CNG">CNG</option>
                </SelectInput>
              </Field>

              <Field
                label={t('vlInvoiceValue')}
                hint={invoiceValue > 0 ? <span className="capitalize">{amountInWords(invoiceValue)}</span> : t('vlInvoiceValueHint')}
              >
                <MoneyInput
                  value={invoiceValue}
                  onValue={setInvoiceValue}
                  presets={[850000, 1850000, 4500000]}
                  quickAdd={[100000, 500000]}
                />
              </Field>
            </div>

            {/* EV Incentive Highlight Banner */}
            {isEV && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[13px] text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-bold block">{t('vlGreenIncentive')}</strong>
                  {t('vlGreenIncentiveDesc')}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleNext}
                className="clay-btn clay-btn-primary min-h-[44px] px-7 py-3 text-sm text-white"
              >
                <span>{t('vlContinueRTO')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: STATE & RTO ================= */}
        {currentStep === 2 && (
          <div className="clay-card p-6 sm:p-8 space-y-7 animate-overlay-in">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t('vlStateRTO')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('vlStateRTODesc')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label={t('vlStateUT')} hint={t('vlStateUTHint')}>
                <SelectInput
                  value={selectedState}
                  onValue={(st) => {
                    setSelectedState(st);
                    setSelectedRtoCode(STATES_AND_RTOS[st]?.rtos[0]?.code || 'KA-01');
                  }}
                >
                  {Object.entries(STATES_AND_RTOS).map(([code, s]) => (
                    <option key={code} value={code}>
                      {s.name} ({code})
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Field label={t('vlAssignedRTO')} hint={`${rtoList.length} offices available in ${stateData.name}.`}>
                <SelectInput value={selectedRtoCode} onValue={setSelectedRtoCode}>
                  {rtoList.map((rto) => (
                    <option key={rto.code} value={rto.code}>
                      {rto.code} — {rto.name}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            </div>

            {/* Selected RTO Preview Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-mono font-bold text-xs">
                  {currentRto.code}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{currentRto.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{stateData.name} State Transport Department</div>
                </div>
              </div>

              <Pill tone="emerald">{t('vlPaperlessFastTrack')}</Pill>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleBack}
                className="clay-btn min-h-[44px] px-6 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="clay-btn clay-btn-primary min-h-[44px] px-7 py-2.5 text-sm text-white"
              >
                <span>{t('vlContinueOwner')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: OWNER & SPECS ================= */}
        {currentStep === 3 && (
          <div className="clay-card p-6 sm:p-8 space-y-7 animate-overlay-in">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t('vlOwnershipVIN')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('vlOwnershipVINDesc')}</p>
            </div>

            {/* Autofill banner */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60">
              <div className="flex items-center gap-2.5 text-[13px] text-sky-900 dark:text-sky-200">
                <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span><strong className="font-bold">{t('vlAutofilled')}</strong> {t('vlAutofilledEdit')}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOwnerName(currentUser.name);
                  setOwnerPhone(currentUser.phone);
                  setAddress(`${currentUser.city}, ${currentUser.state}`);
                  toast({ title: 'Reset to profile', variant: 'info' });
                }}
                className="clay-btn min-h-[36px] px-3.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sky-700 dark:text-sky-300 shrink-0"
              >
                {t('vlReset')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
              <Field label={t('vlOwnerName')} adornment={ownerName === currentUser.name ? <VerifiedChip label="From Aadhaar" /> : undefined}>
                <TextInput value={ownerName} onValue={setOwnerName} autoComplete="name" />
              </Field>

              <Field label={t('vlMobile')} hint={t('vlMobileHint')} adornment={ownerPhone === currentUser.phone ? <VerifiedChip /> : undefined}>
                <TextInput value={ownerPhone} onValue={setOwnerPhone} mono inputMode="tel" autoComplete="tel" />
              </Field>

              <Field
                label={t('vlChassisVIN')}
                hint={t('vlChassisVINHint')}
                adornment={
                  <span className={chassisNumber.replace(/\s/g, '').length === 17 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                    {chassisNumber.replace(/\s/g, '').length}/17
                  </span>
                }
              >
                <TextInput
                  value={chassisNumber}
                  onValue={setChassisNumber}
                  transform="upper"
                  mono
                  maxLength={17}
                  placeholder="MAT629482NZ91024"
                  suffix={
                    <Link href="/scan" className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors" title="Scan with Smart Lens" aria-label="Scan chassis number with Smart Lens">
                      <ScanLine className="w-4 h-4" />
                    </Link>
                  }
                />
              </Field>

              <Field label={t('vlEngineSerial')} hint={t('vlEngineSerialHint')}>
                <TextInput value={engineNumber} onValue={setEngineNumber} transform="upper" mono placeholder="EV40KWH928104" />
              </Field>

              <Field className="sm:col-span-2" label={t('vlAddress')} hint={t('vlAddressHint')}>
                <TextInput value={address} onValue={setAddress} autoComplete="street-address" />
              </Field>
            </div>

            {/* Document Checklist */}
            <div className="pt-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide block mb-2.5">
                {t('vlDigiLockerDocs')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: 'invoice', label: t('vlForm21') },
                  { key: 'insurance', label: t('vlInsurance') },
                  { key: 'form21', label: t('vlRoadworthiness') },
                  { key: 'aadhaarKyc', label: t('vlAadhaarKYC') }
                ].map((doc) => (
                  <div key={doc.key} className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-[11px] font-semibold truncate">{doc.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleBack}
                className="clay-btn min-h-[44px] px-6 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="clay-btn clay-btn-primary min-h-[44px] px-7 py-2.5 text-sm text-white"
              >
                <span>{t('vlContinueFee')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: TAX & REVIEW ================= */}
        {currentStep === 4 && (
          <div className="clay-card p-6 sm:p-8 space-y-7 animate-overlay-in">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t('vlFeeReview')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('vlFeeReviewDesc')}</p>
            </div>

            {/* Application Summary Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-[13px]">
              <div className="flex justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-2.5">
                <span className="text-slate-500 dark:text-slate-400">{t('vlApplicantOwner')}</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">{ownerName}</span>
              </div>
              <div className="flex justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-2.5">
                <span className="text-slate-500 dark:text-slate-400">{t('vlVehicleModel')}</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">{maker} {model} ({fuelType})</span>
              </div>
              <div className="flex justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-2.5">
                <span className="text-slate-500 dark:text-slate-400">{t('vlRTOJurisdiction')}</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">{currentRto.code} - {currentRto.name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500 dark:text-slate-400">{t('vlExShowroom')}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(invoiceValue)}</span>
              </div>
            </div>

            {/* Fee Table — highlighted summary */}
            <div className="space-y-3 p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[13px]">
              <div className="eyebrow text-emerald-700 dark:text-emerald-400 mb-1">{t('vlStatutoryFeeSummary')}</div>
              <div className="flex justify-between gap-3 text-slate-700 dark:text-slate-300">
                <span>{t('vlRoadTax')} ({isEV ? '0% EV Policy' : '14% Standard'})</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(roadTax)}</span>
              </div>
              <div className="flex justify-between gap-3 text-slate-700 dark:text-slate-300">
                <span>{t('vlGreenCess')}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(greenCess)}</span>
              </div>
              <div className="flex justify-between gap-3 text-slate-700 dark:text-slate-300">
                <span>{t('vlSmartCardFeeLabel')}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(smartCardFee)}</span>
              </div>
              <div className="flex justify-between items-center gap-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/60">
                <span className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200">{t('vlTotalStatutory')}</span>
                <span className="font-display font-extrabold text-2xl text-emerald-700 dark:text-emerald-400">{formatINR(totalFee)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleBack}
                className="clay-btn min-h-[44px] px-6 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="clay-btn clay-btn-saffron min-h-[44px] px-8 py-3 text-sm text-white"
              >
                <CreditCard className="w-4 h-4" />
                <span>{t('pay')} {formatINR(totalFee)} & Issue Smart RC</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: COMPLETED SMART RC ================= */}
        {currentStep === 5 && completedApplication && (
          <div className="clay-card p-6 sm:p-8 space-y-8 animate-dialog-in">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('vlRegSuccessful')}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Ref No: <strong className="font-mono text-sky-700 dark:text-sky-400">{completedApplication.referenceNumber}</strong>
              </p>
            </div>

            {/* Digital Smart Card Display */}
            <DigitalRcSmartCard data={completedApplication} />

            {/* Next Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link href="/dashboard" className="clay-btn clay-btn-primary min-h-[44px] px-6 py-2.5 text-sm text-white">
                {t('vlGoDashboard')}
              </Link>
              <Link href={`/track?ref=${completedApplication.referenceNumber}`} className="clay-btn min-h-[44px] px-6 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                {t('vlTrackStatus')}
              </Link>
              <Link
                href="/documents"
                className="clay-btn min-h-[44px] px-6 py-2.5 text-sm bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              >
                {t('vlViewLocker')}
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Payment Gateway Modal */}
      <GatiPayModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        serviceType="vehicle-licensing"
        serviceTitle={`${maker} ${model} Registration`}
        applicationNumber="TEMP-VL-DRAFT"
        amount={totalFee}
        payerName={ownerName}
        payerEmail={ownerEmail}
        onPaymentSuccess={handlePaymentSuccess}
      />

    </div>
  );
}
