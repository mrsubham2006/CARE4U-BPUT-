import React, { useState } from 'react';
import {
  FlaskConical,
  FileCheck2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Search,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { LabOrder, User as UserType } from '../../types';
import { reviewLabReport } from './doctorService';

interface LabWorkflowViewProps {
  labOrders: LabOrder[];
  labReports: any[];
  currentUser: UserType | null;
  onViewPatientProfile: (patientId: string) => void;
  playAudioChime?: (sound?: 'alert' | 'click' | 'success') => void;
}

export const LabWorkflowView: React.FC<LabWorkflowViewProps> = ({
  labOrders,
  labReports,
  currentUser,
  onViewPatientProfile,
  playAudioChime
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'reports'>('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const handleReviewSubmit = async (reportId: string) => {
    try {
      setReviewingId(reportId);
      const note = reviewNotes[reportId] || 'Report reviewed. Findings clinically correlated.';
      await reviewLabReport(
        reportId,
        note,
        currentUser?.name || 'Dr. Rajesh Sharma, MD'
      );
      if (playAudioChime) playAudioChime('success');
    } catch (err) {
      console.error('Failed to review lab report:', err);
    } finally {
      setReviewingId(null);
    }
  };

  // Combine reports from labOrders with REPORT_READY and standalone labReports
  const combinedReports = [
    ...labReports,
    ...labOrders
      .filter(o => o.status === 'REPORT_READY' && !labReports.some(r => r.id === o.id))
      .map(o => ({
        id: o.id,
        testName: o.testName,
        patientName: o.patientName,
        patientId: o.patientId,
        status: o.status,
        completedAt: o.completedAt || o.orderedAt,
        reportSummary:
          o.reportSummary ||
          'Platelet count: 185,000 /mcL (Normal). Hematocrit: 41% (Stable). Dengue NS1: Non-reactive.',
        reportValues: o.reportValues || [
          { parameter: 'Platelet Count', value: '185,000', unit: '/mcL', referenceRange: '150,000 - 450,000', flag: 'Normal' },
          { parameter: 'Hematocrit (PCV)', value: '41.2', unit: '%', referenceRange: '36 - 46', flag: 'Normal' },
          { parameter: 'Total WBC Count', value: '6,400', unit: '/mcL', referenceRange: '4,000 - 11,000', flag: 'Normal' }
        ]
      }))
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Tab Switcher */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-purple-400" />
              <span>Diagnostic Pathology & Laboratory Center</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review returned lab test reports, track active blood draws, and sign off clinical evaluations.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Lab Reports ({combinedReports.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Active Orders ({labOrders.length})</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by patient, test name, or order ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'reports' ? (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono">
            Available Diagnostic Reports for Doctor Review
          </h3>

          {combinedReports.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-500 text-xs space-y-2">
              <FileCheck2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-400">No pending reports</p>
              <p className="text-[11px] text-slate-600">
                Reports uploaded by the diagnostic laboratory staff will appear here instantly.
              </p>
            </div>
          ) : (
            combinedReports.map(rep => {
              const isReviewed = rep.status === 'REVIEWED';
              return (
                <div
                  key={rep.id}
                  className={`p-5 rounded-3xl bg-slate-900/90 border transition space-y-4 ${
                    isReviewed ? 'border-emerald-500/30' : 'border-purple-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-purple-400">
                          {rep.testName || 'Diagnostic Panel'}
                        </span>
                        <h4 className="text-sm font-bold text-white">{rep.patientName}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                            isReviewed
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          }`}
                        >
                          {isReviewed ? '✓ REVIEWED BY DOCTOR' : 'REPORT READY'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Order Ref: {rep.id} • Completed: {new Date(rep.completedAt || Date.now()).toLocaleDateString('en-IN')}
                      </p>
                    </div>

                    <button
                      onClick={() => onViewPatientProfile(rep.patientId)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Patient Profile
                    </button>
                  </div>

                  {/* Diagnostic Test Values Table */}
                  {rep.reportValues && rep.reportValues.length > 0 && (
                    <div className="rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden text-xs">
                      <div className="grid grid-cols-4 bg-slate-900/80 p-2.5 font-bold text-slate-400 text-[10px] font-mono uppercase">
                        <div>Parameter</div>
                        <div>Result Value</div>
                        <div>Normal Range</div>
                        <div className="text-right">Interpretation</div>
                      </div>
                      <div className="divide-y divide-slate-800/60">
                        {rep.reportValues.map((param: any, idx: number) => (
                          <div key={idx} className="grid grid-cols-4 p-2.5 items-center">
                            <div className="font-medium text-white">{param.parameter}</div>
                            <div className="font-mono text-teal-300 font-bold">
                              {param.value} {param.unit}
                            </div>
                            <div className="font-mono text-slate-400">{param.referenceRange}</div>
                            <div className="text-right">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                                  param.flag === 'High'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : param.flag === 'Low'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}
                              >
                                {param.flag || 'Normal'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctor Review Note Action */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Add doctor review notes (e.g. Platelets adequate, continue ORS)..."
                        value={reviewNotes[rep.id] || rep.doctorReviewNotes || ''}
                        onChange={e =>
                          setReviewNotes({ ...reviewNotes, [rep.id]: e.target.value })
                        }
                        disabled={isReviewed}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400 disabled:opacity-60"
                      />
                    </div>

                    {!isReviewed && (
                      <button
                        disabled={reviewingId === rep.id}
                        onClick={() => handleReviewSubmit(rep.id)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Sign & Mark Reviewed</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Active Laboratory Test Orders Dispatched
          </h3>

          {labOrders.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-500 text-xs">
              No active diagnostic lab orders placed.
            </div>
          ) : (
            labOrders.map(order => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{order.testName}</h4>
                    <span className="text-slate-400">• Patient: {order.patientName}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px] font-bold">
                      {order.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    Order ID: {order.id} • Ordered: {new Date(order.orderedAt || Date.now()).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold border border-slate-700">
                    {order.status}
                  </span>
                  <button
                    onClick={() => onViewPatientProfile(order.patientId)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    View Patient
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
