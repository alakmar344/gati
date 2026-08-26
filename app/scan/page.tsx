'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Upload,
  ScanLine,
  CheckCircle,
  FileText,
  CreditCard,
  Car,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  RotateCw
} from 'lucide-react';
import { HsrpPlate } from '@/components/plates/HsrpPlate';
import { SectionHeading, Pill } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';

interface ScannedResult {
  docType: 'RC' | 'DL' | 'PLATE' | 'INSURANCE';
  confidence: number;
  extractedFields: Record<string, string>;
  healthFlags: {
    label: string;
    status: 'OK' | 'WARNING' | 'EXPIRED';
    desc: string;
  }[];
  suggestedAction: {
    label: string;
    route: string;
  };
}

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeResult, setActiveResult] = useState<ScannedResult | null>(null);
  const [selectedSample, setSelectedSample] = useState<string>('rc-nexon');

  const samplePresets: Record<string, ScannedResult> = {
    'rc-nexon': {
      docType: 'RC',
      confidence: 99.4,
      extractedFields: {
        'Registration Number': 'KA 01 EK 4920',
        'Owner Name': 'VIKRAMADITYA SHARMA',
        'Vehicle Model': 'TATA NEXON.EV EMPOWERED PLUS LR',
        'Chassis VIN': 'MAT629472NZ91024',
        'Engine / Motor Serial': 'EV40KWH928104',
        'Fuel Type': 'ELECTRIC (ZERO EMISSION)',
        'Issuing RTO': 'KA-01 (Bengaluru Central)',
        'Registration Date': '22-AUG-2026',
        'Fitness Validity': '21-AUG-2041'
      },
      healthFlags: [
        { label: 'PUCC Emission Test', status: 'OK', desc: 'EV Zero-Emission Exemption Valid' },
        { label: 'Motor Insurance', status: 'OK', desc: 'Active Comprehensive (HDFC ERGO)' },
        { label: 'E-Challan Radar', status: 'WARNING', desc: '1 Pending Signal Camera Challan (₹1,000)' }
      ],
      suggestedAction: {
        label: 'Pay Pending Challan with 1-Tap UPI',
        route: '/challans'
      }
    },
    'dl-ananya': {
      docType: 'DL',
      confidence: 98.9,
      extractedFields: {
        'Licence Number': 'MH 12 2026 0094821',
        'Holder Name': 'ANANYA DESHMUKH',
        'Date of Birth': '14-MAY-1998',
        'Blood Group': 'O+VE',
        'Authorised Classes': 'MCWG, LMV',
        'Issuing Authority': 'RTO PUNE (MH-12)',
        'Valid Upto': '24-AUG-2046',
        'Organ Donor Status': 'PLEDGED'
      },
      healthFlags: [
        { label: 'ADTT Sensor Test Track', status: 'OK', desc: 'Test Cleared on 25 Aug 2026' },
        { label: 'Biometric Smart Card', status: 'OK', desc: 'ISO-7816 Microchip Synchronized' }
      ],
      suggestedAction: {
        label: 'View 3D Digital PVC Licence',
        route: '/documents'
      }
    },
    'hsrp-plate': {
      docType: 'PLATE',
      confidence: 99.8,
      extractedFields: {
        'Detected Plate Text': 'MH 02 CZ 0007',
        'Classification': 'SUPER VIP CHOICE SERIES',
        'State Jurisdiction': 'MAHARASHTRA (MH-02 MUMBAI WEST)',
        'HSRP Laser PIN': 'IN7492019',
        'Chakra Hologram': 'VERIFIED AUTHENTIC',
        'E-Auction Value': '₹1,85,000'
      },
      healthFlags: [
        { label: 'Allocation Window', status: 'OK', desc: 'Allotted for 90 Days (Valid)' },
        { label: 'Security Screws', status: 'OK', desc: 'Laser Etched Snap-Off Fasteners' }
      ],
      suggestedAction: {
        label: 'Inspect VIP Number Certificate',
        route: '/fancy-numbers'
      }
    }
  };

  const handleTriggerScan = (presetKey: string) => {
    setSelectedSample(presetKey);
    setIsScanning(true);
    setScanProgress(0);
    setActiveResult(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setActiveResult(samplePresets[presetKey]);
          toast({
            title: 'Extraction complete',
            description: `${samplePresets[presetKey].confidence}% confidence match`,
            variant: 'success',
          });
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <SectionHeading
        eyebrow="Sub-Second OCR & Diagnostic Engine"
        icon={<ScanLine className="w-3.5 h-3.5" />}
        title="Gati Smart Lens"
        subtitle="Scan any physical Indian Registration Card, Driving Licence, or HSRP Number Plate to extract fields with 100% precision."
      />

      {/* Interactive Lens Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* Left Scanner Viewport */}
        <div className="lg:col-span-6 card p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-olive-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-olive-600" />
                <span>Camera / OCR Viewport</span>
              </span>
              <Pill tone="olive">Live Ready</Pill>
            </div>

            {/* Viewfinder Screen */}
            <div className="aspect-[4/3] rounded-2xl bg-olive-950 border border-olive-800 relative overflow-hidden flex flex-col items-center justify-center p-6 text-white shadow-2xl">

              {/* Grid HUD Overlay */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

              {/* Viewfinder Corners */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-olive-400" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-olive-400" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-olive-400" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-olive-400" />

              {/* Scanner Line Animation */}
              {isScanning && (
                <div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-olive-400 to-transparent shadow-[0_0_15px_#10b981] transition-all duration-150"
                  style={{ top: `${scanProgress}%` }}
                />
              )}

              {/* Center Content / Sample Preview */}
              <div className="text-center z-10 space-y-3">
                {selectedSample === 'rc-nexon' && (
                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs">
                    <div className="font-mono font-bold text-olive-400">CERTIFICATE OF REGISTRATION</div>
                    <div className="font-mono text-[11px] text-olive-200 mt-1">KA 01 EK 4920 • TATA NEXON EV</div>
                  </div>
                )}

                {selectedSample === 'dl-ananya' && (
                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs">
                    <div className="font-mono font-bold text-ashoka-400">UNION OF INDIA DRIVING LICENCE</div>
                    <div className="font-mono text-[11px] text-olive-200 mt-1">MH 12 2026 0094821 • ANANYA D</div>
                  </div>
                )}

                {selectedSample === 'hsrp-plate' && (
                  <div className="scale-90">
                    <HsrpPlate plateText="MH 02 CZ 0007" vehicleType="luxury" size="sm" />
                  </div>
                )}

                <div className="text-[11px] text-olive-500/80 uppercase tracking-widest font-mono">
                  {isScanning ? `DECODING CHIP & OCR MATRIX (${scanProgress}%)...` : 'DOCUMENT IN FOCUS'}
                </div>
              </div>
            </div>
          </div>

          {/* Preset Buttons for Instant 1-Tap Test */}
          <div className="space-y-3">
            <span className="eyebrow text-olive-700/70 block">
              1-Tap Test Documents
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleTriggerScan('rc-nexon')}
                className={`p-3 rounded-xl border font-semibold transition-all ${
                  selectedSample === 'rc-nexon'
                    ? 'bg-olive-50 border-olive-500 text-olive-900 ring-2 ring-olive-500/20'
                    : 'bg-white border-olive-200 text-olive-800 hover:bg-olive-50'
                }`}
              >
                🚗 Smart RC
              </button>

              <button
                type="button"
                onClick={() => handleTriggerScan('dl-ananya')}
                className={`p-3 rounded-xl border font-semibold transition-all ${
                  selectedSample === 'dl-ananya'
                    ? 'bg-ashoka-50 border-ashoka-500 text-ashoka-900 ring-2 ring-ashoka-500/20'
                    : 'bg-white border-olive-200 text-olive-800 hover:bg-olive-50'
                }`}
              >
                💳 PVC Driving Licence
              </button>

              <button
                type="button"
                onClick={() => handleTriggerScan('hsrp-plate')}
                className={`p-3 rounded-xl border font-semibold transition-all ${
                  selectedSample === 'hsrp-plate'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                    : 'bg-white border-olive-200 text-olive-800 hover:bg-olive-50'
                }`}
              >
                👑 VIP HSRP Plate
              </button>
            </div>
          </div>
        </div>

        {/* Right Scanned Extraction & Health Audit */}
        <div className="lg:col-span-6 card p-6 sm:p-8 flex flex-col justify-between gap-6">
          {activeResult ? (
            <div className="space-y-5 animate-rise">

              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b hairline pb-4">
                <div>
                  <span className="eyebrow text-olive-700 block">
                    Instant Extraction Completed
                  </span>
                  <h3 className="font-display text-lg font-extrabold tracking-tight text-olive-950 mt-1">
                    {activeResult.docType === 'RC' && 'Vehicle Registration Verified'}
                    {activeResult.docType === 'DL' && 'Driving Licence Credentials Extracted'}
                    {activeResult.docType === 'PLATE' && 'HSRP Plate Telemetry Match'}
                  </h3>
                </div>
                <Pill tone="olive" className="font-mono shrink-0">
                  {activeResult.confidence}% Match
                </Pill>
              </div>

              {/* Extracted Fields Table */}
              <div className="bg-olive-50 p-4 rounded-2xl border hairline text-sm divide-y divide-olive-200/60">
                {Object.entries(activeResult.extractedFields).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center gap-4 py-2 first:pt-0 last:pb-0">
                    <span className="text-olive-700/70 text-xs">{k}</span>
                    <span className="font-mono font-bold text-olive-950 text-right text-xs">{v}</span>
                  </div>
                ))}
              </div>

              {/* Health Flags Audit */}
              <div className="space-y-2.5">
                <span className="eyebrow text-olive-700 block">
                  Statutory Health & Radar Flags
                </span>
                <div className="space-y-2">
                  {activeResult.healthFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                        flag.status === 'WARNING'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : flag.status === 'EXPIRED'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-olive-50/60 border-olive-200 text-olive-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {flag.status === 'WARNING' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-olive-600 shrink-0" />
                        )}
                        <span className="font-semibold">{flag.label}</span>
                      </div>
                      <span className="text-[11px] text-olive-700 text-right">{flag.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={activeResult.suggestedAction.route}
                className="btn btn-primary w-full py-3 text-sm"
              >
                <span>{activeResult.suggestedAction.label}</span>
                <ArrowRight className="w-4 h-4 text-olive-400" />
              </Link>
            </div>
          ) : (
            <div className="py-16 text-center space-y-5 my-auto">
              <div className="w-14 h-14 rounded-full bg-olive-50 text-olive-500 flex items-center justify-center mx-auto">
                <ScanLine className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display text-lg font-extrabold tracking-tight text-olive-950">Ready to Scan</h3>
                <p className="text-sm text-olive-700/70 max-w-xs mx-auto mt-1.5 leading-relaxed">
                  Click any of the 1-tap test documents on the left to simulate instant sub-second OCR extraction.
                </p>
              </div>
              <button
                onClick={() => handleTriggerScan('rc-nexon')}
                className="btn btn-brand px-6 py-2.5 text-sm"
              >
                <Zap className="w-4 h-4" />
                <span>Scan Sample RC Now</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
