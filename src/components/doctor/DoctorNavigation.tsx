import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  Stethoscope,
  Video,
  FileText,
  FlaskConical,
  FileCheck2,
  Share2,
  CalendarClock,
  Bell,
  UserCheck,
  Settings,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User } from '../../types';

export type DoctorNavTab =
  | 'dashboard'
  | 'appointments'
  | 'opd_queue'
  | 'patients'
  | 'consultations'
  | 'video_consultations'
  | 'prescriptions'
  | 'lab_orders'
  | 'lab_reports'
  | 'referrals'
  | 'follow_ups'
  | 'notifications'
  | 'profile'
  | 'settings';

interface DoctorNavigationProps {
  currentTab: DoctorNavTab;
  onSelectTab: (tab: DoctorNavTab) => void;
  onLogout: () => void;
  currentUser: User | null;
  counts: {
    todayAppointments: number;
    opdWaiting: number;
    videoConsultations: number;
    pendingLabReports: number;
    unreadNotifications: number;
    followUpsDue: number;
  };
}

export const DoctorNavigation: React.FC<DoctorNavigationProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  currentUser,
  counts
}) => {
  const navItems: {
    id: DoctorNavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: <Calendar className="w-4 h-4" />,
      badge: counts.todayAppointments,
      badgeColor: 'bg-teal-500/30 text-teal-300 border-teal-500/40'
    },
    {
      id: 'opd_queue',
      label: 'OPD Queue',
      icon: <Clock className="w-4 h-4" />,
      badge: counts.opdWaiting,
      badgeColor: 'bg-amber-500/30 text-amber-300 border-amber-500/40'
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'consultations',
      label: 'Consultations',
      icon: <Stethoscope className="w-4 h-4" />
    },
    {
      id: 'video_consultations',
      label: 'Video Consultations',
      icon: <Video className="w-4 h-4" />,
      badge: counts.videoConsultations,
      badgeColor: 'bg-sky-500/30 text-sky-300 border-sky-500/40'
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'lab_orders',
      label: 'Lab Orders',
      icon: <FlaskConical className="w-4 h-4" />
    },
    {
      id: 'lab_reports',
      label: 'Lab Reports',
      icon: <FileCheck2 className="w-4 h-4" />,
      badge: counts.pendingLabReports,
      badgeColor: 'bg-purple-500/30 text-purple-300 border-purple-500/40'
    },
    {
      id: 'referrals',
      label: 'Referrals',
      icon: <Share2 className="w-4 h-4" />
    },
    {
      id: 'follow_ups',
      label: 'Follow-ups',
      icon: <CalendarClock className="w-4 h-4" />,
      badge: counts.followUpsDue,
      badgeColor: 'bg-indigo-500/30 text-indigo-300 border-indigo-500/40'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      badge: counts.unreadNotifications,
      badgeColor: 'bg-rose-500/30 text-rose-300 border-rose-500/40'
    },
    {
      id: 'profile',
      label: 'Doctor Profile',
      icon: <UserCheck className="w-4 h-4" />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0 lg:min-h-[calc(100vh-80px)]">
      {/* Clinician Identity Card */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold text-lg shadow-inner">
            🩺
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-white truncate font-display">
              {currentUser?.name || 'Dr. Rajesh Sharma'}
            </h3>
            <p className="text-[11px] text-teal-400 truncate">
              {currentUser?.department || 'General Medicine'}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-mono">OPD Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll on Mobile / Vertical on Desktop */}
      <div className="flex-1 overflow-x-auto lg:overflow-y-auto py-3 px-2 lg:px-3 space-y-1 lg:space-y-1 flex lg:flex-col gap-1 lg:gap-0 scrollbar-thin">
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-white border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-teal-400' : 'text-slate-500'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Logout Action at Bottom */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition cursor-pointer border border-transparent hover:border-rose-900/50"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
