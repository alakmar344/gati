'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Flame, 
  Award, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  ArrowRight, 
  CreditCard,
  Hash,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { HsrpPlate } from '@/components/plates/HsrpPlate';
import { MOCK_FANCY_NUMBERS, STATES_AND_RTOS } from '@/lib/mockData';
import { FancyNumberItem, FancyNumberApplication, PaymentReceipt } from '@/lib/types';
import { getCurrentUser, saveApplication, saveDocument } from '@/lib/storage';
import { formatINR, generateReferenceNumber } from '@/lib/utils';
import { GatiPayModal } from '@/components/payment/GatiPayModal';
import { VipAllotmentOrder } from '@/components/documents/VipAllotmentOrder';
import { SectionHeading, Pill } from '@/components/ui/Primitives';
import { Field, TextInput, OptionGrid } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All Patterns' },
  { value: 'Super VIP', label: '👑 Super VIP' },
  { value: 'Quad Mirror', label: '✨ Quad Mirrors' },
  { value: 'Auspicious', label: '🕊️ Auspicious' },
  { value: 'Sequence', label: '📈 Sequence' },
  { value: 'Milestone', label: '🎯 Milestone' },
];

const SUM_OPTIONS = [
  { value: 'ALL', label: 'All sums' },
  { value: '1', label: 'Sum 1' },
  { value: '3', label: 'Sum 3' },
  { value: '7', label: 'Sum 7' },
  { value: '9', label: 'Sum 9' },
];

