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
  ArrowLeft, 
  ShieldCheck, 
  FileText,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { STATES_AND_RTOS } from '@/lib/mockData';
import { DriverLicenceApplication, PaymentReceipt } from '@/lib/types';
import { getCurrentUser, saveApplication, saveDocument } from '@/lib/storage';
import { formatINR, generateReferenceNumber } from '@/lib/utils';
import { GatiPayModal } from '@/components/payment/GatiPayModal';
import { DigitalDrivingLicenceCard } from '@/components/documents/DigitalDrivingLicenceCard';
import { SectionHeading, Pill } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';

const STEPS = [
  { num: 1, label: 'Licence Category' },
  { num: 2, label: 'Applicant & Health' },
  { num: 3, label: 'ADTT Sensor Slot' },
  { num: 4, label: 'Review & Payment' },
];

export default function DriverLicencePage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  // Form State
  const [licenceType, setLicenceType] = useState<'Learner Licence (LL)' | 'Permanent DL (New)' | 'DL Renewal' | 'International Driving Permit (IDP)'>('Permanent DL (New)');
  const [vehicleClasses, setVehicleClasses] = useState<('MCWG (Motorcycle with Gear)' | 'LMV (Light Motor Vehicle)' | 'TRANS (Transport Goods/Pass)')[]>([
    'MCWG (Motorcycle with Gear)',
    'LMV (Light Motor Vehicle)'
  ]);
  const [bloodGroup, setBloodGroup] = useState('O+ve');
  const [organDonor, setOrganDonor] = useState(true);
  const [medicalFormDeclared, setMedicalFormDeclared] = useState(true);

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
        fatherName: 'SURENDRA DESHMUKH',
        dob: '14-MAY-1998',
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
      title: 'Digital Driving Licence issued',
      description: `DL ${randomDlNo} minted and saved to GatiLocker.`,
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="mb-8 animate-rise">
        <div className="flex justify-center mb-3">
          <Pill tone="sky">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Driver Licensing & Slot Booking</span>
          </Pill>
        </div>
        <SectionHeading
          title="Driving Licence Portal"
          subtitle="Apply for new licences, renew existing credentials, or book Automated Driving Test Track (ADTT) slots."
        />
      </div>

      {/* Stepper */}
      {currentStep <= 4 && (
        <div className="card p-5 sm:p-6 mb-6 animate-rise">
          <div className="flex items-center justify-between mb-4">
            <span className="eyebrow text-sky-700">Step {currentStep} of 4</span>
            <span className="text-[11px] font-bold text-slate-500">
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
                          ? 'bg-sky-600 text-white ring-4 ring-sky-100'
                          : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.num}
                    </div>
                    <span
                      className={`hidden sm:block text-[11px] font-semibold text-center leading-tight ${
                        isCurrent
                          ? 'text-sky-700'
                          : isCompleted
                            ? 'text-slate-700'
                            : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 sm:mx-3 -mt-6 sm:mt-0 rounded-full overflow-hidden bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          currentStep > step.num ? 'w-full bg-emerald-500' : 'w-0 bg-emerald-500'
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
          <div className="card p-6 sm:p-8 space-y-6 animate-rise">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Select service &amp; vehicle classes
              </h2>
              <p className="text-sm text-slate-500 mt-1">Choose your application type and authorized vehicle classes.</p>
            </div>

            {/* Service Type */}
            <div>
              <label className="eyebrow text-slate-500 block mb-2.5">
                Licence Service Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  'Learner Licence (LL)',
                  'Permanent DL (New)',
                  'DL Renewal',
                  'International Driving Permit (IDP)'
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLicenceType(type as any)}
                    className={`p-3.5 rounded-2xl border text-[13px] font-semibold text-left transition-all ${
                      licenceType === type
                        ? 'bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-500/30'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Classes (Multi-select) */}
            <div>
              <label className="eyebrow text-slate-500 block mb-2.5">
                Authorised Vehicle Classes (COV)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'MCWG (Motorcycle with Gear)', desc: 'Two-wheelers with manual or auto transmission', icon: '🏍️' },
                  { id: 'LMV (Light Motor Vehicle)', desc: 'Private passenger cars, SUVs, and sedans', icon: '🚗' },
                  { id: 'TRANS (Transport Goods/Pass)', desc: 'Commercial taxis, logistics delivery vans', icon: '🚐' }
                ].map((item) => {
                  const isChecked = vehicleClasses.includes(item.id as any);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleClass(item.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/30'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-2xl mb-1">{item.icon}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isChecked ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300'
                        }`}>
                          {isChecked && <CheckCircle className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <div className="font-bold text-sm text-slate-900 mt-1">{item.id.split(' ')[0]}</div>
                      <div className="text-[11px] text-slate-500 leading-snug mt-0.5">{item.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RTO State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">State / UT Jurisdiction</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    const st = e.target.value;
                    setSelectedState(st);
                    const firstRto = STATES_AND_RTOS[st]?.rtos[0]?.code || 'MH-12';
                    setSelectedRtoCode(firstRto);
                  }}
                  className="field w-full px-4 py-2.5 text-sm font-medium text-slate-900"
                >
                  {Object.entries(STATES_AND_RTOS).map(([code, s]) => (
                    <option key={code} value={code}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Issuing Authority RTO</label>
                <select
                  value={selectedRtoCode}
                  onChange={(e) => setSelectedRtoCode(e.target.value)}
                  className="field w-full px-4 py-2.5 text-sm font-medium text-slate-900"
                >
                  {rtoList.map((rto) => (
                    <option key={rto.code} value={rto.code}>{rto.code} - {rto.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2 hairline border-t">
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary px-6 py-3 text-sm mt-4"
              >
                <span>Continue to Health &amp; KYC</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: APPLICANT & HEALTH ================= */}
        {currentStep === 2 && (
          <div className="card p-6 sm:p-8 space-y-6 animate-rise">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Applicant information &amp; medical declaration
              </h2>
              <p className="text-sm text-slate-500 mt-1">Form 1A statutory self-health certification and biometric verification.</p>
            </div>

            {/* Autofill user pill */}
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.avatar}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">Aadhaar: {currentUser.aadhaarMasked} (e-KYC Linked)</div>
                </div>
              </div>
              <Pill tone="emerald">Auto-Verified</Pill>
            </div>

            {/* Health & Blood Group Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="field w-full px-4 py-2.5 text-sm font-medium text-slate-900 font-mono"
                >
                  {['O+ve', 'O-ve', 'A+ve', 'A-ve', 'B+ve', 'B-ve', 'AB+ve', 'AB-ve'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  defaultValue="1998-05-14"
                  className="field w-full px-4 py-2.5 text-sm font-medium text-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Organ Donor Pledge */}
            <div
              onClick={() => setOrganDonor(!organDonor)}
              className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between gap-3 transition-all ${
                organDonor ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <div>
                  <div className="font-bold text-sm text-rose-950">Organ Donor Pledge</div>
                  <div className="text-[11px] text-rose-700">Pledge to donate organs in event of emergency (Badge on Smart DL)</div>
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
              className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 text-xs transition-all ${
                medicalFormDeclared ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={medicalFormDeclared}
                onChange={() => {}}
                className="w-4 h-4 text-sky-600 rounded mt-0.5 shrink-0"
              />
              <div className="text-slate-600 leading-relaxed">
                <strong className="text-slate-900 block font-semibold mb-0.5 text-[13px]">Form 1A Medical Self-Declaration</strong>
                I hereby declare that I do not suffer from epilepsy, night blindness, or loss of consciousness, and possess standard visual acuity.
              </div>
            </div>

            <div className="flex justify-between pt-2 hairline border-t">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-ghost px-5 py-3 text-sm mt-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary px-6 py-3 text-sm mt-4"
              >
                <span>Continue to Track Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ADTT SENSOR TRACK SLOT ================= */}
        {currentStep === 3 && (
          <div className="card p-6 sm:p-8 space-y-6 animate-rise">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Book your ADTT sensor track slot
              </h2>
              <p className="text-sm text-slate-500 mt-1">Pick a convenient sensor test track slot with real-time biometric turnstile check-in.</p>
            </div>

            {/* Test Track Location */}
            <div>
              <label className="eyebrow text-slate-500 block mb-2.5">
                Automated Sensor Track Facility
              </label>
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{selectedTrack}</div>
                  <div className="text-slate-500 text-[11px]">{currentRto.name}, {stateData.name}</div>
                </div>
              </div>
            </div>

            {/* Date Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" /> Preferred Test Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="field w-full px-4 py-2.5 text-sm font-medium text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-600" /> Time Window
                </label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="field w-full px-4 py-2.5 text-sm font-medium text-slate-900"
                >
                  <option value="09:30 AM - 10:30 AM">09:30 AM - 10:30 AM (Morning Slot A)</option>
                  <option value="10:30 AM - 11:30 AM">10:30 AM - 11:30 AM (Morning Slot B)</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM (Afternoon Slot C)</option>
                  <option value="03:30 PM - 04:30 PM">03:30 PM - 04:30 PM (Evening Slot D)</option>
                </select>
              </div>
            </div>

            {/* Instant Track Pass Info */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-bold block text-[13px]">Instant Digital Entry Pass Included</strong>
                Upon checkout, you will receive an encrypted QR entry pass for contactless entry at the RTO automated sensor gates.
              </div>
            </div>

            <div className="flex justify-between pt-2 hairline border-t">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-ghost px-5 py-3 text-sm mt-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary px-6 py-3 text-sm mt-4"
              >
                <span>Continue to Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REVIEW & PAYMENT ================= */}
        {currentStep === 4 && (
          <div className="card p-6 sm:p-8 space-y-6 animate-rise">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Review &amp; statutory fee
              </h2>
              <p className="text-sm text-slate-500 mt-1">Government prescribed smart card and driving test fees.</p>
            </div>

            {/* Summary */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-[13px]">
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Applicant Name</span>
                <span className="font-bold text-slate-900">{currentUser.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Service Category</span>
                <span className="font-bold text-slate-900">{licenceType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500">Authorized Classes</span>
                <span className="font-bold text-sky-700 font-mono">{vehicleClasses.map(c => c.split(' ')[0]).join(' + ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ADTT Slot</span>
                <span className="font-semibold text-slate-900">{selectedDate} ({selectedTimeSlot})</span>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-2.5 p-5 rounded-2xl bg-sky-50 border border-sky-200 text-[13px]">
              <div className="flex justify-between text-slate-700">
                <span>Form 2 Statutory Application &amp; Test Fee</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(totalFee - 350)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Cryptographic Smart PVC Card Fee</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(350)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-sky-200 text-sm font-extrabold text-sky-950">
                <span>Total Amount Payable</span>
                <span className="font-mono text-lg text-sky-700">{formatINR(totalFee)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2 hairline border-t">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-ghost px-5 py-3 text-sm order-2 sm:order-1 mt-0 sm:mt-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="btn px-7 py-3.5 text-sm bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/30 order-1 sm:order-2 mt-4"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay {formatINR(totalFee)} &amp; Mint DL</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: GENERATED DIGITAL DL ================= */}
        {currentStep === 5 && completedApplication && (
          <div className="card p-6 sm:p-8 space-y-8 animate-rise">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Driving Licence issued successfully
              </h2>
              <p className="text-sm text-slate-600 mt-1.5">
                Ref No: <strong className="font-mono text-sky-700">{completedApplication.referenceNumber}</strong>
              </p>
            </div>

            {/* 3D Flippable Digital Driving Licence Component */}
            <DigitalDrivingLicenceCard data={completedApplication} />
            <p className="text-center text-[11px] text-slate-400 -mt-3">Tap the card to flip and view the reverse side.</p>

            {/* Next Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 hairline border-t">
              <Link
                href="/dashboard"
                className="btn btn-primary px-6 py-2.5 text-sm mt-6"
              >
                Go to Dashboard
              </Link>
              <Link
                href={`/track?ref=${completedApplication.referenceNumber}`}
                className="btn btn-ghost px-6 py-2.5 text-sm mt-6"
              >
                Track Live Status
              </Link>
              <Link
                href="/documents"
                className="btn px-6 py-2.5 text-sm bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 mt-6"
              >
                View in GatiLocker
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
