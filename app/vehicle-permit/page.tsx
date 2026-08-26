'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Truck, 
  MapPin, 
  CheckCircle, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  CreditCard,
  FileCheck2,
  AlertTriangle
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

export default function VehiclePermitPage() {
  const { toast } = useToast();
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
      title: 'National Permit granted',
      description: `Form 47 permit ${permitNumber} is now live and saved to GatiLocker.`,
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto">

      {/* Header */}
      <SectionHeading
        eyebrow="National Single-Window Transport Hub"
        icon={<Compass className="w-3.5 h-3.5" />}
        title="Vehicle Permit Portal"
        subtitle="Instant digital authorizations for All India Tourist Permits (AITP), Goods Carriers, and Interstate Corridors."
        className="mb-8"
      />

      {/* Stepper */}
      {currentStep <= 4 && (
        <div className="card p-5 sm:p-6 mb-8 animate-rise">
          <div className="flex items-start">
            {[
              { num: 1, label: 'Permit Type' },
              { num: 2, label: 'Vehicle Details' },
              { num: 3, label: 'Route Corridors' },
              { num: 4, label: 'Tax & Payment' }
            ].map((step, i) => {
              const done = currentStep > step.num;
              const active = currentStep === step.num;
              return (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center gap-2 shrink-0 w-16 sm:w-24">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      active
                        ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                        : done
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-slate-100 text-slate-400'
                    }`}>
                      {done ? <CheckCircle className="w-5 h-5" /> : step.num}
                    </div>
                    <span className={`text-[11px] font-semibold text-center leading-tight ${
                      active ? 'text-teal-700' : done ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className="flex-1 h-1 mt-4 mx-0.5 sm:mx-1 rounded-full bg-slate-200 overflow-hidden">
                      <div className={`h-full rounded-full bg-teal-500 transition-all duration-500 ${done ? 'w-full' : 'w-0'}`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="card p-6 sm:p-10 animate-rise">
        
        {/* ================= STEP 1: PERMIT TYPE ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <p className="eyebrow text-teal-700">Step 1 of 4</p>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mt-1">Select Permit Classification</h2>
              <p className="text-sm text-slate-500 mt-1">Unified under Central Motor Vehicles Rules 1989 (Rule 85-B).</p>
            </div>

            <Field
              label="Permit Classification"
              hint="Choose the statutory category that matches your vehicle and operation. Fees and route rights adapt automatically."
            >
              <OptionGrid
                tone="teal"
                columns="grid-cols-1 sm:grid-cols-2"
                value={permitCategory}
                onChange={(v) => setPermitCategory(v as any)}
                options={[
                  {
                    value: 'All India Tourist Permit (AITP)',
                    label: 'All India Tourist Permit (AITP)',
                    desc: 'Unrestricted passenger transit across all 28 States & 8 UTs with zero border taxes',
                    badge: 'Most Popular',
                  },
                  {
                    value: 'National Goods Carrier',
                    label: 'National Goods Carrier',
                    desc: 'Interstate commercial freight transport for heavy trucks and multi-axle trailers',
                    badge: 'Freight',
                  },
                  {
                    value: 'Interstate Stage Carriage',
                    label: 'Interstate Stage Carriage',
                    desc: 'Scheduled route bus permit between designated origin and destination stations',
                    badge: 'Public Transit',
                  },
                  {
                    value: 'Temporary Interstate Pass (30 Days)',
                    label: 'Temporary Interstate Pass (30 Days)',
                    desc: 'Short-term corridor authorization for temporary event or project deployment',
                    badge: 'Short Term',
                  },
                ]}
              />
            </Field>

            {/* Jurisdiction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5 pt-2">
              <Field label="Origin State Authority" hint="State whose Transport Authority issues the permit.">
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

              <Field label="State Transport Authority (STA)" hint="Regional office (RTO) processing your single-window clearance.">
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
                className="btn btn-primary px-7 py-3 text-sm"
              >
                <span>Continue to Vehicle Specs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: VEHICLE & COMPLIANCE ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <p className="eyebrow text-teal-700">Step 2 of 4</p>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mt-1">Vehicle Specifications & Compliance</h2>
              <p className="text-sm text-slate-500 mt-1">Automated validation with National Vehicle Registry (Vahan OS).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
              <Field label="Vehicle Registration Number" hint="Format e.g. DL 01 AA 9481 — as issued by the RTO.">
                <TextInput
                  value={vehicleRegNumber}
                  onValue={setVehicleRegNumber}
                  transform="upper"
                  mono
                  placeholder="DL 01 AA 9481"
                />
              </Field>

              <Field label="Seating / Body Configuration" hint="Passenger seating layout or goods body type, matching the fitness certificate.">
                <TextInput
                  value={seatingOrPayload}
                  onValue={setSeatingOrPayload}
                  placeholder="42 Seater Luxury AC Sleeper Coach"
                />
              </Field>

              <Field
                label="Gross Vehicle Weight (GVW)"
                adornment="in kg"
                hint="Gross Vehicle Weight in kg, from the fitness certificate."
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

              <Field label="Permit Validity Term" hint="Longer terms reduce renewal frequency; 5 years is the standard national term.">
                <SelectInput
                  value={String(permitPeriodYears)}
                  onValue={(v) => setPermitPeriodYears(Number(v))}
                >
                  <option value={5}>5 Years (Recommended National Term)</option>
                  <option value={3}>3 Years</option>
                  <option value={1}>1 Year Annual</option>
                </SelectInput>
              </Field>
            </div>

            {/* Compliance Badge Row */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Real-Time Statutory Compliance Verification</span>
              </div>
              <p className="text-[11px] text-emerald-700/80">Auto-verified from Vahan OS — dates are as printed on each certificate.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-emerald-900">
                <div>Fitness: <span className="font-semibold">Valid (Aug 2027)</span></div>
                <div>Insurance: <span className="font-semibold">Active Comprehensive</span></div>
                <div>PUCC: <span className="font-semibold">Emission Green Pass</span></div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-ghost px-6 py-3 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary px-7 py-3 text-sm"
              >
                <span>Continue to Corridors</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ROUTE CORRIDORS ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <p className="eyebrow text-teal-700">Step 3 of 4</p>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mt-1">Interstate Corridors & Route Matrix</h2>
              <p className="text-sm text-slate-500 mt-1">Select high-speed expressway corridors or pan-India single window coverage.</p>
            </div>

            <Field
              label="Authorized Route Corridors"
              adornment={`${selectedCorridors.length} selected`}
              hint="Select one or more corridors — at least one is required. Pan-India coverage includes every state, UT, and border checkpost."
            >
              <OptionGrid
                tone="teal"
                multi
                columns="grid-cols-1"
                selectedValues={selectedCorridors}
                onChange={toggleCorridor}
                options={[
                  { value: 'All Indian States & UTs (National Green Corridor)', label: 'All Indian States & UTs (National Green Corridor)', icon: <MapPin className="w-4 h-4" />, desc: 'Complete unrestricted transit across all National Highways, expressways, and border checkposts' },
                  { value: 'Delhi - Mumbai Expressway Freight Corridor', label: 'Delhi - Mumbai Expressway Freight Corridor', icon: <MapPin className="w-4 h-4" />, desc: 'Fast-track priority electronic toll pass for the NE-4 expressway corridor' },
                  { value: 'Golden Quadrilateral Transit Belt', label: 'Golden Quadrilateral Transit Belt', icon: <MapPin className="w-4 h-4" />, desc: 'Connecting Delhi, Mumbai, Chennai, and Kolkata arterial industrial corridors' },
                  { value: 'Western Coastal Tourist Highway', label: 'Western Coastal Tourist Highway', icon: <MapPin className="w-4 h-4" />, desc: 'Mumbai, Goa, Mangalore, Kochi coastal tourist route coverage' },
                ]}
              />
            </Field>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-ghost px-6 py-3 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary px-7 py-3 text-sm"
              >
                <span>Continue to Fee Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: TAX & PAYMENT ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <p className="eyebrow text-teal-700">Step 4 of 4</p>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mt-1">Composite Permit Fee Review</h2>
              <p className="text-sm text-slate-500 mt-1">Unified single-window settlement under National Transport Agreement.</p>
            </div>

            {/* Summary */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                <span className="text-slate-500">Applicant / Fleet Entity</span>
                <span className="font-bold text-slate-900 text-right">{currentUser.name}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                <span className="text-slate-500">Vehicle Registration</span>
                <span className="font-mono font-bold text-slate-900 text-right">{vehicleRegNumber}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                <span className="text-slate-500">Permit Classification</span>
                <span className="font-bold text-teal-700 text-right">{permitCategory}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Authorized Validity</span>
                <span className="font-semibold text-slate-900 text-right">{permitPeriodYears} Years National Multi-Entry</span>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-2 p-5 rounded-2xl bg-teal-50 border border-teal-200 text-sm">
              <div className="flex justify-between gap-4 text-slate-700">
                <span>National Composite Permit Fee (Central Single Window)</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(totalFee)}</span>
              </div>
              <div className="flex justify-between gap-4 text-teal-800">
                <span>Border Checkpost Multi-Entry Surcharges</span>
                <span className="font-mono font-bold">INCLUDED (₹0)</span>
              </div>
              <div className="flex justify-between gap-4 pt-3 border-t border-teal-200 font-extrabold text-teal-950">
                <span>Total Composite Amount</span>
                <span className="font-mono text-lg text-teal-700">{formatINR(totalFee)}</span>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-ghost px-6 py-3 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="btn btn-brand px-8 py-3.5 text-sm"
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
              <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                National Permit Granted
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Permit Number: <strong className="font-mono text-teal-700">{completedApplication.digitalPermitDocument?.permitNumber}</strong>
              </p>
            </div>

            {/* Official Digital Permit Document */}
            <DigitalPermitDocument data={completedApplication} />

            {/* Next Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="btn btn-primary px-6 py-2.5 text-sm"
              >
                Go to Dashboard
              </Link>
              <Link
                href={`/track?ref=${completedApplication.referenceNumber}`}
                className="btn btn-ghost px-6 py-2.5 text-sm"
              >
                Track Live Status
              </Link>
              <Link
                href="/documents"
                className="btn btn-ghost px-6 py-2.5 text-sm"
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
