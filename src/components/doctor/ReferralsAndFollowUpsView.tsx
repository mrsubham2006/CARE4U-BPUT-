import React, { useState } from 'react';
import {
  CalendarClock,
  Share2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Building2,
  User,
  Plus
} from 'lucide-react';
import { FollowUp, Referral } from '../../types';

interface ReferralsAndFollowUpsViewProps {
  followUps: FollowUp[];
  referrals?: Referral[];
  mode: 'follow_ups' | 'referrals';
  onViewPatientProfile: (patientId: string) => void;
}

export const ReferralsAndFollowUpsView: React.FC<ReferralsAndFollowUpsViewProps> = ({
  followUps,
  referrals = [],
  mode,
  onViewPatientProfile
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {mode === 'follow_ups' ? 'CLINICAL CONTINUITY' : 'INTER-FACILITY REFERRALS'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white font-display mt-1">
            {mode === 'follow_ups'
              ? 'Patient Follow-Up Reviews'
              : 'Specialist Referrals & Transfers'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === 'follow_ups'
              ? 'Chronological review dates automatically scheduled during consultations.'
              : 'Inter-hospital referrals to district tertiary care and medical colleges.'}
          </p>
        </div>

        <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-800 text-indigo-300 border border-slate-700">
          Total: {mode === 'follow_ups' ? followUps.length : referrals.length}
        </div>
      </div>

      {mode === 'follow_ups' ? (
        <div className="space-y-3">
          {followUps.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-500 text-xs space-y-2">
              <CalendarClock className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-400">No scheduled follow-ups</p>
              <p className="text-[11px] text-slate-600">
                Follow-ups are automatically scheduled when signing e-prescriptions.
              </p>
            </div>
          ) : (
            followUps.map(flw => (
              <div
                key={flw.id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex flex-col items-center justify-center font-mono font-bold shrink-0">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{flw.patientName}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                        {flw.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{flw.purpose}</p>
                    <div className="text-[11px] text-slate-500 font-mono mt-1">
                      Scheduled Date: <strong className="text-indigo-400">{flw.targetDate}</strong> • Doctor: {flw.doctorName}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onViewPatientProfile(flw.patientId)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  View Patient History
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {referrals.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-500 text-xs space-y-2">
              <Share2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-400">No active referrals</p>
              <p className="text-[11px] text-slate-600">
                Specialty patient referrals to tertiary centers will be listed here.
              </p>
            </div>
          ) : (
            referrals.map(ref => (
              <div
                key={ref.id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{ref.patientName}</span>
                  <span className="font-mono text-purple-300">{ref.status}</span>
                </div>
                <p className="text-slate-400">
                  Transfer to: <strong>{ref.toFacilityName}</strong> ({ref.specialtyRequired})
                </p>
                <p className="text-slate-500">{ref.reasonForReferral}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