export default function FancyNumbersPage() {
  const { toast } = useToast();
  const [currentUser] = useState(getCurrentUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSum, setSelectedSum] = useState<number | null>(null);
  const [selectedPlateTheme, setSelectedPlateTheme] = useState<'private' | 'luxury' | 'ev' | 'commercial'>('luxury');
  
  // Active Selected Number for Detail & Modal
  const [selectedNumber, setSelectedNumber] = useState<FancyNumberItem>(MOCK_FANCY_NUMBERS[1]); // default to 0007
  const [targetVehicle, setTargetVehicle] = useState('Porsche Taycan / Mercedes EQS');
  
  // Checkout & Completion State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedApplication, setCompletedApplication] = useState<FancyNumberApplication | null>(null);

  // Filter Numbers
  const filteredNumbers = useMemo(() => {
    return MOCK_FANCY_NUMBERS.filter((item) => {
      const matchesSearch = 
        item.number.includes(searchQuery) ||
        item.fullPlateText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'ALL' || item.category === selectedCategory;

      const matchesSum = 
        selectedSum === null || item.numerologySum === selectedSum;

      return matchesSearch && matchesCategory && matchesSum;
    });
  }, [searchQuery, selectedCategory, selectedSum]);

  const handleSelectToBuy = (num: FancyNumberItem) => {
    setSelectedNumber(num);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (receipt: PaymentReceipt) => {
    setIsPaymentOpen(false);

    const refNo = generateReferenceNumber('FN');
    const allotmentId = `ALLOT-${selectedNumber.state.slice(0, 2).toUpperCase()}-2026-${selectedNumber.number}`;

    const newApp: FancyNumberApplication = {
      id: `app-fn-${Date.now()}`,
      referenceNumber: refNo,
      serviceType: 'fancy-numbers',
      title: `VIP Plate Allotment (${selectedNumber.fullPlateText})`,
      userId: currentUser.id,
      applicantName: currentUser.name,
      phone: currentUser.phone,
      email: currentUser.email,
      state: selectedNumber.state,
      rtoCode: selectedNumber.rto.split(' ')[0],
      rtoName: selectedNumber.rto,
      status: 'card_generated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedCompletion: 'Allotment Confirmed',
      currentStepIndex: 4,
      totalSteps: 4,
      nextActionLabel: 'View Allotment Order',
      selectedNumber: selectedNumber,
      targetVehicleNumber: targetVehicle,
      payment: receipt,
      timeline: [
        { title: 'Choice Number Reserved', description: `${selectedNumber.fullPlateText} locked in E-Auction ledger`, timestamp: 'Just now', completed: true },
        { title: 'Statutory Advance Paid', description: `${formatINR(selectedNumber.price)} settled via ${receipt.paymentMethod}`, timestamp: 'Just now', completed: true },
        { title: 'RTO Allotment Approved', description: 'Single-applicant priority clearance granted', timestamp: 'Just now', completed: true },
        { title: 'Official Certificate Minted', description: '90-Day valid reservation certificate ready', timestamp: 'Just now', completed: true, current: true }
      ],
      allotmentCertificate: {
        allotmentId: allotmentId,
        allocatedNumber: selectedNumber.fullPlateText,
        series: selectedNumber.series,
        allotteeName: currentUser.name.toUpperCase(),
        rtoJurisdiction: selectedNumber.rto,
        allotmentDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
        validityWindowDays: 90,
        receiptRef: receipt.transactionId,
        qrData: `GATI-VIP:${selectedNumber.fullPlateText}:${currentUser.name}:VALID_90_DAYS`
      }
    };

    saveApplication(newApp);

    // Save certificate in GatiLocker
    saveDocument({
      id: `doc-vip-${Date.now()}`,
      type: 'VIP_ALLOTMENT_ORDER',
      title: `VIP Allotment: ${selectedNumber.fullPlateText}`,
      documentNumber: allotmentId,
      holderName: currentUser.name,
      issueDate: new Date().toISOString(),
      expiryDate: '2026-11-25',
      status: 'VALID',
      referenceId: refNo,
      details: {
        number: selectedNumber.fullPlateText,
        price: selectedNumber.price,
        category: selectedNumber.category,
        rto: selectedNumber.rto
      }
    });

    setCompletedApplication(newApp);

    toast({
      title: 'VIP number allotted',
      description: `${selectedNumber.fullPlateText} reserved — certificate saved to GatiLocker.`,
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <SectionHeading
        eyebrow="E-Auction & Priority Allocations"
        icon={<Sparkles className="w-3.5 h-3.5 text-amber-600" />}
        title="VIP & Choice Plate Studio"
        subtitle="Discover, simulate, and reserve prestigious Indian registration series with instant allotment certificate generation."
        className="mb-10 animate-rise"
      />

      {completedApplication ? (
        /* Completed Allotment View */
        <div className="card p-8 sm:p-12 max-w-3xl mx-auto space-y-8 animate-rise">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="eyebrow text-amber-700">Allotment Confirmed</div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1.5">
              VIP Number Allocated Successfully
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Allotment ID: <strong className="font-mono text-amber-700">{completedApplication.allotmentCertificate?.allotmentId}</strong>
            </p>
          </div>

          <VipAllotmentOrder data={completedApplication} />

          <div className="hairline border-t pt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
            <button
              onClick={() => setCompletedApplication(null)}
              className="btn btn-primary px-6 py-2.5 text-sm"
            >
              Browse More Numbers
            </button>
            <Link href="/dashboard" className="btn btn-ghost px-6 py-2.5 text-sm">
              Go to Dashboard
            </Link>
            <Link
              href="/documents"
              className="btn px-6 py-2.5 text-sm bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100"
            >
              View in GatiLocker
            </Link>
          </div>
        </div>
      ) : (
        /* Marketplace & Live Preview Studio */
        <div className="space-y-10">
          
          {/* ================= INTERACTIVE PLATE STUDIO HERO ================= */}
          <div className="clay-card p-6 sm:p-8 animate-rise">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

              {/* Left Plate Display */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-10 bg-slate-900 dark:bg-slate-950 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Plate Style Toggle Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6 z-10 text-[11px] font-bold">
                  <span className="text-slate-400 uppercase tracking-widest mr-1 hidden sm:inline">Theme</span>
                  {[
                    { id: 'luxury', label: 'Luxury Black' },
                    { id: 'private', label: 'White Private' },
                    { id: 'ev', label: 'EV Green' },
                    { id: 'commercial', label: 'Commercial' },
                  ].map((thm) => (
                    <button
                      key={thm.id}
                      onClick={() => setSelectedPlateTheme(thm.id as any)}
                      className={`min-h-[36px] px-3.5 py-1.5 rounded-full border transition-all ${
                        selectedPlateTheme === thm.id
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                          : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'
                      }`}
                    >
                      {thm.label}
                    </button>
                  ))}
                </div>

                {/* The HSRP Plate */}
                <div className="z-10 py-2">
                  <HsrpPlate
                    plateText={selectedNumber.fullPlateText}
                    vehicleType={selectedPlateTheme}
                    size="hero"
                    className="scale-100 sm:scale-105 shadow-2xl"
                  />
                </div>

                {/* Sub-bar */}
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 w-full max-w-sm mt-6 pt-4 border-t border-white/10 text-[11px] text-slate-400 z-10">
                  <span>State <strong className="text-slate-200">{selectedNumber.state}</strong></span>
                  <span>Sum <strong className="text-amber-400 font-mono">#{selectedNumber.numerologySum}</strong></span>
                  <span>Tag <strong className="text-emerald-400">{selectedNumber.tag}</strong></span>
                </div>
              </div>

              {/* Right Details & Fast Booking Action */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <Pill tone="amber">{selectedNumber.category}</Pill>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Ends in {selectedNumber.auctionEndsIn}
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {selectedNumber.fullPlateText}
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  High-profile allocation in {selectedNumber.rto}. Immediate reserve deposit locks the number for vehicle registration.
                </p>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-wide text-amber-700/80 dark:text-amber-400 block">Reserve Price / Buy Now</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatINR(selectedNumber.price)}</span>
                  </div>
                  <Pill tone="emerald">{selectedNumber.bidsCount} Active Bids</Pill>
                </div>

                {/* Target Vehicle Input */}
                <Field
                  label="Target Vehicle for Allocation"
                  hint="The vehicle this plate will be assigned to"
                >
                  <TextInput
                    value={targetVehicle}
                    onValue={setTargetVehicle}
                    transform="upper"
                    mono
                    placeholder="e.g. KA 01 AB 1234"
                  />
                </Field>

                {/* Action CTA */}
                <button
                  type="button"
                  onClick={() => handleSelectToBuy(selectedNumber)}
                  className="clay-btn clay-btn-saffron w-full min-h-[44px] py-3 text-sm text-white shadow-lg"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Reserve {selectedNumber.number} for {formatINR(selectedNumber.price)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* ================= SEARCH & CATEGORY FILTER BAR ================= */}
          <div className="clay-card p-5 sm:p-6 space-y-6">

            {/* Search Box */}
            <Field label="Search plates" hint="Search by number, series, or RTO">
              <TextInput
                value={searchQuery}
                onValue={setSearchQuery}
                prefix={<Search className="w-4 h-4" />}
                placeholder="e.g. 0001, 786, 9999..."
              />
            </Field>

            {/* Category Filter Chips */}
            <Field label="Pattern category">
              <OptionGrid
                tone="amber"
                columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
                options={CATEGORY_OPTIONS}
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </Field>

            {/* Numerology Lucky Sum Filter */}
            <Field label="Lucky sum" hint="Numerology total of the digits">
              <OptionGrid
                tone="amber"
                columns="grid-cols-3 sm:grid-cols-5"
                options={SUM_OPTIONS}
                value={selectedSum === null ? 'ALL' : String(selectedSum)}
                onChange={(v) => setSelectedSum(v === 'ALL' ? null : Number(v))}
              />
            </Field>
          </div>

          {/* ================= NUMBERS CARDS GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {filteredNumbers.map((item) => {
              const isSelected = selectedNumber.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedNumber(item)}
                  className={`clay-card clay-card-interactive p-6 cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-50/40 dark:bg-amber-950/30'
                      : ''
                  }`}
                >
                  <div>
                    {/* Top Row: Category & Sum */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <Pill tone="amber">{item.category}</Pill>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-mono font-bold text-amber-700 dark:text-amber-400">Sum {item.numerologySum}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span>{item.state.split(' ')[0]}</span>
                      </div>
                    </div>

                    {/* Plate Preview */}
                    <div className="flex justify-center my-3">
                      <HsrpPlate
                        plateText={item.fullPlateText}
                        vehicleType="private"
                        size="md"
                        className="group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="text-center mt-4">
                      <div className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">{item.fullPlateText}</div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">{item.tag}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{item.rto}</div>
                    </div>
                  </div>

                  {/* Bottom: Price & Quick Action */}
                  <div className="mt-6 pt-4 hairline border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500 block font-bold">Reserve Price</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{formatINR(item.price)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectToBuy(item);
                      }}
                      className="clay-btn clay-btn-saffron min-h-[40px] px-4 py-2 text-xs text-white shadow-sm font-bold flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay &amp; Reserve</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Payment Modal */}
      <GatiPayModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        serviceType="fancy-numbers"
        serviceTitle={`VIP Number Allotment: ${selectedNumber.fullPlateText}`}
        applicationNumber={`TEMP-FN-${selectedNumber.number}`}
        amount={selectedNumber.price}
        payerName={currentUser.name}
        payerEmail={currentUser.email}
        onPaymentSuccess={handlePaymentSuccess}
      />

    </div>
  );
}
