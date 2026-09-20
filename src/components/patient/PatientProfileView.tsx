import React, { useState } from 'react';
import {
  User,
  Heart,
  ShieldCheck,
  QrCode,
  Save,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../services/store';
import { Patient } from '../../types';
import { BiometricSettingsCard } from './BiometricSettingsCard';

export const PatientProfileView: React.FC = () => {
  const { activePatient, updateActivePatientProfile, triggerConfetti } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: activePatient.name,
    phone: activePatient.phone,
    email: activePatient.email || '',
    dob: activePatient.dob || '1999-05-14',
    age: activePatient.age || 27,
    gender: activePatient.gender || 'Male',
    bloodGroup: activePatient.bloodGroup || 'B+',
    address: activePatient.address || 'House #14, Main Road, Near Gram Panchayat',
    villageOrCity: activePatient.villageOrCity || 'Kadegaon Rural Block (Ward 3)',
    district: activePatient.district || 'Sub-District Central',
    state: activePatient.state || 'Maharashtra',
    pincode: activePatient.pincode || '415304',
    emergencyContact: activePatient.emergencyContact || '+91 98220 11223 (Pooja Kumar - Sister)',
    abhaNumber: activePatient.abhaNumber || '91-4412-8821-9923',
    allergies: activePatient.allergies || ['Sulfa Antibiotics', 'Dust & Tree Pollen'],
    chronicConditions: activePatient.chronicConditions || ['Mild Bronchial Asthma (Triggered by dust)'],
    previousSurgeries: activePatient.previousSurgeries || ['Appendectomy (2020)'],
    currentMedications: activePatient.currentMedications || ['Salbutamol Inhaler 100mcg PRN', 'Cetirizine 10mg'],
    familyMedicalHistory: activePatient.familyMedicalHistory || ['Father: Type 2 Diabetes Mellitus', 'Mother: Hypertension'],
    vaccinationRecords: activePatient.vaccinationRecords || [
      { name: 'COVID-19 Covishield (Dose 1 & 2 + Booster)', date: '2022-04-10', status: 'Completed', verified: true },
      { name: 'Tetanus Toxoid (TT)', date: '2024-01-15', status: 'Completed', verified: true }
    ]
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newSurgery, setNewSurgery] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newFamilyHistory, setNewFamilyHistory] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateActivePatientProfile(formData);
    setIsEditing(false);
    triggerConfetti();
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies?.filter((_, i) => i !== index)
    }));
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        chronicConditions: [...(prev.chronicConditions || []), newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions?.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg border border-teal-400/30">
            {activePatient.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-bold font-display text-white">{activePatient.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                ABHA Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Health ID: <strong className="text-teal-300 font-mono">{activePatient.healthId}</strong> • ABHA: <strong className="text-slate-300 font-mono">{activePatient.abhaNumber || '91-4412-8821-9923'}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
            isEditing
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/30'
          }`}
        >
          {isEditing ? (
            <>Cancel Editing</>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              <span>Edit Health Profile</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal & Demographic Information */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Personal & Contact Information</h2>
              <p className="text-xs text-slate-400">Demographic details linked with Ayushman Bharat Digital Mission</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                  required
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-white text-xs font-semibold">
                  {formData.name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dob || ''}
                  onChange={e => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-white text-xs font-semibold flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  <span>{formData.dob} ({formData.age} yrs)</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gender</label>
              {isEditing ? (
                <select
                  value={formData.gender || 'Male'}
                  onChange={e => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-white text-xs font-semibold">
                  {formData.gender}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Blood Group</label>
              {isEditing ? (
                <select
                  value={formData.bloodGroup || 'B+'}
                  onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-rose-300 text-xs font-bold font-mono">
                  {formData.bloodGroup}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-white text-xs flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-400" />
                  <span>{formData.phone}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-white text-xs flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-teal-400" />
                  <span>{formData.email || 'rahul.kumar@care4u.nexus'}</span>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Emergency Contact Person & Phone</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.emergencyContact || ''}
                  onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                  placeholder="e.g. +91 98220 11223 (Pooja Kumar - Sister)"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-amber-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formData.emergencyContact}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location & Address */}
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Residential Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 text-xs flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>{formData.address}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Village / City / Ward</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.villageOrCity || ''}
                  onChange={e => setFormData({ ...formData, villageOrCity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 text-xs">
                  {formData.villageOrCity}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">District, State & PIN</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.district || ''}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-1/2 px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    placeholder="District"
                  />
                  <input
                    type="text"
                    value={formData.pincode || ''}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-1/2 px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    placeholder="PIN"
                  />
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 text-xs font-mono">
                  {formData.district}, {formData.state} - {formData.pincode}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Clinical & Health Background */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Clinical & Medical Background</h2>
              <p className="text-xs text-slate-400">Allergies, chronic medical conditions, surgeries, and routine medications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergies */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Known Allergies & Drug Reactions
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{formData.allergies?.length || 0} recorded</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.allergies?.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium"
                  >
                    <span>{item}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeAllergy(idx)}
                        className="hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={e => setNewAllergy(e.target.value)}
                    placeholder="Add allergy (e.g. Penicillin, Peanuts)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Chronic Conditions */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  Chronic Medical Conditions
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{formData.chronicConditions?.length || 0} recorded</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.chronicConditions?.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-medium"
                  >
                    <span>{item}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeCondition(idx)}
                        className="hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={e => setNewCondition(e.target.value)}
                    placeholder="Add chronic condition"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={addCondition}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Surgeries & Medical History */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-200">Previous Surgeries & Hospitalizations</div>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {formData.previousSurgeries?.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Family Medical History */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-200">Family Medical History</div>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {formData.familyMedicalHistory?.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: Digital Health ABHA Card & Verification */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Digital Health Identity & ABHA Linkage</h2>
              <p className="text-xs text-slate-400">National Health Authority Ayushman Bharat Digital Mission (ABDM) Integration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* ABHA Pass Mock Card */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-r from-teal-900/60 via-slate-900 to-indigo-950/80 border border-teal-500/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-300 font-bold">
                    🏛️
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider">Ayushman Bharat Digital Health Card</div>
                    <div className="text-[10px] text-teal-300">Ministry of Health & Family Welfare, Govt. of India</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Citizen Name</div>
                  <div className="text-sm font-bold text-white">{activePatient.name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">ABHA Number</div>
                  <div className="text-sm font-bold font-mono text-teal-300">{activePatient.abhaNumber || '91-4412-8821-9923'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">ABHA Address</div>
                  <div className="text-xs font-mono text-slate-200 truncate">{activePatient.healthId.toLowerCase()}@abdm</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">DOB / Gender</div>
                  <div className="text-xs text-white">{formData.dob} • {formData.gender}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Blood Group</div>
                  <div className="text-xs font-bold text-rose-300 font-mono">{formData.bloodGroup}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Linked Phone</div>
                  <div className="text-xs font-mono text-white">{formData.phone}</div>
                </div>
              </div>
            </div>

            {/* Quick QR Pass */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
              <div className="w-28 h-28 bg-white p-2 rounded-xl mx-auto shadow-inner flex items-center justify-center">
                <QrCode className="w-24 h-24 text-slate-900" />
              </div>
              <div className="text-[11px] text-slate-300 font-semibold">
                Instant OPD Desk Scanner Token
              </div>
              <div className="text-[10px] text-slate-400">
                Scan at hospital registration kiosk for 0-minute manual paperwork.
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Biometric Security & Medical Record Privacy */}
        <BiometricSettingsCard />

        {/* Save Bar when Editing */}
        {isEditing && (
          <div className="sticky bottom-6 z-30 p-4 rounded-2xl bg-slate-900/95 border border-teal-500/40 backdrop-blur-md shadow-2xl flex items-center justify-between gap-4">
            <div className="text-xs text-slate-300">
              You have unsaved changes in your health profile.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Discard
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-900/30"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
