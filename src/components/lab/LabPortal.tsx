import React, { useState, useEffect } from 'react';
import { useApp } from '../../services/store';
import { voiceCommandService } from '../../services/voiceCommandService';
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  Activity,
  Microscope,
  Send
} from 'lucide-react';

export const LabPortal: React.FC = () => {
  const {
    labOrders,
    updateLabOrderStatus,
    playAudioChime,
    triggerConfetti
  } = useApp();

  const [selectedOrderId, setSelectedOrderId] = useState<string>(labOrders[0]?.id || '');
  const selectedOrder = labOrders.find(o => o.id === selectedOrderId) || labOrders[0];

  const handleProgressStatus = (orderId: string, nextStatus: any) => {
    playAudioChime('click');
    updateLabOrderStatus(orderId, nextStatus);
    if (nextStatus === 'REPORT_READY') {
      triggerConfetti();
    }
  };

  useEffect(() => {
    const unsub = voiceCommandService.subscribe(action => {
      if (action.type === 'ADVANCE_LAB_ORDER') {
        const targetOrder = labOrders.find(o => o.status !== 'REPORT_READY') || selectedOrder;
        if (targetOrder) {
          const next =
            targetOrder.status === 'ORDERED'
              ? 'SAMPLE_COLLECTED'
              : targetOrder.status === 'SAMPLE_COLLECTED'
              ? 'PROCESSING'
              : 'REPORT_READY';
          handleProgressStatus(targetOrder.id, next);
        }
      }
    });
    return () => unsub();
  }, [labOrders, selectedOrder]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Lab Header Bar */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/40 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-xl">
            🔬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/40">
                PATHOLOGY & DIAGNOSTICS LAB
              </span>
              <span className="text-xs text-slate-400">District Health Centre (DHC)</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-white mt-1">
              Automated Clinical Laboratory Node
            </h1>
            <p className="text-xs text-slate-300">
              Sample Tracking, Quality Control & AI Test Extraction Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
          <FlaskConical className="w-4 h-4" />
          <span>{labOrders.length} Active Test Orders</span>
        </div>
      </div>

      {/* Main Lab Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Test Orders Queue */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center justify-between pb-2 border-b border-slate-800">
              <span>Diagnostic Orders Queue</span>
              <span className="text-purple-400">{labOrders.length} Orders</span>
            </h3>

            <div className="space-y-2.5">
              {labOrders.map(order => {
                const isSelected = order.id === selectedOrderId;
                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      playAudioChime('click');
                      setSelectedOrderId(order.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/50 border-purple-500/60 ring-1 ring-purple-500/30 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white truncate">{order.testName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'REPORT_READY'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">Patient: <strong className="text-slate-200">{order.patientName}</strong></div>
                    <div className="text-[11px] text-slate-400 mt-1">Ordered by {order.orderedByDoctorName}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center & Right: Sample Processing & AI Report Extraction */}
        <div className="lg:col-span-2 space-y-6">
          {selectedOrder ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono font-bold text-purple-400">Order ID: {selectedOrder.id}</span>
                  <h2 className="text-xl font-bold text-white mt-0.5">{selectedOrder.testName}</h2>
                  <p className="text-xs text-slate-400">
                    Patient: <strong className="text-slate-200">{selectedOrder.patientName}</strong> • Ordered by {selectedOrder.orderedByDoctorName}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                    selectedOrder.status === 'REPORT_READY'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              {/* Lab Workflow Stepper */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Laboratory Progression Workflow
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ORDERED', label: '1. Order Received' },
                    { id: 'SAMPLE_COLLECTED', label: '2. Sample Collected' },
                    { id: 'PROCESSING', label: '3. Processing / Analysis' },
                    { id: 'REPORT_READY', label: '4. Report Ready & Notified' }
                  ].map((step, idx) => {
                    const isDone =
                      (step.id === 'ORDERED' && ['ORDERED', 'SAMPLE_COLLECTED', 'PROCESSING', 'REPORT_READY'].includes(selectedOrder.status)) ||
                      (step.id === 'SAMPLE_COLLECTED' && ['SAMPLE_COLLECTED', 'PROCESSING', 'REPORT_READY'].includes(selectedOrder.status)) ||
                      (step.id === 'PROCESSING' && ['PROCESSING', 'REPORT_READY'].includes(selectedOrder.status)) ||
                      (step.id === 'REPORT_READY' && selectedOrder.status === 'REPORT_READY');

                    return (
                      <button
                        key={step.id}
                        onClick={() => handleProgressStatus(selectedOrder.id, step.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                          isDone
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        {step.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Report Simulation & AI Parameter Preview */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span>Analyzed Laboratory Values</span>
                  </span>
                  <button
                    onClick={() => handleProgressStatus(selectedOrder.id, 'REPORT_READY')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 text-white flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Simulate Report Upload & Notify</span>
                  </button>
                </div>

                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400 font-mono text-[10px] pb-1 border-b border-slate-800">
                    <span>TEST PARAMETER</span>
                    <span>OBSERVED VALUE (REFERENCE)</span>
                  </div>

                  {(selectedOrder.reportValues || [
                    { parameter: 'Hemoglobin (Hb)', value: '13.8', unit: 'g/dL', referenceRange: '13.0 - 17.0', flag: 'Normal' },
                    { parameter: 'Total Leukocyte Count (WBC)', value: '11,200', unit: '/µL', referenceRange: '4,000 - 11,000', flag: 'High' },
                    { parameter: 'Platelet Count', value: '245,000', unit: '/µL', referenceRange: '150,000 - 450,000', flag: 'Normal' },
                    { parameter: 'Erythrocyte Sedimentation Rate (ESR)', value: '24', unit: 'mm/hr', referenceRange: '0 - 15', flag: 'High' },
                    { parameter: 'Malaria Smear / Dengue NS1', value: 'Negative', unit: 'Ag', referenceRange: 'Negative', flag: 'Normal' }
                  ]).map((val, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
                      <span className="text-slate-300 font-medium">{val.parameter}</span>
                      <span className="font-mono">
                        <strong className={val.flag === 'High' ? 'text-amber-400 font-bold' : 'text-emerald-300'}>
                          {val.value} {val.unit}
                        </strong>{' '}
                        <span className="text-[10px] text-slate-500">({val.referenceRange})</span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* HealthAI Structured Extraction Banner */}
                <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/40 text-xs text-teal-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-teal-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>HealthAI Clinical Document Intelligence:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {selectedOrder.aiExtractedInsights ||
                      'Mild elevation in total leukocyte count and ESR consistent with acute inflammatory response or viral/early bacterial pyrexia. Platelets normal. Informational summary only; consult doctor for diagnosis.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">Select an order from the queue to process.</div>
          )}
        </div>
      </div>
    </div>
  );
};
