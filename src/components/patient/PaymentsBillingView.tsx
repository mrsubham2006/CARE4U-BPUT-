import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Download,
  Receipt,
  Building2,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useApp } from '../../services/store';

export const PaymentsBillingView: React.FC = () => {
  const { payments, createRazorpayOrder, verifyRazorpayPayment, playAudioChime, triggerConfetti } = useApp();

  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');

  const handleSimulatePayment = async () => {
    setIsSimulatingPayment(true);
    playAudioChime('click');
    try {
      const order = await createRazorpayOrder('apt-custom-' + Date.now(), 200);
      await verifyRazorpayPayment(order.orderId, 'pay_rzp_mock_' + Date.now(), selectedMethod);
      setIsSimulatingPayment(false);
      playAudioChime('success');
      triggerConfetti();
    } catch (err) {
      setIsSimulatingPayment(false);
    }
  };

  const handleDownloadInvoice = (payId: string) => {
    playAudioChime('click');
    alert(`Tax Invoice Receipt for Transaction ${payId} downloaded (PDF).`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Payments, Invoices & Billing History</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 text-xs font-bold border border-teal-500/30">
              Razorpay Secured
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent billing records for OPD consultations, tele-health sessions, and laboratory diagnostics.
          </p>
        </div>

        <button
          onClick={handleSimulatePayment}
          disabled={isSimulatingPayment}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-900/30 transition-all"
        >
          {isSimulatingPayment ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing UPI Payment...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Simulate OPD Fee (₹200)</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Paid (Financial Year)</div>
          <div className="text-2xl font-black font-mono text-emerald-400">₹350.00</div>
          <div className="text-[10px] text-slate-400">All Govt & Subsidized Fees</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Verified Receipts</div>
          <div className="text-2xl font-black font-mono text-teal-300">{payments.length} Records</div>
          <div className="text-[10px] text-slate-400">Digital GST Invoices available</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Payment Gateway</div>
          <div className="text-2xl font-black text-white flex items-center gap-1.5">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
            <span className="text-base font-bold">UPI / Live Gateway</span>
          </div>
          <div className="text-[10px] text-slate-400">256-Bit Encrypted Payments</div>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Receipt className="w-4 h-4 text-teal-400" />
          <span>Billing Transactions & Invoices</span>
        </h2>

        <div className="space-y-3">
          {payments.map(pay => (
            <div
              key={pay.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">OPD Consultation & Service</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {pay.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Order ID: <strong className="text-slate-300 font-mono">{pay.orderId}</strong> • Doctor: {pay.doctorName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-base font-black font-mono text-emerald-400">
                    ₹{pay.amount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">Method: {pay.method || 'UPI'}</div>
                </div>

                <button
                  onClick={() => handleDownloadInvoice(pay.id)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Download Tax Invoice"
                >
                  <Download className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden sm:inline">Invoice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
