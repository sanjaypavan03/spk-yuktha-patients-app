'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEmergencyInfoFetch } from '@/hooks/use-emergency-info-fetch';
import { AlertTriangle, Loader2, Phone, ShieldCheck, User, Droplets, Activity, HeartPulse, Stethoscope, Lock, ArrowRight, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function EmergencyPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const [isRevealed, setIsRevealed] = useState(false);

  const { data: emergencyInfo, loading, error } = useEmergencyInfoFetch(token);

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#10B981]" />
          <p className="text-sm text-slate-400 animate-pulse">
            Establishing Secure Connection…
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- Error ---------------- */
  if (error || !emergencyInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 text-white">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800 shadow-2xl">
          <CardContent className="p-8 space-y-4 text-center">
            <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold">Access Denied</h2>
            <p className="text-sm text-slate-400">
              This emergency QR code is invalid, deactivated, or has expired.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }  const phoneMatch =
    emergencyInfo.emergencyContact1Phone?.match(/[\d\-\+\(\)\s]{8,}/);

  /* ---------------- Privacy Gate (Before Reveal) ---------------- */
  if (!isRevealed) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center font-primary">
        <div className="max-w-md w-full space-y-10 animate-in fade-in zoom-in duration-700">
          
          {/* Header Area matching Mobile Vault */}
          <div className="space-y-2">
             <div className="bg-[#10B981]/10 px-4 py-1.5 rounded-full border border-[#10B981]/20 w-fit mx-auto mb-6">
                <p className="text-[#10B981] text-[10px] font-black uppercase tracking-[0.2em]">Verified Identity</p>
             </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#10B981] blur-3xl opacity-30 animate-pulse" />
              <div className="relative bg-slate-900 border-2 border-[#10B981] p-10 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="h-20 w-20 text-[#10B981]" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold tracking-tight text-white">{emergencyInfo.userName}</h2>
            <h1 className="text-xl font-medium text-slate-400 uppercase tracking-[0.15em]">EMERGENCY ID FOUND</h1>
          </div>

          <div className="py-4">
             <Button 
                onClick={async () => {
                  setIsRevealed(true);
                  // Fire the scan alert & log via POST
                  try {
                    await fetch(`/api/emergency/${token}`, { method: 'POST' });
                  } catch (e) {
                    console.error('Failed to trigger scan alert:', e);
                  }
                }}
                className="w-full h-20 text-xl font-black bg-[#10B981] hover:bg-[#059669] text-white shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)] rounded-[2.5rem] transition-all active:scale-95 border-b-4 border-emerald-800"
              >
                ACCESS MEDICAL RECORD
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
          </div>

          <div className="space-y-6 pt-6 border-t border-slate-800/50">
            <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed italic">
              Access is restricted to emergency responders. Family members will be automatically notified upon reveal.
            </p>
            
            <div className="space-y-3">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Medical Professional?</p>
               <Button 
                asChild 
                variant="outline" 
                className="w-full h-12 border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl"
              >
                <a href="/login?role=doctor">
                  <Lock className="mr-2 h-4 w-4" />
                  PRO LOGIN FOR TIER 2
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Full Tier 1 View (After Reveal) ---------------- */
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-primary">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-2xl border-b border-white/5 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-[#10B981]" />
          <span className="text-[10px] font-black tracking-[0.2em] text-[#10B981] uppercase">Verified Tier 1</span>
        </div>
        <div className="flex items-center gap-2 bg-rose-500/10 text-rose-500 px-4 py-1.5 rounded-full text-[10px] font-black border border-rose-500/20 uppercase tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.1)]">
           <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
           SCAN ALERTED FAMILY
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 sm:p-10 space-y-10">
        
        {/* Identity Header */}
        <div className="space-y-2">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Identity & Status</p>
          <h1 className="text-5xl font-black tracking-tight">{emergencyInfo.userName}</h1>
        </div>

        {/* 2x2 Grid matching Mobile Vault */}
        <div className="grid grid-cols-2 gap-4">
          {/* Blood Group */}
          <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-rose-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Blood Group</span>
            </div>
            <p className="text-3xl font-black leading-none">{emergencyInfo.bloodGroup || 'UNK'}</p>
          </div>

          {/* Allergies - Highlights in Amber if present */}
          <div className={cn(
             "bg-slate-900/50 border rounded-[2rem] p-6 space-y-4",
             emergencyInfo.knownAllergies ? "border-amber-500/30" : "border-white/5"
          )}>
            <div className="flex items-center gap-2">
              <Activity className={cn("h-4 w-4", emergencyInfo.knownAllergies ? "text-amber-500" : "text-slate-500")} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Allergies</span>
            </div>
            <p className="text-lg font-bold leading-tight">
               {emergencyInfo.knownAllergies ? (emergencyInfo.allergiesDetails || 'See records') : 'None'}
            </p>
          </div>

          {/* Emergency Contact */}
          <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#10B981]" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Emergency Contact</span>
            </div>
            <div className="space-y-1">
               <p className="font-bold text-lg leading-tight truncate">{emergencyInfo.emergencyContact1Name}</p>
               <p className="font-medium text-slate-500 text-xs">{emergencyInfo.emergencyContact1Relation}</p>
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-indigo-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conditions</span>
            </div>
            <p className="text-lg font-bold leading-tight line-clamp-2">
               {emergencyInfo.chronicConditions || 'None reported'}
            </p>
          </div>
        </div>

        {/* Detailed Records List */}
        <div className="space-y-4">
           {/* Full Medication List */}
           <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2.5 bg-sky-500/10 rounded-xl">
                    <Stethoscope className="h-5 w-5 text-sky-500" />
                 </div>
                 <h3 className="font-bold text-lg">Current Medications</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                 {emergencyInfo.currentMedications || 'No medications reported by the patient.'}
              </p>
           </div>

           {/* Special Health Tags */}
           <div className="flex flex-wrap gap-3">
              {emergencyInfo.hasPacemakerOrImplant && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  Electronic Implant Present
                </div>
              )}
           </div>
        </div>

        {/* Professional Help Banner */}
        <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-4">
           <div className="text-slate-500 text-xs font-medium max-w-[300px] mx-auto leading-relaxed">
             Authorized medical personnel can scan within the internal Yuktha dashboard for full surgical and clinical history.
           </div>
           <Button variant="link" asChild className="text-[#10B981] font-extrabold hover:no-underline">
             <a href="/login?role=doctor">Professional Dashboard Access &rarr;</a>
           </Button>
        </div>
      </main>

      {/* Persistent Call Button Area matching Mobile Vault */}
      <footer className="p-6 sticky bottom-0 bg-gradient-to-t from-[#020617] to-transparent pt-10">
         <Button 
            asChild
            className="w-full h-20 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[2rem] shadow-[0_15px_40px_rgba(239,68,68,0.25)] flex items-center justify-center gap-4 group active:scale-[0.98] transition-transform"
         >
           <a href={`tel:${emergencyInfo.emergencyContact1Phone || ''}`}>
             <Phone className="h-6 w-6 group-hover:animate-bounce" fill="currentColor" />
             <span className="text-xl font-black">CALL EMERGENCY CONTACT</span>
           </a>
         </Button>
         <div className="h-6" /> {/* Spacer for safety area */}
      </footer>
    </div>
  );
}
