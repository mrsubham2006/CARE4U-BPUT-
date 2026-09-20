import React, { useState } from 'react';
import {
  Activity,
  Heart,
  TrendingUp,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../services/store';

export const HealthAnalyticsView: React.FC = () => {
  const { activePatient, playAudioChime, triggerConfetti } = useApp();

  const [vitalsHistory, setVitalsHistory] = useState([
    { date: 'Sep 14', bpSys: 120, bpDia: 80, pulse: 72, spo2: 99, weight: 68 },
    { date: 'Sep 16', bpSys: 122, bpDia: 82, pulse: 75, spo2: 98, weight: 68 },
    { date: 'Sep 18', bpSys: 125, bpDia: 84, pulse: 78, spo2: 97, weight: 68.2 },
    { date: 'Sep 20', bpSys: 118, bpDia: 78, pulse: 74, spo2: 99, weight: 68 }
  ]);

  const [isLogging, setIsLogging] = useState(false);
  const [newBpSys, setNewBpSys] = useState('120');
  const [newBpDia, setNewBpDia] = useState('80');
  const [newPulse, setNewPulse] = useState('74');
  const [newSpo2, setNewSpo2] = useState('99');
  const [newWeight, setNewWeight] = useState('68');

  const handleLogVital = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      date: 'Today',
      bpSys: Number(newBpSys) || 120,
      bpDia: Number(newBpDia) || 80,
      pulse: Number(newPulse) || 74,
      spo2: Number(newSpo2) || 99,
      weight: Number(newWeight) || 68
    };
    setVitalsHistory([...vitalsHistory, newEntry]);
    setIsLogging(false);
    playAudioChime('success');
    triggerConfetti();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Health Vitals & Longitudinal Biometrics</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 text-xs font-bold border border-teal-500/30">
              Continuous Monitoring
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Track blood pressure, heart rate, blood oxygen saturation, and body metrics with automated anomaly alerts.
          </p>
        </div>

        <button
          onClick={() => setIsLogging(true)}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-900/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Vitals</span>
        </button>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blood Pressure */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Blood Pressure</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">118/78 <span className="text-xs font-sans text-slate-400">mmHg</span></div>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
            Optimal (Normal)
          </span>
        </div>

        {/* Pulse / Heart Rate */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Heart Rate</span>
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-300">74 <span className="text-xs font-sans text-slate-400">BPM</span></div>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
            Resting Normal
          </span>
        </div>

        {/* SpO2 */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Oxygen (SpO2)</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300">99% <span className="text-xs font-sans text-slate-400">Saturation</span></div>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
            Healthy Airway
          </span>
        </div>

        {/* Weight & BMI */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Body Mass / BMI</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">68.0 <span className="text-xs font-sans text-slate-400">kg (22.4 BMI)</span></div>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
            Normal Weight
          </span>
        </div>
      </div>

      {/* Historical Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-400" />
          <span>Recent Biometric Log Entries</span>
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Blood Pressure (Sys/Dia)</th>
                <th className="p-3">Heart Rate (BPM)</th>
                <th className="p-3">SpO2 Oxygen</th>
                <th className="p-3">Weight (Kg)</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-mono">
              {vitalsHistory.map((v, idx) => (
                <tr key={idx} className="hover:bg-slate-950/50">
                  <td className="p-3 font-sans font-semibold text-white">{v.date}</td>
                  <td className="p-3 text-teal-300">{v.bpSys}/{v.bpDia} mmHg</td>
                  <td className="p-3 text-rose-300">{v.pulse}</td>
                  <td className="p-3 text-cyan-300">{v.spo2}%</td>
                  <td className="p-3 text-slate-300">{v.weight} kg</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 font-sans font-bold">
                      Normal
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      {isLogging && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleLogVital}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Record New Health Vitals</h3>
              <button
                type="button"
                onClick={() => setIsLogging(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  value={newBpSys}
                  onChange={e => setNewBpSys(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  value={newBpDia}
                  onChange={e => setNewBpDia(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Pulse (BPM)</label>
                <input
                  type="number"
                  value={newPulse}
                  onChange={e => setNewPulse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">SpO2 Oxygen (%)</label>
                <input
                  type="number"
                  value={newSpo2}
                  onChange={e => setNewSpo2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLogging(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
              >
                Save Reading
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
