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

export default function VehiclePermitPage() {
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
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>National Single-Window Transport Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Vehicle Permit Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Instant digital authorizations for All India Tourist Permits (AITP), Goods Carriers, and Interstate Corridors.
        </p>
      </div>

      {/* Stepper */}
      {currentStep <= 4 && (
        <div className="mb-8 glass-panel p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-semibold">
            {[
              { num: 1, label: 'Permit Type' },
              { num: 2, label: 'Vehicle Details' },
              { num: 3, label: 'Route Corridors' },
              { num: 4, label: 'Tax & Payment' }
            ].map((step) => (
              <div 
                key={step.num}
                className={`flex items-center gap-2 ${
                  currentStep === step.num 
                    ? 'text-teal-700 font-bold' 
                    : currentStep > step.num 
                      ? 'text-slate-800' 
                      : 'text-slate-400'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                  currentStep === step.num 
                    ? 'bg-teal-600 text-white ring-4 ring-teal-100 font-bold' 
                    : currentStep > step.num 
                      ? 'bg-teal-100 text-teal-800' 
                      : 'bg-slate-100 text-slate-400'
                }`}>
                  {currentStep > step.num ? <CheckCircle className="w-4 h-4" /> : step.num}
                </div>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/80 shadow-xl">
        
        {/* ================= STEP 1: PERMIT TYPE ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 1: Select Permit Classification</h2>
              <p className="text-xs text-slate-500 mt-0.5">Unified under Central Motor Vehicles Rules 1989 (Rule 85-B).</p>
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
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPermitCategory(p.id as any)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    permitCategory === p.id
                      ? 'bg-teal-50/90 border-teal-600 ring-2 ring-teal-500/20 shadow-sm'
                      : 'bg-white/80 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">{p.id}</span>
                      <span className="text-[9px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                        {p.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Jurisdiction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Origin State Authority</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    const st = e.target.value;
                    setSelectedState(st);
                    const firstRto = STATES_AND_RTOS[st]?.rtos[0]?.code || 'DL-01';
                    setSelectedRtoCode(firstRto);
                  }}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900"
                >
                  {Object.entries(STATES_AND_RTOS).map(([code, s]) => (
                    <option key={code} value={code}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">State Transport Authority (STA)</label>
                <select
                  value={selectedRtoCode}
                  onChange={(e) => setSelectedRtoCode(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900"
                >
                  {rtoList.map((rto) => (
                    <option key={rto.code} value={rto.code}>{rto.code} - {rto.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleNext}
                className="px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:scale-[1.01]"
              >
                <span>Continue to Vehicle Specs</span>
                <ArrowRight className="w-4 h-4 text-teal-400" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: VEHICLE & COMPLIANCE ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 2: Vehicle Specifications & Compliance</h2>
              <p className="text-xs text-slate-500 mt-0.5">Automated validation with National Vehicle Registry (Vahan OS).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Registration Number</label>
                <input
                  type="text"
                  value={vehicleRegNumber}
                  onChange={(e) => setVehicleRegNumber(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900 font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Seating / Body Configuration</label>
                <input
                  type="text"
                  value={seatingOrPayload}
                  onChange={(e) => setSeatingOrPayload(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Gross Vehicle Weight (GVW in KG)</label>
                <input
                  type="number"
                  value={grossVehicleWeightKg}
                  onChange={(e) => setGrossVehicleWeightKg(Number(e.target.value))}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Permit Validity Term</label>
                <select
                  value={permitPeriodYears}
                  onChange={(e) => setPermitPeriodYears(Number(e.target.value))}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900"
                >
                  <option value={5}>5 Years (Recommended National Term)</option>
                  <option value={3}>3 Years</option>
                  <option value={1}>1 Year Annual</option>
                </select>
              </div>
            </div>

            {/* Compliance Badge Row */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Real-Time Statutory Compliance Verification:</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-emerald-900 pt-1">
                <div>• Fitness: <span className="font-semibold">Valid (Aug 2027)</span></div>
                <div>• Insurance: <span className="font-semibold">Active Comprehensive</span></div>
                <div>• PUCC: <span className="font-semibold">Emission Green Pass</span></div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:scale-[1.01]"
              >
                <span>Continue to Corridors</span>
                <ArrowRight className="w-4 h-4 text-teal-400" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ROUTE CORRIDORS ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 3: Interstate Corridors & Route Matrix</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select high-speed expressway corridors or pan-India single window coverage.</p>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'All Indian States & UTs (National Green Corridor)', desc: 'Complete unrestricted transit across all National Highways, expressways, and border checkposts' },
                { name: 'Delhi - Mumbai Expressway Freight Corridor', desc: 'Fast-track priority electronic toll pass for the NE-4 expressway corridor' },
                { name: 'Golden Quadrilateral Transit Belt', desc: 'Connecting Delhi, Mumbai, Chennai, and Kolkata arterial industrial corridors' },
                { name: 'Western Coastal Tourist Highway', desc: 'Mumbai, Goa, Mangalore, Kochi coastal tourist route coverage' },
              ].map((c) => {
                const isSelected = selectedCorridors.includes(c.name);
                return (
                  <div
                    key={c.name}
                    onClick={() => toggleCorridor(c.name)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-600 ring-2 ring-teal-500/20'
                        : 'bg-white/80 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        <span>{c.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">{c.desc}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:scale-[1.01]"
              >
                <span>Continue to Fee Review</span>
                <ArrowRight className="w-4 h-4 text-teal-400" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: TAX & PAYMENT ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 4: Composite Permit Fee Review</h2>
              <p className="text-xs text-slate-500 mt-0.5">Unified single-window settlement under National Transport Agreement.</p>
            </div>

            {/* Summary */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Applicant / Fleet Entity</span>
                <span className="font-bold text-slate-900">{currentUser.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Vehicle Registration</span>
                <span className="font-mono font-bold text-slate-900">{vehicleRegNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Permit Classification</span>
                <span className="font-bold text-teal-700">{permitCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authorized Validity</span>
                <span className="font-semibold text-slate-900">{permitPeriodYears} Years National Multi-Entry</span>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-2 p-5 rounded-2xl bg-teal-50/50 border border-teal-200 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>National Composite Permit Fee (Central Single Window)</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(totalFee)}</span>
              </div>
              <div className="flex justify-between text-teal-800">
                <span>Border Checkpost Multi-Entry Surcharges</span>
                <span className="font-mono font-bold">INCLUDED (₹0)</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-teal-200 text-sm font-extrabold text-teal-950">
                <span>Total Composite Amount</span>
                <span className="font-mono text-base text-teal-700">{formatINR(totalFee)}</span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="px-8 py-3.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-600/30 hover:scale-[1.01] transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay {formatINR(totalFee)} & Mint Permit</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: GENERATED PERMIT ================= */}
        {currentStep === 5 && completedApplication && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                National Permit Granted!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Permit Number: <strong className="font-mono text-teal-700">{completedApplication.digitalPermitDocument?.permitNumber}</strong>
              </p>
            </div>

            {/* Official Digital Permit Document */}
            <DigitalPermitDocument data={completedApplication} />

            {/* Next Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs font-semibold">
              <Link
                href="/dashboard"
                className="px-6 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all"
              >
                Go to Dashboard
              </Link>
              <Link
                href={`/track?ref=${completedApplication.referenceNumber}`}
                className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
              >
                Track Live Status
              </Link>
              <Link
                href="/documents"
                className="px-6 py-2.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 transition-all"
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
