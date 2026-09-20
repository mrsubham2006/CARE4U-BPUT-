import React, { useState } from 'react';
import {
  Search,
  Filter,
  Building2,
  UserCheck,
  Stethoscope,
  MapPin,
  Clock,
  Star,
  Video,
  Phone,
  Calendar,
  CheckCircle2,
  Navigation,
  Pill,
  FileText,
  Activity
} from 'lucide-react';
import { useApp } from '../../services/store';
import { Facility, Doctor } from '../../types';

interface FindHealthcareViewProps {
  onBookDoctor: (doctor: Doctor) => void;
  onNavigateFacility: (facilityId: string) => void;
}

export const FindHealthcareView: React.FC<FindHealthcareViewProps> = ({
  onBookDoctor,
  onNavigateFacility
}) => {
  const { facilities, doctors } = useApp();

  const [activeType, setActiveType] = useState<'ALL' | 'DOCTORS' | 'HOSPITALS' | 'LABS' | 'PHARMACIES'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [filterMode, setFilterMode] = useState<'ALL' | 'IN_PERSON' | 'VIDEO'>('ALL');

  const specialties = ['ALL', 'General Medicine', 'Pulmonology', 'Pediatrics', 'Cardiology', 'Obstetrics & Gynecology', 'Orthopedics', 'Emergency Medicine'];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.facilityName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'ALL' || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const filteredFacilities = facilities.filter(fac => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = fac.name.toLowerCase().includes(search) ||
      (fac.address && fac.address.toLowerCase().includes(search)) ||
      (fac.location && fac.location.toLowerCase().includes(search)) ||
      fac.type.toLowerCase().includes(search);
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Find Healthcare Facilities & Specialists</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore verified district government hospitals, primary health centers, specialty doctors, and diagnostic labs.
            </p>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search doctors, hospitals, specialties (e.g. Dr. Ananya, Pulmonology, DHC)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
            >
              {specialties.map(s => (
                <option key={s} value={s} className="bg-slate-900">{s === 'ALL' ? 'All Specialties' : s}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex rounded-2xl bg-slate-950 border border-slate-800 p-1">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`flex-1 py-1 text-center rounded-xl text-xs font-semibold ${filterMode === 'ALL' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('IN_PERSON')}
              className={`flex-1 py-1 text-center rounded-xl text-xs font-semibold ${filterMode === 'IN_PERSON' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
            >
              OPD
            </button>
            <button
              onClick={() => setFilterMode('VIDEO')}
              className={`flex-1 py-1 text-center rounded-xl text-xs font-semibold ${filterMode === 'VIDEO' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
            >
              Video
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          {(['ALL', 'DOCTORS', 'HOSPITALS', 'LABS', 'PHARMACIES'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveType(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeType === tab
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-850'
              }`}
            >
              {tab === 'ALL' ? 'All Results' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {(activeType === 'ALL' || activeType === 'DOCTORS') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              <span>Available Clinicians & Specialists ({filteredDoctors.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map(doc => (
              <div key={doc.id} className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/30 transition-all shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-lg">
                        {doc.name.replace('Dr. ', '').charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm leading-tight">{doc.name}</h3>
                        <div className="text-xs text-teal-400 font-semibold">{doc.specialty}</div>
                        <div className="text-[10px] text-slate-400">{doc.qualifications || doc.department} • {doc.experienceYears ?? 8} yrs exp</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${doc.isAvailable ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300'}`}>
                      {doc.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Building2 className="w-3.5 h-3.5 text-teal-400" />
                        {doc.facilityName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Consultation Fee:</span>
                      <span className="font-bold font-mono text-emerald-400">
                        {doc.consultationFee === 0 || !doc.consultationFee ? 'Free (Govt / PM-JAY)' : `₹${doc.consultationFee}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Languages:</span>
                      <span className="text-slate-300 font-medium">{doc.languages?.join(', ') || 'English, Hindi, Marathi'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onBookDoctor(doc)}
                    className="py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-900/30"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book OPD</span>
                  </button>
                  <button
                    onClick={() => onBookDoctor(doc)}
                    className="py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5 text-purple-400" />
                    <span>Video Call</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facilities Grid */}
      {(activeType === 'ALL' || activeType === 'HOSPITALS' || activeType === 'LABS' || activeType === 'PHARMACIES') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Healthcare Network Facilities ({filteredFacilities.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFacilities.map(fac => (
              <div key={fac.id} className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/30 transition-all shadow-xl space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase">
                      {fac.type}
                    </span>
                    <h3 className="font-bold text-white text-base mt-1">{fac.name}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{fac.address || fac.location || fac.type} • {fac.distanceKm} km away</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-teal-300">~{fac.estimatedWaitMins || fac.avgWaitTimeMinutes || 15}m wait</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{fac.doctorsCount} active clinicians</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                    <div className="text-[10px] text-slate-400">Emergency Beds</div>
                    <div className="font-bold text-white mt-0.5">{fac.emergencyBedsAvailable ?? (fac.emergencyCapability ? 'Available' : 'N/A')}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                    <div className="text-[10px] text-slate-400">ICU Status</div>
                    <div className="font-bold text-teal-300 mt-0.5">{fac.openStatus === 'OPEN_24_7' ? '24/7 Ready' : 'OPD Hours'}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                    <div className="text-[10px] text-slate-400">Diagnostics Lab</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{fac.diagnostics?.cbc ? 'Active Lab' : 'Standard'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex flex-wrap gap-1">
                    {(fac.departments || []).slice(0, 3).map((sp: string) => (
                      <span key={sp} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {sp}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => onNavigateFacility(fac.id)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>View Load & Slots</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
