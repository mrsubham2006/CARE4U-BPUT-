import React, { useState } from 'react';
import { useApp } from '../../services/store';
import {
  Bell,
  X,
  CheckCheck,
  AlertCircle,
  Clock,
  Building2,
  Stethoscope,
  FlaskConical,
  Pill,
  ShieldAlert,
  Radio
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, playAudioChime } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'ALERTS'>('ALL');

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'ALERTS')
      return n.type === 'CAPACITY_ALERT' || n.type === 'STOCKOUT_ALERT' || n.type === 'SYSTEM_ALERT';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT_CONFIRMED':
      case 'DOCTOR_ASSIGNED':
        return <Stethoscope className="w-4 h-4 text-blue-400" />;
      case 'LAB_ORDER_CREATED':
      case 'LAB_REPORT_READY':
        return <FlaskConical className="w-4 h-4 text-purple-400" />;
      case 'PRESCRIPTION_CREATED':
      case 'MEDICINE_READY':
        return <Pill className="w-4 h-4 text-amber-400" />;
      case 'CAPACITY_ALERT':
      case 'STOCKOUT_ALERT':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'REFERRAL_CREATED':
      case 'REFERRAL_ACCEPTED':
        return <Building2 className="w-4 h-4 text-cyan-400" />;
      default:
        return <Radio className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Network Notifications
              </h3>
              <p className="text-xs text-slate-400">
                Live cross-panel event stream
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playAudioChime('click');
                markAllNotificationsRead();
              }}
              title="Mark all as read"
              className="p-1.5 text-xs text-slate-400 hover:text-teal-300 hover:bg-slate-800 rounded transition cursor-pointer flex items-center gap-1"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Mark read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="p-3 bg-slate-950/50 border-b border-slate-800/80 flex gap-2">
          {(['ALL', 'UNREAD', 'ALERTS'] as const).map(f => (
            <button
              key={f}
              onClick={() => {
                playAudioChime('click');
                setFilter(f);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                filter === f
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {f === 'ALL' ? 'All Events' : f === 'UNREAD' ? 'Unread Only' : 'Critical Alerts'}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-40" />
              No notifications in this category.
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  item.isRead
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    : 'bg-teal-950/20 border-teal-500/40 text-white shadow-sm'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold truncate text-slate-100">{item.title}</h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-1.5">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span className="uppercase">{item.targetRole}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
