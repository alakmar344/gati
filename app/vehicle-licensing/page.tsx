'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Car, 
  Zap, 
  ShieldCheck, 
  FileText, 
  Upload, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Info, 
  CreditCard,
  Building,
  User,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { STATES_AND_RTOS } from '@/lib/mockData';
import { VehicleLicensingData, PaymentReceipt } from '@/lib/types';
import { getCurrentUser, saveApplication, saveDocument } from '@/lib/storage';
import { formatINR, generateReferenceNumber } from '@/lib/utils';
import { GatiPayModal } from '@/components/payment/GatiPayModal';
import { DigitalRcSmartCard } from '@/components/documents/DigitalRcSmartCard';

export default function VehicleLicensingPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

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
        fatherName: 'RAMANATHA SHARMA',
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
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Car className="w-3.5 h-3.5" />
          <span>Vehicle Registration Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Vehicle Licensing & RC
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Complete paperless registration for new vehicles, ownership transfers, and EV green fleets.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      {currentStep <= 4 && (
        <div className="mb-8 glass-panel p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-semibold">
            {[
              { num: 1, label: 'Vehicle Specs' },
              { num: 2, label: 'RTO & Region' },
              { num: 3, label: 'Owner & KYC' },
              { num: 4, label: 'Tax & Review' }
            ].map((step) => (
              <div 
                key={step.num}
                className={`flex items-center gap-2 ${
                  currentStep === step.num 
                    ? 'text-emerald-700 font-bold' 
                    : currentStep > step.num 
                      ? 'text-slate-800' 
                      : 'text-slate-400'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                  currentStep === step.num 
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 font-bold' 
                    : currentStep > step.num 
                      ? 'bg-emerald-100 text-emerald-800' 
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

      {/* Step Content Container */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/80 shadow-xl">
        
        {/* ================= STEP 1: VEHICLE PROFILE ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 1: Vehicle Specifications</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select the registration type and vehicle details.</p>
            </div>

            {/* Registration Category */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Registration Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  'New Private Vehicle',
                  'Ownership Transfer',
                  'Commercial Green Fleet',
                  'Vintage / Classic'
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setRegistrationCategory(cat as any)}
                    className={`p-3 rounded-2xl border text-xs font-semibold text-left transition-all ${
                      registrationCategory === cat
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Vehicle Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: '2W Motorcycle / Scooter', icon: '🛵' },
                  { label: '4W Passenger Car', icon: '🚗' },
                  { label: 'Electric Vehicle (EV)', icon: '⚡' },
                  { label: 'Heavy Commercial', icon: '🚚' }
                ].map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => {
                      setVehicleType(t.label as any);
                      if (t.label === 'Electric Vehicle (EV)') {
                        setFuelType('Electric');
                      }
                    }}
                    className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      vehicleType === t.label
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span>{t.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Make / Model / Fuel / Invoice Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Manufacturer / Make</label>
                <input
                  type="text"
                  value={maker}
                  onChange={(e) => setMaker(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900"
                  placeholder="e.g. Tata Motors, Hyundai, Ather"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Model & Variant</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900"
                  placeholder="e.g. Nexon EV Empowered+"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as any)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900"
                >
                  <option value="Electric">⚡ Electric (100% Tax Exemption)</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Strong Hybrid">Strong Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ex-Showroom Invoice Value (₹)
                </label>
                <input
                  type="number"
                  value={invoiceValue}
                  onChange={(e) => setInvoiceValue(Number(e.target.value))}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900 font-mono"
                  step="10000"
                />
              </div>
            </div>

            {/* EV Incentive Highlight Banner */}
            {isEV && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Green Mobility Incentive Applied</strong>
                  Under State Clean Vehicle Policy, electric vehicles receive <strong>0% Road Tax</strong> and exemption from green cess.
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleNext}
                className="px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:scale-[1.01] transition-all"
              >
                <span>Continue to RTO Selection</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: STATE & RTO ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 2: State & RTO Jurisdiction</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select the transport office under whose jurisdiction the vehicle will be registered.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">State / Union Territory</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    const st = e.target.value;
                    setSelectedState(st);
                    const firstRto = STATES_AND_RTOS[st]?.rtos[0]?.code || 'KA-01';
                    setSelectedRtoCode(firstRto);
                  }}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900"
                >
                  {Object.entries(STATES_AND_RTOS).map(([code, s]) => (
                    <option key={code} value={code}>
                      {s.name} ({code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Assigned RTO Office</label>
                <select
                  value={selectedRtoCode}
                  onChange={(e) => setSelectedRtoCode(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900"
                >
                  {rtoList.map((rto) => (
                    <option key={rto.code} value={rto.code}>
                      {rto.code} - {rto.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected RTO Preview Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                  {currentRto.code}
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">{currentRto.name}</div>
                  <div className="text-[11px] text-slate-500">{stateData.name} State Transport Department</div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-bold">
                  Paperless FastTrack
                </span>
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
                <span>Continue to Owner Details</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: OWNER & SPECS ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 3: Ownership & VIN Specs</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pre-filled with your verified Aadhaar and DigiLocker credentials.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Registered Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile (Linked to Aadhaar)</label>
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Chassis / VIN Number</label>
                <input
                  type="text"
                  value={chassisNumber}
                  onChange={(e) => setChassisNumber(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900 font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Engine / Motor Serial</label>
                <input
                  type="text"
                  value={engineNumber}
                  onChange={(e) => setEngineNumber(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900 font-mono uppercase"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Residential Registration Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Document Checklist Checklist */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                DigiLocker Auto-Attached Documents
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { key: 'invoice', label: 'Form 21 Sale Invoice' },
                  { key: 'insurance', label: 'Valid Motor Insurance' },
                  { key: 'form21', label: 'Roadworthiness Cert' },
                  { key: 'aadhaarKyc', label: 'Aadhaar e-KYC Pass' }
                ].map((doc) => (
                  <div key={doc.key} className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-semibold truncate">{doc.label}</span>
                  </div>
                ))}
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
                <span>Continue to Fee Review</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: TAX & REVIEW ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 4: Statutory Fee Breakdown & Review</h2>
              <p className="text-xs text-slate-500 mt-0.5">Transparent calculation with zero hidden government surcharges.</p>
            </div>

            {/* Application Summary Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Applicant / Owner</span>
                <span className="font-bold text-slate-900">{ownerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Vehicle Model</span>
                <span className="font-bold text-slate-900">{maker} {model} ({fuelType})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">RTO Jurisdiction</span>
                <span className="font-bold text-slate-900">{currentRto.code} - {currentRto.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ex-Showroom Price</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(invoiceValue)}</span>
              </div>
            </div>

            {/* Fee Table */}
            <div className="space-y-2 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>State Motor Vehicle Road Tax ({isEV ? '0% EV Policy' : '14% Standard'})</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(roadTax)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Green Environment Cess</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(greenCess)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Microchip Smart Card & User Fee</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(smartCardFee)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-emerald-200 text-sm font-extrabold text-emerald-950">
                <span>Total Statutory Amount</span>
                <span className="font-mono text-base text-emerald-700">{formatINR(totalFee)}</span>
              </div>
            </div>

            {/* Action Buttons */}
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
                onClick={handleProceedToPayment}
                className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 hover:scale-[1.01] transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay {formatINR(totalFee)} & Issue Smart RC</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: COMPLETED SMART RC ================= */}
        {currentStep === 5 && completedApplication && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Vehicle Registration Successful!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Ref No: <strong className="font-mono text-sky-700">{completedApplication.referenceNumber}</strong>
              </p>
            </div>

            {/* Digital Smart Card Display */}
            <DigitalRcSmartCard data={completedApplication} />

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
                className="px-6 py-2.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all"
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
