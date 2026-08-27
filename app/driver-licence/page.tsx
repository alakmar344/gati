'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  Heart,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { STATES_AND_RTOS } from '@/lib/mockData';
import { DriverLicenceApplication, PaymentReceipt } from '@/lib/types';
import { getCurrentUser, saveApplication, saveDocument } from '@/lib/storage';
import { formatINR, generateReferenceNumber } from '@/lib/utils';
import { GatiPayModal } from '@/components/payment/GatiPayModal';
import { DigitalDrivingLicenceCard } from '@/components/documents/DigitalDrivingLicenceCard';
import { SectionHeading, Pill } from '@/components/ui/Primitives';
import { Field, OptionGrid, SelectInput, VerifiedChip } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/lib/i18n';

export default function DriverLicencePage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  const STEPS = [
    { num: 1, label: t('dlStep1') },
    { num: 2, label: t('dlStep2') },
    { num: 3, label: t('dlStep3') },
    { num: 4, label: t('dlStep4') },
  ];

  // Form State
  const [licenceType, setLicenceType] = useState<'Learner Licence (LL)' | 'Permanent DL (New)' | 'DL Renewal' | 'International Driving Permit (IDP)'>('Permanent DL (New)');
  const [vehicleClasses, setVehicleClasses] = useState<('MCWG (Motorcycle with Gear)' | 'LMV (Light Motor Vehicle)' | 'TRANS (Transport Goods/Pass)')[]>([
    'MCWG (Motorcycle with Gear)',
    'LMV (Light Motor Vehicle)'
  ]);
  const [bloodGroup, setBloodGroup] = useState('O+ve');
  const [dob, setDob] = useState('1998-05-14');
  const [organDonor, setOrganDonor] = useState(true);
  const [medicalFormDeclared, setMedicalFormDeclared] = useState(true);

  // Profile-sourced defaults for the applicant/health step (used by the autofill Reset)
  const resetHealthToProfile = () => {
    setBloodGroup('O+ve');
    setDob('1998-05-14');
    setOrganDonor(true);
    setMedicalFormDeclared(true);
  };

  const [selectedState, setSelectedState] = useState('MH');
  const [selectedRtoCode, setSelectedRtoCode] = useState('MH-12');

  // ADTT Track Slot State
  const [selectedDate, setSelectedDate] = useState('2026-08-28');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:30 AM - 11:30 AM');
  const [selectedTrack, setSelectedTrack] = useState('Automated Sensor Track #2 (IDTR Alandi Road)');

  // Modal & Completed State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedApplication, setCompletedApplication] = useState<DriverLicenceApplication | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    setCurrentUser(u);
  }, []);

  const stateData = STATES_AND_RTOS[selectedState] || STATES_AND_RTOS['MH'];
  const rtoList = stateData.rtos;
  const currentRto = rtoList.find(r => r.code === selectedRtoCode) || rtoList[0];

  const totalFee = licenceType === 'Learner Licence (LL)' ? 450 : licenceType === 'International Driving Permit (IDP)' ? 2500 : 1350;

  const toggleClass = (c: any) => {
    if (vehicleClasses.includes(c)) {
      if (vehicleClasses.length > 1) {
        setVehicleClasses(vehicleClasses.filter(x => x !== c));
      }
    } else {
      setVehicleClasses([...vehicleClasses, c]);
    }
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePaymentSuccess = (receipt: PaymentReceipt) => {
    setIsPaymentOpen(false);

    const refNo = generateReferenceNumber('DL');
    const randomDlNo = `${currentRto.code} 2026 ${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newApp: DriverLicenceApplication = {
      id: `app-dl-${Date.now()}`,
      referenceNumber: refNo,
      serviceType: 'driver-licence',
      title: `${licenceType} (${vehicleClasses.map(c => c.split(' ')[0]).join(' + ')})`,
      userId: currentUser.id,
      applicantName: currentUser.name,
      phone: currentUser.phone,
      email: currentUser.email,
      state: stateData.name,
      rtoCode: currentRto.code,
      rtoName: currentRto.name,
      status: 'card_generated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedCompletion: 'Digital PVC DL Generated',
      currentStepIndex: 5,
      totalSteps: 5,
      nextActionLabel: 'View Digital DL Pass',
      licenceType,
      vehicleClasses,
      bloodGroup,
      organDonor,
      payment: receipt,
      slotBooking: {
        trackName: selectedTrack,
        slotDate: selectedDate,
        slotTime: selectedTimeSlot,
        trackAddress: `${currentRto.name} Automated Driving Test Track, ${stateData.name}`,
        confirmationCode: `SLOT-${currentRto.code.replace('-', '')}-${Date.now().toString().slice(-4)}`
      },
      timeline: [
        { title: 'Form 2 Application Filed', description: 'Applicant biometrics and Form 1A verified', timestamp: 'Just now', completed: true },
        { title: 'Statutory Fee Settled', description: `${formatINR(totalFee)} paid via ${receipt.paymentMethod}`, timestamp: 'Just now', completed: true },
        { title: 'ADTT Track Slot Confirmed', description: `${selectedDate} at ${selectedTimeSlot}`, timestamp: 'Just now', completed: true },
        { title: 'Sensor Clearance Synchronized', description: 'Pre-authorized simulation clearance', timestamp: 'Just now', completed: true },
        { title: 'Digital PVC Smart Licence Minted', description: `Issued DL Number: ${randomDlNo}`, timestamp: 'Just now', completed: true, current: true }
      ],
      digitalLicenceCard: {
        dlNumber: randomDlNo,
        holderName: currentUser.name.toUpperCase(),
        fatherName: `${currentUser.name.trim().split(/\s+/).slice(-1)[0].toUpperCase()} (GUARDIAN)`,
        dob: new Date(dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
        bloodGroup: bloodGroup,
        validFrom: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
        validTill: '24-AUG-2046',
        allowedVehicles: vehicleClasses.map(c => c.split(' ')[0]),
        rtoAuthority: `${currentRto.name}, ${stateData.name}`,
        organDonor: organDonor,
        chipSerial: `IND-DL-${Date.now().toString().slice(-6)}`,
        qrData: `GATI-DL:${randomDlNo}:${currentUser.name}:VALID`
      }
    };

    saveApplication(newApp);

    // Save to GatiLocker
    if (newApp.digitalLicenceCard) {
      saveDocument({
        id: `doc-dl-${Date.now()}`,
        type: 'DRIVING_LICENCE_PVC',
        title: `Digital DL: ${randomDlNo}`,
        documentNumber: randomDlNo,
        holderName: currentUser.name,
        issueDate: new Date().toISOString(),
        expiryDate: '2046-08-24',
        status: 'VALID',
        referenceId: refNo,
        details: {
          classes: vehicleClasses.join(', '),
          bloodGroup,
          rto: currentRto.name,
          state: stateData.name
        }
      });
    }

    setCompletedApplication(newApp);
    setCurrentStep(5);

    toast({
      title: t('dlToastIssued'),
      description: `DL ${randomDlNo} ${t('dlToastDesc')}`,
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="mb-8 animate-rise">
        <div className="flex justify-center mb-3">
          <Pill tone="ashoka">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{t('dlEyebrow')}</span>
          </Pill>
        </div>
        <SectionHeading
          title={t('dlTitle')}
          subtitle={t('dlSubtitle')}
        />
      </div>

      {/* Stepper */}
      {currentStep <= 4 && (
        <div className="card p-5 sm:p-6 mb-6 animate-rise">
          <div className="flex items-center justify-between mb-4">
            <span className="eyebrow text-ashoka-800 dark:text-ashoka-300">{t('dlStepOf')} {currentStep} {t('dlStepOfTotal')}</span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {STEPS[currentStep - 1].label}
            </span>
          </div>
          <div className="flex items-center">
            {STEPS.map((step, i) => {
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-ashoka-800 text-white ring-4 ring-ashoka-100 dark:ring-ashoka-900/60'
                          : isCompleted
                            ? 'bg-olive-700 text-white'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.num}
                    </div>
                    <span
                      className={`hidden sm:block text-[11px] font-semibold text-center leading-tight ${
                        isCurrent
                          ? 'text-ashoka-800 dark:text-ashoka-300'
                          : isCompleted
                            ? 'text-slate-700 dark:text-slate-300'
                            : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 sm:mx-3 -mt-6 sm:mt-0 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          currentStep > step.num ? 'w-full bg-olive-600' : 'w-0 bg-olive-600'
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

      {/* Main Form Container — one step at a time */}
      <div>

        {/* ================= STEP 1: LICENCE CATEGORY ================= */}
        {currentStep === 1 && (
          <div className="clay-card p-6 sm:p-8 space-y-6 animate-rise">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('dlSelectService')}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('dlSelectServiceDesc')}</p>
            </div>

            {/* Service Type */}
            <Field
              label={t('dlLicenceServiceType')}
              hint={t('dlLicenceServiceTypeHint')}
            >
              <OptionGrid
                tone="sky"
                columns="grid-cols-2 sm:grid-cols-4"
                value={licenceType}
                onChange={(v) => setLicenceType(v as any)}
                options={[
                  { value: 'Learner Licence (LL)', label: t('dlLearnerLicence') },
                  { value: 'Permanent DL (New)', label: t('dlPermanentDL') },
                  { value: 'DL Renewal', label: t('dlRenewal') },
                  { value: 'International Driving Permit (IDP)', label: t('dlIDP') },
                ]}
              />
            </Field>

            {/* Vehicle Classes (Multi-select) */}
            <Field
              label={t('dlVehicleClasses')}
              hint={t('dlVehicleClassesHint')}
            >
              <OptionGrid
                multi
                tone="sky"
                columns="grid-cols-1 sm:grid-cols-3"
                selectedValues={vehicleClasses}
                onChange={(v) => toggleClass(v)}
                options={[
                  { value: 'MCWG (Motorcycle with Gear)', label: 'MCWG', icon: '🏍️', desc: t('dlMCWGDesc') },
                  { value: 'LMV (Light Motor Vehicle)', label: 'LMV', icon: '🚗', desc: t('dlLMVDesc') },
                  { value: 'TRANS (Transport Goods/Pass)', label: 'TRANS', icon: '🚐', desc: t('dlTRANSDesc') },
                ]}
              />
            </Field>

            {/* RTO State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5 pt-1">
              <Field
                label={t('dlState')}
                hint={t('dlStateHint')}
              >
                <SelectInput
                  value={selectedState}
                  onValue={(st) => {
                    setSelectedState(st);
                    const firstRto = STATES_AND_RTOS[st]?.rtos[0]?.code || 'MH-12';
                    setSelectedRtoCode(firstRto);
                  }}
                >
                  {Object.entries(STATES_AND_RTOS).map(([code, s]) => (
                    <option key={code} value={code}>{s.name}</option>
                  ))}
                </SelectInput>
              </Field>

              <Field
                label={t('dlRTO')}
                hint={t('dlRTOHint')}
              >
                <SelectInput value={selectedRtoCode} onValue={setSelectedRtoCode}>
                  {rtoList.map((rto) => (
                    <option key={rto.code} value={rto.code}>{rto.code} - {rto.name}</option>
                  ))}
                </SelectInput>
              </Field>
            </div>

            <div className="flex justify-end pt-2 hairline border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleNext}
                className="clay-btn clay-btn-primary min-h-[44px] px-6 py-2.5 text-sm mt-4 text-white"
              >
                <span>{t('dlContinueHealth')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: APPLICANT & HEALTH ================= */}
        {currentStep === 2 && (
          <div className="clay-card p-6 sm:p-8 space-y-6 animate-rise">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('dlApplicantInfo')}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('dlApplicantInfoDesc')}</p>
            </div>

            {/* Autofill user pill */}
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.avatar}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    {currentUser.name}
                    <VerifiedChip label={t('dlFromAadhaar')} />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Aadhaar: {currentUser.aadhaarMasked} (e-KYC Linked)</div>
                </div>
              </div>
              <Pill tone="emerald">{t('dlAutoVerified')}</Pill>
            </div>

            {/* Autofill banner */}
            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-center justify-between gap-3">
              <p className="text-xs text-sky-900 dark:text-sky-200 leading-snug">
                <span className="font-bold">{t('dlAutofilled')}</span> — {t('dlAutofilledEdit')}
              </p>
              <button
                type="button"
                onClick={resetHealthToProfile}
                className="clay-btn min-h-[36px] px-3.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                {t('dlReset')}
              </button>
            </div>

            {/* Health & Blood Group Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
              <Field
                label={t('dlBloodGroup')}
                hint={t('dlBloodGroupHint')}
                adornment={<VerifiedChip label="From profile" />}
              >
                <SelectInput value={bloodGroup} onValue={setBloodGroup}>
                  {['O+ve', 'O-ve', 'A+ve', 'A-ve', 'B+ve', 'B-ve', 'AB+ve', 'AB-ve'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </SelectInput>
              </Field>

              <Field
                label={t('dlDOB')}
                hint={t('dlDOBHint')}
                adornment={<VerifiedChip label="From profile" />}
              >
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="clay-input w-full px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white font-mono"
                />
              </Field>
            </div>

            {/* Organ Donor Pledge */}
            <div
              onClick={() => setOrganDonor(!organDonor)}
              className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between gap-3 transition-all min-h-[48px] ${
                organDonor ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <div>
                  <div className="font-bold text-sm text-rose-950 dark:text-rose-200">{t('dlOrganDonor')}</div>
                  <div className="text-[11px] text-rose-700 dark:text-rose-400">{t('dlOrganDonorDesc')}</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={organDonor}
                onChange={() => {}}
                className="w-4 h-4 text-rose-600 rounded shrink-0"
              />
            </div>

            {/* Form 1A Check */}
            <div
              onClick={() => setMedicalFormDeclared(!medicalFormDeclared)}
              className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 text-xs transition-all min-h-[48px] ${
                medicalFormDeclared ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 ring-2 ring-sky-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={medicalFormDeclared}
                onChange={() => {}}
                className="w-4 h-4 text-sky-600 rounded mt-0.5 shrink-0"
              />
              <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5 text-[13px]">{t('dlForm1A')}</strong>
                {t('dlForm1ADesc')}
              </div>
            </div>

            <div className="flex justify-between pt-2 hairline border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleBack}
                className="clay-btn min-h-[44px] px-5 py-2.5 text-sm mt-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="clay-btn clay-btn-primary min-h-[44px] px-6 py-2.5 text-sm mt-4 text-white"
              >
                <span>{t('dlContinueSlot')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ADTT SENSOR TRACK SLOT ================= */}
        {currentStep === 3 && (
          <div className="clay-card p-6 sm:p-8 space-y-6 animate-rise">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('dlBookSlot')}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('dlBookSlotDesc')}</p>
            </div>

            {/* Test Track Location */}
            <div>
              <label className="eyebrow text-slate-500 dark:text-slate-400 block mb-2.5">
                {t('dlSensorTrack')}
              </label>
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{selectedTrack}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">{currentRto.name}, {stateData.name}</div>
                </div>
              </div>
            </div>

            {/* Date Selector */}
            <Field
              label={t('dlTestDate')}
              hint={t('dlTestDateHint')}
              adornment={<Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
              className="max-w-xs"
            >
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="clay-input w-full px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white font-mono"
              />
            </Field>

            {/* Time Window */}
            <Field
              label={t('dlTimeWindow')}
              hint={t('dlTimeWindowHint')}
              adornment={<Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
            >
              <OptionGrid
                tone="sky"
                columns="grid-cols-1 sm:grid-cols-2"
                value={selectedTimeSlot}
                onChange={setSelectedTimeSlot}
                options={[
                  { value: '09:30 AM - 10:30 AM', label: '09:30 AM - 10:30 AM', desc: t('dlMorningA') },
                  { value: '10:30 AM - 11:30 AM', label: '10:30 AM - 11:30 AM', desc: t('dlMorningB') },
                  { value: '02:00 PM - 03:00 PM', label: '02:00 PM - 03:00 PM', desc: t('dlAfternoonC') },
                  { value: '03:30 PM - 04:30 PM', label: '03:30 PM - 04:30 PM', desc: t('dlEveningD') },
                ]}
              />
            </Field>

            {/* Instant Track Pass Info */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-bold block text-[13px]">{t('dlEntryPass')}</strong>
                {t('dlEntryPassDesc')}
              </div>
            </div>

            <div className="flex justify-between pt-2 hairline border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleBack}
                className="clay-btn min-h-[44px] px-5 py-2.5 text-sm mt-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="clay-btn clay-btn-primary min-h-[44px] px-6 py-2.5 text-sm mt-4 text-white"
              >
                <span>{t('dlContinueReview')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REVIEW & PAYMENT ================= */}
        {currentStep === 4 && (
          <div className="clay-card p-6 sm:p-8 space-y-6 animate-rise">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('dlReview')}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('dlReviewDesc')}</p>
            </div>

            {/* Summary */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-[13px]">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
                <span className="text-slate-500 dark:text-slate-400">{t('dlApplicantName')}</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentUser.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
                <span className="text-slate-500 dark:text-slate-400">{t('dlServiceCategory')}</span>
                <span className="font-bold text-slate-900 dark:text-white">{licenceType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
                <span className="text-slate-500 dark:text-slate-400">{t('dlAuthorizedClasses')}</span>
                <span className="font-bold text-sky-700 dark:text-sky-400 font-mono">{vehicleClasses.map(c => c.split(' ')[0]).join(' + ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{t('dlADTTSlot')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedDate} ({selectedTimeSlot})</span>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-2.5 p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-[13px]">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>{t('dlForm2Fee')}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(totalFee - 350)}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>{t('dlSmartCardFee')}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(350)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-sky-200 dark:border-sky-800/60 text-sm font-extrabold text-sky-950 dark:text-sky-200">
                <span>{t('dlTotalAmount')}</span>
                <span className="font-mono text-lg text-sky-700 dark:text-sky-400">{formatINR(totalFee)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2 hairline border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleBack}
                className="clay-btn min-h-[44px] px-5 py-2.5 text-sm order-2 sm:order-1 mt-0 sm:mt-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="clay-btn clay-btn-saffron min-h-[44px] px-7 py-3 text-sm text-white order-1 sm:order-2 mt-4"
              >
                <CreditCard className="w-4 h-4" />
                <span>{t('pay')} {formatINR(totalFee)} &amp; Mint DL</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: GENERATED DIGITAL DL ================= */}
        {currentStep === 5 && completedApplication && (
          <div className="clay-card p-6 sm:p-8 space-y-8 animate-rise">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('dlIssued')}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5">
                Ref No: <strong className="font-mono text-sky-700 dark:text-sky-400">{completedApplication.referenceNumber}</strong>
              </p>
            </div>

            {/* 3D Flippable Digital Driving Licence Component */}
            <DigitalDrivingLicenceCard data={completedApplication} />
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 -mt-3">{t('dlFlipCard')}</p>

            {/* Next Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 hairline border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/dashboard"
                className="clay-btn clay-btn-primary min-h-[44px] px-6 py-2.5 text-sm mt-6 text-white"
              >
                {t('dlGoDashboard')}
              </Link>
              <Link
                href={`/track?ref=${completedApplication.referenceNumber}`}
                className="clay-btn min-h-[44px] px-6 py-2.5 text-sm mt-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                {t('dlTrackStatus')}
              </Link>
              <Link
                href="/documents"
                className="clay-btn min-h-[44px] px-6 py-2.5 text-sm bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 mt-6"
              >
                {t('dlViewLocker')}
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Payment Gateway Modal */}
      <GatiPayModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        serviceType="driver-licence"
        serviceTitle={`${licenceType} Application`}
        applicationNumber="TEMP-DL-DRAFT"
        amount={totalFee}
        payerName={currentUser.name}
        payerEmail={currentUser.email}
        onPaymentSuccess={handlePaymentSuccess}
      />

    </div>
  );
}
