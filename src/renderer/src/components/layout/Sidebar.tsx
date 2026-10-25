import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  BookOpen,
  BarChart3,
  Settings as SettingsIcon,
  Layers,
  Database,
  LucideIcon,
} from 'lucide-react';
import { DatabaseHealthStatus } from '@shared/types/models';

export type NavPage =
  | 'overview'
  | 'timetable'
  | 'classrooms'
  | 'faculty'
  | 'subjects'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  dbStatus: DatabaseHealthStatus | null;
}

const NAV_ITEMS: { id: NavPage; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'timetable', label: 'Timetable', icon: Calendar },
  { id: 'classrooms', label: 'Classrooms', icon: Building2 },
  { id: 'faculty', label: 'Faculty', icon: Users },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  dbStatus,
}) => {
  return (
    <aside className="app-sidebar" aria-label="Main Navigation">
      <div className="sidebar-header">
        <div className="brand-logo" aria-hidden="true">
          <Layers size={18} strokeWidth={2.4} />
        </div>
        <div className="brand-text">
          <span className="brand-title">ClassFlow</span>
          <span className="brand-tagline">Academic Scheduling</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="db-status-pill">
          <div
            className={`status-dot ${dbStatus?.connected ? 'online' : 'offline'}`}
            aria-hidden="true"
          />
          <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {dbStatus?.connected ? 'PostgreSQL Active' : 'PostgreSQL Offline'}
          </span>
          <Database size={12} color="var(--text-muted)" />
        </div>
      </div>
    </aside>
  );
};
