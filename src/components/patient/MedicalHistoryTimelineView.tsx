import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Pill,
  FileText,
  Activity,
  Building2,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../services/store';

export const MedicalHistoryTimelineView: React.FC = () => {
  const { appointments, prescriptions, labOrders, referrals, activePatient } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CONSULTATIONS' | 'PRESCRIPTIONS' | 'LABS'>('ALL');

  // Build a unified chronological timeline
  const events: Array<{
    id: string;
    date: string;
    type: 'CONSULTATION' | 'PRESCRIPTION' | 'LAB' | 'REFERRAL' | 'VACCINATION';
    title: string;
    subtitle: string;
    details: string;
    badge: string;
  }> = [];

  appointments
    .filter(a => a.patientId === activePatient.id || a.patientName === activePatient.name)
    .forEach(a => {
      events.push({
        id: a.id,
        date: a.scheduledDate || '2026-09-20',
        type: 'CONSULTATION',
        title: `OPD Consultation with ${a.doctorName}`,
        subtitle: `${a.facilityName} • ${a.department}`,
        details: `Reason: ${a.symptomsSummary}. Status: ${a.status}. Token: ${a.token.tokenNumber}`,
        badge: a.status
      });
    });

  prescriptions
    .filter(p => p.patientId === activePatient.id || p.patientName === activePatient.name)
    .forEach(p => {
      events.push({
        id: p.id,
        date: p.createdAt.split('T')[0],
        type: 'PRESCRIPTION',
        title: `E-Prescription by ${p.doctorName}`,
        subtitle: `${p.facilityName}`,
        details: `Medicines: ${p.items.map(i => i.medicineName).join(', ')}. ${p.notes || ''}`,
        badge: `${p.items.length} Rx Items`
      });
    });

  labOrders
    .filter(l => l.patientId === activePatient.id || l.patientName === activePatient.name)
    .forEach(l => {
      const dateStr = (l.createdAt || l.orderedAt || new Date().toISOString()).split('T')[0];
      events.push({
        id: l.id,
        date: dateStr,
        type: 'LAB',
        title: `Diagnostic: ${l.testName}`,
        subtitle: `${l.facilityName} • Ordered by ${l.orderedByDoctorName}`,
        details: l.aiExtractedInsights || `Status: ${l.status}. Lab samples processed.`,
        badge: l.status
      });
    });

  // Add historical vaccination & surgery from profile
  if (activePatient.previousSurgeries) {
    activePatient.previousSurgeries.forEach((s, idx) => {
      events.push({
        id: `surg-${idx}`,
        date: '2020-08-15',
        type: 'CONSULTATION',
        title: `Surgical Procedure: ${s}`,
        subtitle: 'Sub-District General Hospital',
        details: 'Uncomplicated laparoscopic procedure. Fully recovered.',
        badge: 'SURGERY'
      });
    });
  }

  // Sort descending by date
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredEvents = events.filter(e => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'CONSULTATIONS' && e.type === 'CONSULTATION') return true;
    if (selectedFilter === 'PRESCRIPTIONS' && e.type === 'PRESCRIPTION') return true;
    if (selectedFilter === 'LABS' && e.type === 'LAB') return true;
    return false;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Longitudinal Medical History Timeline</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 text-xs font-bold border border-teal-500/30">
              ABDM Unified Record
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete life-course medical timeline connecting clinical visits, prescriptions, surgical notes, and pathology diagnostics.
          </p>
        </div>

        {/* Filters */}
        <div className="flex rounded-2xl bg-slate-950 border border-slate-800 p-1">
          {(['ALL', 'CONSULTATIONS', 'PRESCRIPTIONS', 'LABS'] as const).map(f => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                selectedFilter === f ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f === 'ALL' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-6">
        {filteredEvents.map(evt => (
          <div key={evt.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-slate-950 border-2 border-teal-400 text-teal-400 flex items-center justify-center shadow-md">
              {evt.type === 'CONSULTATION' && <Stethoscope className="w-3 h-3" />}
              {evt.type === 'PRESCRIPTION' && <Pill className="w-3 h-3" />}
              {evt.type === 'LAB' && <FileText className="w-3 h-3" />}
            </div>

            {/* Event Card */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 transition-all shadow-xl space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-teal-400">{evt.date}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs font-bold text-white">{evt.title}</span>
                </div>
                <span className="self-start sm:self-auto text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                  {evt.badge}
                </span>
              </div>

              <div className="text-xs text-slate-400">{evt.subtitle}</div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-850">
                {evt.details}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
