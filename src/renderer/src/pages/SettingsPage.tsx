import React, { useState, useEffect } from 'react';
import { DatabaseHealthStatus } from '../../../shared/types/models';
import { DAYS_OF_WEEK } from '../../../shared/constants/defaults';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  Database,
  RefreshCw,
  Save,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';

interface SettingsPageProps {
  dbStatus: DatabaseHealthStatus | null;
  onRefreshDbStatus: () => void;
  onDataChanged: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  dbStatus,
  onRefreshDbStatus,
  onDataChanged,
}) => {
  const toast = useToast();

  const [institutionName, setInstitutionName] = useState('Apex Institute of Technology');
  const [academicTerm, setAcademicTerm] = useState('Fall 2026');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [classDuration, setClassDuration] = useState('60');
  const [availableDailyHours, setAvailableDailyHours] = useState('10');
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchSettings = async () => {
    try {
      if (window.classflowAPI?.settings) {
        const res = await window.classflowAPI.settings.get();
        if (res.success) {
          const s = res.data;
          if (s.institution_name) setInstitutionName(s.institution_name);
          if (s.academic_term) setAcademicTerm(s.academic_term);
          if (s.timetable_start_time) setStartTime(s.timetable_start_time);
          if (s.timetable_end_time) setEndTime(s.timetable_end_time);
          if (s.default_class_duration) setClassDuration(s.default_class_duration);
          if (s.available_daily_teaching_hours) setAvailableDailyHours(s.available_daily_teaching_hours);
        }
      }
    } catch {
      toast.error('Could not fetch settings.');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await window.classflowAPI.settings.update({
        institution_name: institutionName.trim(),
        academic_term: academicTerm.trim(),
        timetable_start_time: startTime,
        timetable_end_time: endTime,
        default_class_duration: Number(classDuration),
        available_daily_teaching_hours: Number(availableDailyHours),
      });

      if (res.success) {
        toast.success('Application settings updated in PostgreSQL.');
        onDataChanged();
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await window.classflowAPI.database.seedDemoData();
      if (res.success) {
        toast.success(res.data.message);
        onRefreshDbStatus();
        onDataChanged();
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to seed demo dataset.');
    } finally {
      setSeeding(false);
    }
  };

  const handleClearWorkspace = async () => {
    setClearing(true);
    try {
      const res = await window.classflowAPI.database.clearWorkspace();
      if (res.success) {
        toast.success(res.data.message);
        setConfirmClearOpen(false);
        onRefreshDbStatus();
        onDataChanged();
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to clear workspace.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '860px' }}>
      {/* Database Status Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={18} color="var(--primary-600)" />
            <div>
              <h3 className="card-title">Database & Infrastructure</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                PostgreSQL Engine & Prisma ORM connection
              </span>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onRefreshDbStatus}
          >
            <RefreshCw size={13} />
            <span>Test Connection</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-surface-muted)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <div
                className={`status-dot ${dbStatus?.connected ? 'online' : 'offline'}`}
              />
              <strong style={{ fontSize: '14px', color: dbStatus?.connected ? 'var(--success)' : 'var(--danger)' }}>
                {dbStatus?.connected ? 'Connected' : 'Disconnected'}
              </strong>
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-surface-muted)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Database Provider</div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
              PostgreSQL (Prisma ORM)
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-surface-muted)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Latency</div>
            <div className="font-mono" style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
              {dbStatus?.latencyMs !== undefined ? `${dbStatus.latencyMs} ms` : '—'}
            </div>
          </div>
        </div>

        {dbStatus?.error && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
            }}
          >
            <strong>Connection Notice:</strong> {dbStatus.error}
          </div>
        )}
      </div>

      {/* Institutional Settings Form */}
      <form onSubmit={handleSaveSettings} className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building size={18} color="var(--primary-600)" />
            <div>
              <h3 className="card-title">Campus Profile & Timetable Parameters</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Configures institutional naming and utilization baselines
              </span>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            <Save size={13} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="inst-name">Institution Name *</label>
              <input
                id="inst-name"
                className="form-input"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inst-term">Academic Term *</label>
              <input
                id="inst-term"
                className="form-input"
                value={academicTerm}
                onChange={(e) => setAcademicTerm(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="set-start">Timetable Day Start *</label>
              <input
                id="set-start"
                type="time"
                className="form-input font-mono"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="set-end">Timetable Day End *</label>
              <input
                id="set-end"
                type="time"
                className="form-input font-mono"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="set-duration">Default Class Duration (Min)</label>
              <input
                id="set-duration"
                type="number"
                min="15"
                max="300"
                className="form-input"
                value={classDuration}
                onChange={(e) => setClassDuration(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="set-hours">Available Hours / Day (Utilization)</label>
              <input
                id="set-hours"
                type="number"
                min="1"
                max="24"
                className="form-input"
                value={availableDailyHours}
                onChange={(e) => setAvailableDailyHours(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      </form>

      {/* Demo & Data Management */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} color="var(--primary-600)" />
            <div>
              <h3 className="card-title">Data Management</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Demonstration datasets and database maintenance
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px',
              backgroundColor: 'var(--bg-surface-muted)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div>
              <strong style={{ fontSize: '13px' }}>Seed Demo Academic Dataset</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Populates realistic classrooms, faculty, subjects, and weekly timetable without conflicts.
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleSeed}
              disabled={seeding}
            >
              {seeding ? 'Seeding...' : 'Load Sample Data'}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px',
              backgroundColor: 'var(--danger-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--danger-border)',
            }}
          >
            <div>
              <strong style={{ fontSize: '13px', color: 'var(--danger)' }}>Reset Workspace</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Permanently wipes all classrooms, faculty, subjects, and schedules from PostgreSQL.
              </p>
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setConfirmClearOpen(true)}
            >
              <Trash2 size={13} />
              <span>Reset Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmClearOpen}
        title="Clear All Workspace Data?"
        message="This action will permanently delete all classrooms, faculty members, subjects, and timetable schedules from your PostgreSQL database. This cannot be undone."
        confirmLabel="Yes, Delete All Data"
        isDestructive={true}
        isLoading={clearing}
        onConfirm={handleClearWorkspace}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};
