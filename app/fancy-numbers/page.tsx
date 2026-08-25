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

export default function FancyNumbersPage() {
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
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>E-Auction & Priority Number Allocations</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          VIP & Choice Plate Marketplace
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Discover, simulate, and reserve prestigious Indian registration series with instant allotment certificate generation.
        </p>
      </div>

      {completedApplication ? (
        /* Completed Allotment View */
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/80 shadow-2xl max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-400">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              VIP Number Allocated Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Allotment ID: <strong className="font-mono text-amber-700">{completedApplication.allotmentCertificate?.allotmentId}</strong>
            </p>
          </div>

          <VipAllotmentOrder data={completedApplication} />

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs font-semibold">
            <button
              onClick={() => setCompletedApplication(null)}
              className="px-6 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all"
            >
              Browse More Numbers
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/documents"
              className="px-6 py-2.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition-all"
            >
              View in GatiLocker
            </Link>
          </div>
        </div>
      ) : (
        /* Marketplace & Live Preview Studio */
        <div className="space-y-10">
          
          {/* ================= INTERACTIVE PLATE STUDIO HERO ================= */}
          <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/80 shadow-xl bg-gradient-to-br from-white/90 via-slate-50/70 to-amber-50/40">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Plate Display */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-10 bg-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-slate-700">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                
                {/* Plate Style Toggle Pills */}
                <div className="flex items-center gap-2 mb-6 z-10 text-[10px] font-bold">
                  <span className="text-slate-400 uppercase tracking-widest mr-1 hidden sm:inline">Theme:</span>
                  {[
                    { id: 'luxury', label: 'Luxury Black' },
                    { id: 'private', label: 'White Private' },
                    { id: 'ev', label: 'EV Green' },
                    { id: 'commercial', label: 'Commercial' },
                  ].map((thm) => (
                    <button
                      key={thm.id}
                      onClick={() => setSelectedPlateTheme(thm.id as any)}
                      className={`px-3 py-1 rounded-full border transition-all ${
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
                <div className="flex items-center justify-between w-full max-w-sm mt-6 pt-4 border-t border-white/10 text-[11px] text-slate-400 z-10">
                  <span>State: <strong className="text-slate-200">{selectedNumber.state}</strong></span>
                  <span>Numerology Sum: <strong className="text-amber-400 font-mono text-xs">#{selectedNumber.numerologySum}</strong></span>
                  <span>Tag: <strong className="text-emerald-400">{selectedNumber.tag}</strong></span>
                </div>
              </div>

              {/* Right Details & Fast Booking Action */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedNumber.category}
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Ends in {selectedNumber.auctionEndsIn}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {selectedNumber.fullPlateText}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  High-profile allocation in {selectedNumber.rto}. Immediate reserve deposit locks the number for vehicle registration.
                </p>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Reserve Price / Buy Now</span>
                    <span className="text-2xl font-black text-slate-900 font-mono">{formatINR(selectedNumber.price)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {selectedNumber.bidsCount} Active Bids
                    </span>
                  </div>
                </div>

                {/* Target Vehicle Input */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Target Vehicle Model / VIN for Allocation
                  </label>
                  <input
                    type="text"
                    value={targetVehicle}
                    onChange={(e) => setTargetVehicle(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-medium text-slate-900"
                    placeholder="e.g. BMW M340i, Tata Safari, Porsche 911"
                  />
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  onClick={() => handleSelectToBuy(selectedNumber)}
                  className="w-full py-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Reserve {selectedNumber.number} for {formatINR(selectedNumber.price)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* ================= SEARCH & CATEGORY FILTER BAR ================= */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              
              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search numbers e.g. 0001, 786, 9999..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full glass-input text-xs font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Numerology Lucky Sum Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
                <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
                  <Hash className="w-3.5 h-3.5 text-amber-600" />
                  Lucky Sum:
                </span>
                <button
                  onClick={() => setSelectedSum(null)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    selectedSum === null 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  All
                </button>
                {[1, 3, 7, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedSum(num === selectedSum ? null : num)}
                    className={`w-7 h-7 rounded-full text-xs font-mono font-bold shrink-0 transition-all ${
                      selectedSum === num 
                        ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-300' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
              {[
                { id: 'ALL', label: 'All Patterns' },
                { id: 'Super VIP', label: '👑 Super VIP' },
                { id: 'Quad Mirror', label: '✨ Quad Mirrors' },
                { id: 'Auspicious', label: '🕊️ Auspicious' },
                { id: 'Sequence', label: '📈 Sequence' },
                { id: 'Milestone', label: '🎯 Milestone' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'glass-panel text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* ================= NUMBERS CARDS GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNumbers.map((item) => {
              const isSelected = selectedNumber.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedNumber(item)}
                  className={`glass-panel p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg bg-amber-50/30'
                      : 'border-white/80 hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Row: Category & Sum */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Sum: {item.numerologySum}
                        </span>
                        <span>•</span>
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

                    <div className="text-center mt-3">
                      <span className="text-xs font-semibold text-slate-700">{item.tag}</span>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.rto}</div>
                    </div>
                  </div>

                  {/* Bottom: Price & Quick Action */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Reserve Price</span>
                      <span className="text-base font-extrabold text-slate-900 font-mono">{formatINR(item.price)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectToBuy(item);
                      }}
                      className="px-4 py-2 rounded-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <span>Reserve</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
