import React from 'react';
import {
  Bell,
  UserCheck,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Award,
  Stethoscope,
  Clock
} from 'lucide-react';
import { NotificationItem, User as UserType } from '../../types';

interface DoctorNotificationsAndProfileViewProps {
  mode: 'notifications' | 'profile' | 'settings';
  currentUser: UserType | null;
  notifications?: NotificationItem[];
}

export const DoctorNotificationsAndProfileView: React.FC<DoctorNotificationsAndProfileViewProps> = ({
  mode,
  currentUser,
  notifications = []
}) => {
  if (mode === 'notifications') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-400" />
              <span>Doctor Clinical Notifications</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live updates on patient token check-ins, diagnostic lab reports, and urgent alerts.
            </p>
          </div>
          <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-800 text-rose-300 border border-slate-700">
            Total: {notifications.length}
          </div>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-500 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-400">All caught up</p>
              <p className="text-[11px] text-slate-600">No unread notifications at this time.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{notif.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                      {notif.type}
                    </span>
                  </div>
                  <p className="text-slate-400">{notif.message}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(notif.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Profile or Settings view
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-400" />
            <span>Physician Profile & Clinical Credentials</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified National Health Authority (NHA) & Medical Council Credentials.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>VERIFIED PRACTITIONER</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clinician Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-teal-500/20 border-2 border-teal-500/40 text-teal-300 flex items-center justify-center font-bold text-2xl font-display">
              🩺
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                {currentUser?.name || 'Dr. Rajesh Sharma'}
              </h3>
              <p className="text-xs text-teal-400 font-mono">
                {currentUser?.qualification || 'MBBS, MD (General Medicine)'}
              </p>
              <p className="text-xs text-slate-400">
                Department: {currentUser?.department || 'Internal & General Medicine'}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Medical Registration Number:</span>
              <span className="font-mono text-teal-300 font-bold">
                {currentUser?.medicalRegistrationNumber || 'MCI-MH-2018-84291'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Primary Facility:</span>
              <span className="font-bold text-white">
                {currentUser?.hospitalName || 'Community Health Centre - Central'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Clinical Experience:</span>
              <span>12+ Years Clinical Practice</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">OPD Timings:</span>
              <span className="font-mono text-slate-200">09:00 AM - 04:00 PM (Mon - Sat)</span>
            </div>
          </div>
        </div>

        {/* Digital Signature Badge */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold font-mono uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Digital e-Signature Preview</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              This signature stamp is automatically embedded on all official PDF e-prescriptions.
            </p>

            <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-teal-500/40 space-y-2 text-center">
              <div className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                ✓ CERTIFIED MEDICAL PRACTITIONER
              </div>
              <div className="text-base font-bold text-white font-display">
                {currentUser?.name || 'Dr. Rajesh Sharma, MD'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Reg: {currentUser?.medicalRegistrationNumber || 'MCI-MH-2018-84291'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                National Health Authority (ABDM) Compliant
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono text-center">
            Secured via Firebase Authentication & Cloud Firestore Rules
          </div>
        </div>
      </div>
    </div>
  );
};
