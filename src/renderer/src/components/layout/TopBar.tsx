import React from 'react';
import { Plus, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { NavPage } from './Sidebar';

interface TopBarProps {
  currentPage: NavPage;
  onQuickAction: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const PAGE_META: Record<NavPage, { title: string; subtitle: string; actionLabel: string }> = {
  overview: {
    title: 'Overview',
    subtitle: 'Campus schedule, room utilization, and capacity insights.',
    actionLabel: 'Schedule Class',
  },
  timetable: {
    title: 'Timetable',
    subtitle: 'Interactive weekly and daily class schedule grid.',
    actionLabel: 'New Class Booking',
  },
  classrooms: {
    title: 'Classroom Inventory',
    subtitle: 'Manage lecture halls, laboratories, capacities, and equipment.',
    actionLabel: 'Add Classroom',
  },
  faculty: {
    title: 'Faculty Directory',
    subtitle: 'Manage academic staff, departments, and teaching schedules.',
    actionLabel: 'Add Faculty',
  },
  subjects: {
    title: 'Academic Subjects',
    subtitle: 'Curriculum catalog, semesters, and equipment requirements.',
    actionLabel: 'Add Subject',
  },
  reports: {
    title: 'Reports & Analytics',
    subtitle: 'Classroom utilization rates and exportable timetable datasets.',
    actionLabel: 'Export Data',
  },
  settings: {
    title: 'Settings & Administration',
    subtitle: 'Academic term, working hours, and PostgreSQL database status.',
    actionLabel: 'Test Connection',
  },
};

export const TopBar: React.FC<TopBarProps> = ({
  currentPage,
  onQuickAction,
  onRefresh,
  isRefreshing = false,
}) => {
  const meta = PAGE_META[currentPage];

  // Formatted date string (e.g. "Monday, October 26, 2026")
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{meta.title}</h1>
        <span className="topbar-subtitle">{meta.subtitle}</span>
      </div>

      <div className="topbar-actions">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            backgroundColor: 'var(--bg-surface-muted)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
          }}
        >
          <CalendarIcon size={13} color="var(--primary-600)" />
          <span>{todayFormatted}</span>
        </div>

        <button
          className="btn btn-secondary btn-icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh database records"
          aria-label="Refresh database records"
        >
          <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
        </button>

        {currentPage !== 'settings' && (
          <button
            className="btn btn-primary"
            onClick={onQuickAction}
          >
            <Plus size={15} />
            <span>{meta.actionLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
};
