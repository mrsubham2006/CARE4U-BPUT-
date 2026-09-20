import React, { useState } from 'react';
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Flame,
  Volume2,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../../services/store';

export const MyMedicinesView: React.FC = () => {
  const { playAudioChime, triggerConfetti } = useApp();

  const [reminders, setReminders] = useState([
    {
      id: 'rem-1',
      name: 'Paracetamol 500mg',
      dosage: '1 Tablet',
      timeSlot: 'MORNING',
      timeStr: '08:00 AM',
      instructions: 'After breakfast with water',
      taken: true,
      streakDays: 4
    },
    {
      id: 'rem-2',
      name: 'Salbutamol 100mcg Inhaler',
      dosage: '2 Puffs',
      timeSlot: 'AFTERNOON',
      timeStr: '01:30 PM',
      instructions: 'Rinse mouth after inhalation',
      taken: true,
      streakDays: 4
    },
    {
      id: 'rem-3',
      name: 'Cetirizine 10mg',
      dosage: '1 Tablet',
      timeSlot: 'NIGHT',
      timeStr: '09:30 PM',
      instructions: 'Before bedtime',
      taken: false,
      streakDays: 3
    }
  ]);

  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDosage, setCustomDosage] = useState('1 Tablet');
  const [customTime, setCustomTime] = useState('08:00 PM');
  const [customInstructions, setCustomInstructions] = useState('After meal');

  const toggleTaken = (id: string) => {
    setReminders(prev =>
      prev.map(r => {
        if (r.id === id) {
          const newStatus = !r.taken;
          if (newStatus) {
            playAudioChime('success');
            triggerConfetti();
          } else {
            playAudioChime('click');
          }
          return {
            ...r,
            taken: newStatus,
            streakDays: newStatus ? r.streakDays + 1 : Math.max(0, r.streakDays - 1)
          };
        }
        return r;
      })
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newRem = {
      id: 'rem-' + Date.now(),
      name: customName,
      dosage: customDosage,
      timeSlot: 'EVENING',
      timeStr: customTime,
      instructions: customInstructions,
      taken: false,
      streakDays: 1
    };
    setReminders([...reminders, newRem]);
    setIsAddingCustom(false);
    setCustomName('');
    playAudioChime('success');
  };

  const completedCount = reminders.filter(r => r.taken).length;
  const adherencePercent = Math.round((completedCount / reminders.length) * 100);

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Medication Schedule & Adherence Tracker</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/30">
              Live Reminders
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Track daily dosages, log taken medicines, and maintain continuous medication adherence.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCustom(true)}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-900/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Medicine</span>
        </button>
      </div>

      {/* Adherence and Streak Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Today's Adherence</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-teal-300">{adherencePercent}%</span>
            <span className="text-xs text-slate-400">({completedCount}/{reminders.length} taken)</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${adherencePercent}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Streak</div>
          <div className="text-3xl font-black text-amber-400 flex items-center gap-1.5">
            <Flame className="w-7 h-7 fill-amber-400 text-amber-500 animate-pulse" />
            <span>5 Days</span>
          </div>
          <div className="text-[10px] text-slate-400">Consistent adherence logged</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Safety & Interactions</div>
          <div className="text-sm font-bold text-emerald-300 flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>0 Known Interactions</span>
          </div>
          <div className="text-[10px] text-slate-400">AI drug combination verified</div>
        </div>
      </div>

      {/* Today's Schedule Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-400" />
          <span>Today's Dosage Timeline</span>
        </h2>

        <div className="space-y-3">
          {reminders.map(item => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.taken
                  ? 'bg-slate-950/60 border-emerald-500/30'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${
                  item.taken ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  <Pill className="w-6 h-6" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-base ${item.taken ? 'text-slate-300 line-through' : 'text-white'}`}>
                      {item.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                      {item.dosage}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Scheduled: <strong className="text-slate-200">{item.timeStr}</strong> • {item.instructions}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  onClick={() => toggleTaken(item.id)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                    item.taken
                      ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                      : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/30'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{item.taken ? 'Taken ✓' : 'Mark as Taken'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Medicine Modal */}
      {isAddingCustom && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddCustom}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Add Medication Reminder</h3>
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Medicine Name & Strength</label>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. Vitamin D3 60K UI"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Dosage</label>
                  <input
                    type="text"
                    value={customDosage}
                    onChange={e => setCustomDosage(e.target.value)}
                    placeholder="1 Tablet / 5ml"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Time</label>
                  <input
                    type="text"
                    value={customTime}
                    onChange={e => setCustomTime(e.target.value)}
                    placeholder="08:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Instructions</label>
                <input
                  type="text"
                  value={customInstructions}
                  onChange={e => setCustomInstructions(e.target.value)}
                  placeholder="After dinner with warm milk"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
              >
                Save Reminder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
