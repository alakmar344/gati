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
import { SectionHeading, Pill } from '@/components/ui/Primitives';
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'All India Tourist Permit (AITP)',
                  desc: 'Unrestricted passenger transit across all 28 States & 8 UTs with zero border taxes',
                  tag: 'Most Popular'
                },
                {
                  id: 'National Goods Carrier',
                  desc: 'Interstate commercial freight transport for heavy trucks and multi-axle trailers',
                  tag: 'Freight'
                },
                {
                  id: 'Interstate Stage Carriage',
                  desc: 'Scheduled route bus permit between designated origin and destination stations',
                  tag: 'Public Transit'
                },
                {
                  id: 'Temporary Interstate Pass (30 Days)',
                  desc: 'Short-term corridor authorization for temporary event or project deployment',
                  tag: 'Short Term'
                }
              ].map((p) => {
                const isSelected = permitCategory === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPermitCategory(p.id as any)}
                    className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/25 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-bold text-slate-900">{p.id}</span>
                        {isSelected
                          ? <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                          : <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{p.desc}</p>
                      <Pill tone={isSelected ? 'emerald' : 'slate'}>{p.tag}</Pill>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Jurisdiction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="eyebrow text-slate-500 block mb-1.5">Origin State Authority</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    const st = e.target.value;
                    setSelectedState(st);
                    const firstRto = STATES_AND_RTOS[st]?.rtos[0]?.code || 'DL-01';
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
                <label className="eyebrow text-slate-500 block mb-1.5">State Transport Authority (STA)</label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="eyebrow text-slate-500 block mb-1.5">Vehicle Registration Number</label>
                <input
                  type="text"
                  value={vehicleRegNumber}
                  onChange={(e) => setVehicleRegNumber(e.target.value)}
                  className="field w-full px-4 py-2.5 text-sm font-medium text-slate-900 font-mono uppercase"
                />
              </div>

              <div>
                <label className="eyebrow text-slate-500 block mb-1.5">Seating / Body Configuration</label>
                <input
                  type="text"
                  value={seatingOrPayload}
                  onChange={(e) => setSeatingOrPayload(e.target.value)}
                  className="field w-full px-4 py-2.5 text-sm font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="eyebrow text-slate-500 block mb-1.5">Gross Vehicle Weight (GVW in KG)</label>
                <input
                  type="number"
                  value={grossVehicleWeightKg}
                  onChange={(e) => setGrossVehicleWeightKg(Number(e.target.value))}
                  className="field w-full px-4 py-2.5 text-sm font-medium text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="eyebrow text-slate-500 block mb-1.5">Permit Validity Term</label>
                <select
                  value={permitPeriodYears}
                  onChange={(e) => setPermitPeriodYears(Number(e.target.value))}
                  className="field w-full px-4 py-2.5 text-sm font-medium text-slate-900"
                >
                  <option value={5}>5 Years (Recommended National Term)</option>
                  <option value={3}>3 Years</option>
                  <option value={1}>1 Year Annual</option>
                </select>
              </div>
            </div>

            {/* Compliance Badge Row */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Real-Time Statutory Compliance Verification</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-emerald-900">
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

            <div className="space-y-3">
              {[
                { name: 'All Indian States & UTs (National Green Corridor)', desc: 'Complete unrestricted transit across all National Highways, expressways, and border checkposts' },
                { name: 'Delhi - Mumbai Expressway Freight Corridor', desc: 'Fast-track priority electronic toll pass for the NE-4 expressway corridor' },
                { name: 'Golden Quadrilateral Transit Belt', desc: 'Connecting Delhi, Mumbai, Chennai, and Kolkata arterial industrial corridors' },
                { name: 'Western Coastal Tourist Highway', desc: 'Mumbai, Goa, Mangalore, Kochi coastal tourist route coverage' },
              ].map((c) => {
                const isSelected = selectedCorridors.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggleCorridor(c.name)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/25'
                        : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                        <span>{c.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 pl-6">{c.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <CheckCircle className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
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
