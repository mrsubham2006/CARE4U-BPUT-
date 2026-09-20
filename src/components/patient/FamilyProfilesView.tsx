import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Heart,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ArrowRight,
  User,
  Plus
} from 'lucide-react';
import { useApp } from '../../services/store';

export const FamilyProfilesView: React.FC = () => {
  const { activePatient, playAudioChime, triggerConfetti } = useApp();

  const [familyMembers, setFamilyMembers] = useState([
    {
      id: 'fam-1',
      name: 'Rahul Kumar (Self)',
      relationship: 'Self',
      age: 27,
      gender: 'Male',
      bloodGroup: 'B+',
      healthId: 'rahul.kumar@abdm',
      isPrimary: true
    },
    {
      id: 'fam-2',
      name: 'Sunita Kumar',
      relationship: 'Mother',
      age: 54,
      gender: 'Female',
      bloodGroup: 'O+',
      healthId: 'sunita.k@abdm',
      isPrimary: false
    },
    {
      id: 'fam-3',
      name: 'Ramesh Kumar',
      relationship: 'Father',
      age: 58,
      gender: 'Male',
      bloodGroup: 'B+',
      healthId: 'ramesh.k@abdm',
      isPrimary: false
    }
  ]);

  const [selectedMemberId, setSelectedMemberId] = useState('fam-1');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRel, setNewRel] = useState('Spouse');
  const [newAge, setNewAge] = useState('26');
  const [newGender, setNewGender] = useState('Female');
  const [newBlood, setNewBlood] = useState('A+');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newMember = {
      id: 'fam-' + Date.now(),
      name: newName,
      relationship: newRel,
      age: Number(newAge) || 25,
      gender: newGender,
      bloodGroup: newBlood,
      healthId: `${newName.toLowerCase().replace(/\s+/g, '')}@abdm`,
      isPrimary: false
    };
    setFamilyMembers([...familyMembers, newMember]);
    setIsAdding(false);
    setNewName('');
    playAudioChime('success');
    triggerConfetti();
  };

  const handleSwitchProfile = (id: string, name: string) => {
    setSelectedMemberId(id);
    playAudioChime('click');
    alert(`Switched active health view to: ${name}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Family Health Profiles & Dependents</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 text-xs font-bold border border-teal-500/30">
              Family ABHA Grouping
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage consultations, medication schedules, and vaccination records for your family members and elderly parents.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-900/30 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Family Dependent</span>
        </button>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {familyMembers.map(mem => (
          <div
            key={mem.id}
            className={`p-6 rounded-3xl border transition-all space-y-4 flex flex-col justify-between ${
              selectedMemberId === mem.id
                ? 'bg-slate-900 border-teal-500 shadow-xl shadow-teal-950/40'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-lg border border-teal-500/30">
                  {mem.name.charAt(0)}
                </div>
                {selectedMemberId === mem.id && (
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold">
                    Active Profile
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-white text-base">{mem.name}</h3>
                <div className="text-xs text-teal-400 font-semibold">{mem.relationship}</div>
                <div className="text-[11px] text-slate-400 mt-1">{mem.age} Yrs • {mem.gender} • Blood: {mem.bloodGroup}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 text-xs font-mono text-slate-300">
                ABHA: {mem.healthId}
              </div>
            </div>

            <button
              onClick={() => handleSwitchProfile(mem.id, mem.name)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                selectedMemberId === mem.id
                  ? 'bg-slate-800 text-teal-300 cursor-default'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-md'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{selectedMemberId === mem.id ? 'Viewing Records' : 'Switch to Profile'}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddMember}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Add Family Member / Dependent</h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Priya Kumar"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Relationship</label>
                  <select
                    value={newRel}
                    onChange={e => setNewRel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other Dependent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={e => setNewAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={e => setNewGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Blood Group</label>
                  <select
                    value={newBlood}
                    onChange={e => setNewBlood(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
              >
                Create Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
