'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  MapPin,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  CreditCard
} from 'lucide-react';
import { STATES_AND_RTOS } from '@/lib/mockData';
import { VehiclePermitApplication, PaymentReceipt } from '@/lib/types';
import { getCurrentUser, saveApplication, saveDocument } from '@/lib/storage';
import { formatINR, generateReferenceNumber } from '@/lib/utils';
import { GatiPayModal } from '@/components/payment/GatiPayModal';
import { DigitalPermitDocument } from '@/components/documents/DigitalPermitDocument';
import { SectionHeading } from '@/components/ui/Primitives';
import { Field, TextInput, OptionGrid, SelectInput } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/lib/i18n';

export default function VehiclePermitPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  // Form State
  const [permitCategory, setPermitCategory] = useState<'All India Tourist Permit (AITP)' | 'National Goods Carrier' | 'Interstate Stage Carriage' | 'Temporary Interstate Pass (30 Days)'>('All India Tourist Permit (AITP)');
  const [vehicleRegNumber, setVehicleRegNumber] = useState('DL 01 AA 9481');
  const [seatingOrPayload, setSeatingOrPayload] = useState('42 Seater Luxury AC Sleeper Coach');
  const [grossVehicleWeightKg, setGrossVehicleWeightKg] = useState<number>(16200);
  const [permitPeriodYears, setPermitPeriodYears] = useState<number>(5);

  const [selectedCorridors, setSelectedCorridors] = useState<string[]>([
    'All Indian States & UTs (National Green Corridor)',
    'Delhi - Mumbai Expressway Freight Corridor',
    'Golden Quadrilateral Transit Belt'
  ]);

  const [selectedState, setSelectedState] = useState('DL');
  const [selectedRtoCode, setSelectedRtoCode] = useState('DL-01');

  // Modal & Completed State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedApplication, setCompletedApplication] = useState<VehiclePermitApplication | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    setCurrentUser(u);
  }, []);

  const stateData = STATES_AND_RTOS[selectedState] || STATES_AND_RTOS['DL'];
  const rtoList = stateData.rtos;
  const currentRto = rtoList.find(r => r.code === selectedRtoCode) || rtoList[0];

  const totalFee = permitCategory === 'All India Tourist Permit (AITP)' ? 18500 : permitCategory === 'National Goods Carrier' ? 12000 : 4500;

  const toggleCorridor = (c: string) => {
    if (selectedCorridors.includes(c)) {
      if (selectedCorridors.length > 1) {
        setSelectedCorridors(selectedCorridors.filter(x => x !== c));
      }
    } else {
      setSelectedCorridors([...selectedCorridors, c]);
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

    const refNo = generateReferenceNumber('VP');
    const permitNumber = `AITP-${currentRto.code.replace('-', '')}-2026-${Math.floor(10000 + Math.random() * 90000)}-AUTH`;

    const newApp: VehiclePermitApplication = {
      id: `app-vp-${Date.now()}`,
      referenceNumber: refNo,
      serviceType: 'vehicle-permit',
      title: `${permitCategory} (${vehicleRegNumber})`,
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
      estimatedCompletion: 'National Form 47 Issued',
      currentStepIndex: 5,
      totalSteps: 5,
      nextActionLabel: 'Print Form 47 Permit',
      permitCategory,
      vehicleRegNumber: vehicleRegNumber.toUpperCase(),
      grossVehicleWeightKg,
      seatingOrPayload,
      routeCorridors: selectedCorridors,
      permitPeriodYears,
      fitnessValidTill: '2027-08-20',
      insuranceValidTill: '2027-08-20',
      puccValidTill: '2027-02-20',
      payment: receipt,
      timeline: [
        { title: 'Permit Application Submitted', description: 'Vehicle fitness & AIS compliance verified', timestamp: 'Just now', completed: true },
        { title: 'National Composite Single Fee Paid', description: `${formatINR(totalFee)} cleared via ${receipt.paymentMethod}`, timestamp: 'Just now', completed: true },
        { title: 'MoRTH Interstate Clearance', description: 'Central Registry synchronization completed', timestamp: 'Just now', completed: true },
        { title: 'Form 47 National Permit Live', description: `Permit ID: ${permitNumber}`, timestamp: 'Just now', completed: true, current: true }
      ],
      digitalPermitDocument: {
        permitNumber,
        vehicleNumber: vehicleRegNumber.toUpperCase(),
        permitHolder: currentUser.name.toUpperCase(),
        permitType: permitCategory.toUpperCase(),
        authorizedZones: selectedCorridors,
        goodsOrPassengersAllowed: seatingOrPayload,
        issueDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
        expiryDate: '24-AUG-2031',
        authRto: `STA ${stateData.name} - SINGLE WINDOW CLEARANCE`,
        qrData: `GATI-PERMIT:${permitNumber}:${vehicleRegNumber}:VALID_2031`
      }
    };

    saveApplication(newApp);

    // Save to GatiLocker
    if (newApp.digitalPermitDocument) {
      saveDocument({
        id: `doc-vp-${Date.now()}`,
        type: 'NATIONAL_PERMIT_FORM47',
        title: `National Permit: ${vehicleRegNumber}`,
        documentNumber: permitNumber,
        holderName: currentUser.name,
        issueDate: new Date().toISOString(),
        expiryDate: '2031-08-24',
        status: 'VALID',
        referenceId: refNo,
        details: {
          category: permitCategory,
          vehicle: vehicleRegNumber,
          corridors: selectedCorridors.join(', '),
          rto: currentRto.name
        }
      });
    }

    setCompletedApplication(newApp);
    setCurrentStep(5);

    toast({
      title: t('vpToastIssued'),
      description: `Form 47 permit ${permitNumber} ${t('vpToastDesc')}`,
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto">

      {/* Header */}
      <SectionHeading
        eyebrow={t('vpEyebrow')}
        icon={<Compass className="w-3.5 h-3.5" />}
        title={t('vpTitle')}
        subtitle={t('vpSubtitle')}
        className="mb-8"
      />

      {/* Stepper */}
      {currentStep <= 4 && (
        <div className="card p-5 sm:p-6 mb-8 animate-rise">
          <div className="flex items-start">
            {[
              { num: 1, label: t('vpStep1') },
              { num: 2, label: t('vpStep2') },
              { num: 3, label: t('vpStep3') },
              { num: 4, label: t('vpStep4') }
            ].map((step, i) => {
              const done = currentStep > step.num;
              const active = currentStep === step.num;
              return (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center gap-2 shrink-0 w-16 sm:w-24">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      active
                        ? 'bg-olive-700 text-white ring-4 ring-olive-100 dark:ring-olive-900/60'
                        : done
                          ? 'bg-olive-700 text-white'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                    }`}>
                      {done ? <CheckCircle className="w-5 h-5" /> : step.num}
                    </div>
                    <span className={`text-[11px] font-semibold text-center leading-tight ${
                      active ? 'text-olive-800 dark:text-olive-300 font-bold' : done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className="flex-1 h-1 mt-4 mx-0.5 sm:mx-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className={`h-full rounded-full bg-olive-600 transition-all duration-500 ${done ? 'w-full' : 'w-0'}`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="clay-card p-6 sm:p-10 animate-rise">
        
        {/* ================= STEP 1: PERMIT TYPE ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <p className="eyebrow text-olive-800 dark:text-olive-400">{t('vpStepOf')} {currentStep} {t('vpStepOfTotal')}</p>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">{t('vpPermitType')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('vpPermitTypeDesc')}</p>
            </div>

            <Field
              label={t('vpPermitClassification')}
              hint={t('vpPermitClassificationHint')}
            >
              <OptionGrid
                tone="olive"
                columns="grid-cols-1 sm:grid-cols-2"
                value={permitCategory}
                onChange={(v) => setPermitCategory(v as any)}
                options={[
                  {
                    value: 'All India Tourist Permit (AITP)',
                    label: t('vpAITP'),
                    desc: t('vpAITPDesc'),
                    badge: t('vpAITPBadge'),
                  },
                  {
                    value: 'National Goods Carrier',
                    label: t('vpNationalGoods'),
                    desc: t('vpNationalGoodsDesc'),
                    badge: t('vpNationalGoodsBadge'),
                  },
                  {
                    value: 'Interstate Stage Carriage',
                    label: t('vpInterstateStage'),
                    desc: t('vpInterstateStageDesc'),
                    badge: t('vpInterstateStageBadge'),
                  },
                  {
                    value: 'Temporary Interstate Pass (30 Days)',
                    label: t('vpTempPass'),
                    desc: t('vpTempPassDesc'),
                    badge: t('vpTempPassBadge'),
                  },
                ]}
              />
            </Field>

            {/* Jurisdiction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5 pt-2">
              <Field label={t('vpOriginState')} hint={t('vpOriginStateHint')}>
                <SelectInput
                  value={selectedState}
                  onValue={(st) => {
                    setSelectedState(st);
                    const firstRto = STATES_AND_RTOS[st]?.rtos[0]?.code || 'DL-01';
                    setSelectedRtoCode(firstRto);
                  }}
                >
                  {Object.entries(STATES_AND_RTOS).map(([code, s]) => (
                    <option key={code} value={code}>{s.name}</option>
                  ))}
                </SelectInput>
              </Field>

              <Field label={t('vpSTA')} hint={t('vpSTAHint')}>
                <SelectInput
                  value={selectedRtoCode}
                  onValue={(v) => setSelectedRtoCode(v)}
                >
                  {rtoList.map((rto) => (
                    <option key={rto.code} value={rto.code}>{rto.code} - {rto.name}</option>
                  ))}
                </SelectInput>
              </Field>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="clay-btn clay-btn-primary min-h-[44px] px-7 py-3 text-sm text-white font-bold"
              >
                <span>{t('vpContinueVehicle')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: VEHICLE & COMPLIANCE ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <p className="eyebrow text-olive-800 dark:text-olive-400">{t('vpStepOf')} {currentStep} {t('vpStepOfTotal')}</p>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">{t('vpVehicleSpecs')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('vpVehicleSpecsDesc')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
              <Field label={t('vpRegNumber')} hint={t('vpRegNumberHint')}>
                <TextInput
                  value={vehicleRegNumber}
                  onValue={setVehicleRegNumber}
                  transform="upper"
                  mono
                  placeholder="DL 01 AA 9481"
                />
              </Field>

              <Field label={t('vpSeatingConfig')} hint={t('vpSeatingConfigHint')}>
                <TextInput
                  value={seatingOrPayload}
                  onValue={setSeatingOrPayload}
                  placeholder="42 Seater Luxury AC Sleeper Coach"
                />
              </Field>

              <Field
                label={t('vpGVW')}
                adornment="in kg"
                hint={t('vpGVWHint')}
              >
                <TextInput
                  value={grossVehicleWeightKg ? String(grossVehicleWeightKg) : ''}
                  onValue={(v) => setGrossVehicleWeightKg(Number(v.replace(/[^0-9]/g, '')) || 0)}
                  inputMode="numeric"
                  mono
                  suffix={<span className="text-[11px] font-semibold text-slate-400 pr-1">kg</span>}
                  placeholder="16200"
                />
              </Field>

              <Field label={t('vpPermitValidity')} hint={t('vpPermitValidityHint')}>
                <SelectInput
                  value={String(permitPeriodYears)}
                  onValue={(v) => setPermitPeriodYears(Number(v))}
                >
                  <option value={5}>{t('vp5Years')}</option>
                  <option value={3}>{t('vp3Years')}</option>
                  <option value={1}>{t('vp1Year')}</option>
                </SelectInput>
              </Field>
            </div>

            {/* Compliance Badge Row */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <div className="text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('vpCompliance')}</span>
              </div>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">{t('vpComplianceDesc')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                <div>{t('vpFitness')} <span className="font-semibold">Valid (Aug 2027)</span></div>
                <div>{t('vpInsurance')} <span className="font-semibold">Active Comprehensive</span></div>
                <div>{t('vpPUCC')} <span className="font-semibold">Emission Green Pass</span></div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="clay-btn min-h-[44px] px-6 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="clay-btn clay-btn-primary min-h-[44px] px-7 py-3 text-sm text-white font-bold"
              >
                <span>{t('vpContinueCorridors')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ROUTE CORRIDORS ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <p className="eyebrow text-olive-800 dark:text-olive-400">{t('vpStepOf')} {currentStep} {t('vpStepOfTotal')}</p>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">{t('vpCorridors')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('vpCorridorsDesc')}</p>
            </div>

            <Field
              label={t('vpAuthorizedCorridors')}
              adornment={`${selectedCorridors.length} selected`}
              hint={t('vpAuthorizedCorridorsHint')}
            >
              <OptionGrid
                tone="teal"
                multi
                columns="grid-cols-1"
                selectedValues={selectedCorridors}
                onChange={toggleCorridor}
                options={[
                  { value: 'All Indian States & UTs (National Green Corridor)', label: t('vpAllStates'), icon: <MapPin className="w-4 h-4" />, desc: t('vpAllStatesDesc') },
                  { value: 'Delhi - Mumbai Expressway Freight Corridor', label: t('vpDelhiMumbai'), icon: <MapPin className="w-4 h-4" />, desc: t('vpDelhiMumbaiDesc') },
                  { value: 'Golden Quadrilateral Transit Belt', label: t('vpGoldenQuad'), icon: <MapPin className="w-4 h-4" />, desc: t('vpGoldenQuadDesc') },
                  { value: 'Western Coastal Tourist Highway', label: t('vpWesternCoast'), icon: <MapPin className="w-4 h-4" />, desc: t('vpWesternCoastDesc') },
                ]}
              />
            </Field>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="clay-btn min-h-[44px] px-6 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="clay-btn clay-btn-primary min-h-[44px] px-7 py-3 text-sm text-white font-bold"
              >
                <span>{t('vpContinueFee')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: TAX & PAYMENT ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <p className="eyebrow text-olive-800 dark:text-olive-400">{t('vpStepOf')} {currentStep} {t('vpStepOfTotal')}</p>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">{t('vpFeeReview')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('vpFeeReviewDesc')}</p>
            </div>

            {/* Summary */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">{t('vpApplicantFleet')}</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">{currentUser.name}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">{t('vpVehicleReg')}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-right">{vehicleRegNumber}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">{t('vpPermitClass')}</span>
                <span className="font-bold text-teal-700 dark:text-teal-400 text-right">{permitCategory}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">{t('vpAuthValidity')}</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right">{permitPeriodYears} Years National Multi-Entry</span>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-2 p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-sm">
              <div className="flex justify-between gap-4 text-slate-700 dark:text-slate-300">
                <span>{t('vpNationalFee')}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(totalFee)}</span>
              </div>
              <div className="flex justify-between gap-4 text-teal-800 dark:text-teal-300">
                <span>{t('vpBorderSurcharges')}</span>
                <span className="font-mono font-bold">{t('vpIncluded')}</span>
              </div>
              <div className="flex justify-between gap-4 pt-3 border-t border-teal-200 dark:border-teal-800/60 font-extrabold text-teal-950 dark:text-teal-100">
                <span>{t('vpTotalComposite')}</span>
                <span className="font-mono text-lg text-teal-700 dark:text-teal-400">{formatINR(totalFee)}</span>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="clay-btn min-h-[44px] px-6 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="clay-btn clay-btn-saffron min-h-[48px] px-8 py-3.5 text-sm text-white font-extrabold shadow-lg"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay {formatINR(totalFee)} &amp; Mint Permit</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: GENERATED PERMIT ================= */}
        {currentStep === 5 && completedApplication && (
          <div className="space-y-8 animate-rise">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('vpPermitGranted')}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                {t('vpPermitNumber')} <strong className="font-mono text-teal-700 dark:text-teal-400">{completedApplication.digitalPermitDocument?.permitNumber}</strong>
              </p>
            </div>

            {/* Official Digital Permit Document */}
            <DigitalPermitDocument data={completedApplication} />

            {/* Next Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="clay-btn clay-btn-primary min-h-[44px] px-6 py-2.5 text-sm text-white font-bold"
              >
                {t('vpGoDashboard')}
              </Link>
              <Link
                href={`/track?ref=${completedApplication.referenceNumber}`}
                className="clay-btn min-h-[44px] px-6 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                {t('vpTrackStatus')}
              </Link>
              <Link
                href="/documents"
                className="clay-btn min-h-[44px] px-6 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                {t('vpViewLocker')}
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Payment Gateway Modal */}
      <GatiPayModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        serviceType="vehicle-permit"
        serviceTitle={`${permitCategory} Authorization`}
        applicationNumber="TEMP-VP-DRAFT"
        amount={totalFee}
        payerName={currentUser.name}
        payerEmail={currentUser.email}
        onPaymentSuccess={handlePaymentSuccess}
      />

    </div>
  );
}
