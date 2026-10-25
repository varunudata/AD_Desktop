import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  BookOpen,
  Calendar,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  Database,
  CheckCircle,
} from 'lucide-react';
import { DashboardSummary, ScheduleWithRelations } from '../../../shared/types/models';
import { useToast } from '../components/ui/Toast';
import { NavPage } from '../components/layout/Sidebar';

interface OverviewPageProps {
  onNavigate: (page: NavPage) => void;
  onOpenScheduleModal: () => void;
  onOpenClassroomModal: () => void;
  onOpenFacultyModal: () => void;
  onOpenSubjectModal: () => void;
  onSelectSchedule: (schedule: ScheduleWithRelations) => void;
  refreshTrigger: number;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onNavigate,
  onOpenScheduleModal,
  onOpenClassroomModal,
  onOpenFacultyModal,
  onOpenSubjectModal,
  onSelectSchedule,
  refreshTrigger,
}) => {
  const toast = useToast();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      if (window.classflowAPI?.dashboard) {
        const res = await window.classflowAPI.dashboard.getSummary();
        if (res.success) {
          setSummary(res.data);
        } else {
          toast.error(res.error.message);
        }
      }
    } catch (err: unknown) {
      toast.error('Could not load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [refreshTrigger]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await window.classflowAPI.database.seedDemoData();
      if (res.success) {
        toast.success(res.data.message);
        fetchSummary();
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to seed demo data.');
    } finally {
      setSeeding(false);
    }
  };

  const isEmpty = summary && summary.totalClassrooms === 0 && summary.totalFaculty === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)' }}>
            <Building2 size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Classrooms</span>
            <span className="metric-value">{summary?.totalClassrooms ?? '0'}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ backgroundColor: 'var(--violet-bg)', color: 'var(--violet)' }}>
            <Users size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Faculty Staff</span>
            <span className="metric-value">{summary?.totalFaculty ?? '0'}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ backgroundColor: 'var(--cyan-bg)', color: 'var(--cyan)' }}>
            <BookOpen size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Subjects</span>
            <span className="metric-value">{summary?.totalSubjects ?? '0'}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <Calendar size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Today's Classes</span>
            <span className="metric-value">{summary?.todayClassesCount ?? '0'}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <Clock size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Free Rooms Today</span>
            <span className="metric-value">{summary?.availableRoomsToday ?? '0'}</span>
          </div>
        </div>
      </div>

      {/* Empty Database Prompt */}
      {isEmpty && (
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '40px 24px',
            gap: '14px',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Database size={28} />
          </div>
          <h2 style={{ fontSize: '18px' }}>Welcome to ClassFlow</h2>
          <p style={{ maxWidth: '460px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Your PostgreSQL database is currently empty. You can start creating your classrooms,
            faculty, and courses manually, or load our realistic academic dataset for demonstration.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button className="btn btn-primary" onClick={handleSeed} disabled={seeding}>
              {seeding ? 'Populating Database...' : 'Load Academic Sample Data'}
            </button>
            <button className="btn btn-secondary" onClick={onOpenClassroomModal}>
              + Add First Classroom
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Layout */}
      {!isEmpty && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Today's Schedule */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Today's Class Schedule</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Active timetabled sessions for campus today
                </span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onNavigate('timetable')}
              >
                <span>Full Timetable</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {summary?.todaySchedules && summary.todaySchedules.length > 0 ? (
              <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Subject</th>
                      <th>Classroom</th>
                      <th>Faculty</th>
                      <th>Expected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.todaySchedules.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => onSelectSchedule(s)}
                        style={{ cursor: 'pointer' }}
                        title="Click to view details"
                      >
                        <td className="font-mono">
                          <strong>{s.startTime}</strong> – {s.endTime}
                        </td>
                        <td>
                          <strong>{s.subject.code}</strong> {s.subject.name}
                        </td>
                        <td>
                          <span className="badge badge-blue">{s.classroom.code}</span>
                        </td>
                        <td>{s.faculty.fullName}</td>
                        <td>{s.expectedStudents} students</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '36px 16px' }}>
                <Calendar size={36} color="var(--text-muted)" />
                <div className="empty-state-title">No Classes Scheduled Today</div>
                <p className="empty-state-text">
                  There are no scheduled lecture or lab sessions for today. Click below to schedule a session.
                </p>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={onOpenScheduleModal}
                  style={{ marginTop: '8px' }}
                >
                  <Plus size={14} />
                  <span>Book Class Session</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions & Capacity Warnings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Actions Card */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '14px' }}>Administrative Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={onOpenScheduleModal}
                  style={{ justifyContent: 'flex-start', padding: '10px 12px' }}
                >
                  <Calendar size={15} color="var(--primary-600)" />
                  <span>Book Class</span>
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={onOpenClassroomModal}
                  style={{ justifyContent: 'flex-start', padding: '10px 12px' }}
                >
                  <Building2 size={15} color="var(--cyan)" />
                  <span>Add Room</span>
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={onOpenFacultyModal}
                  style={{ justifyContent: 'flex-start', padding: '10px 12px' }}
                >
                  <Users size={15} color="var(--violet)" />
                  <span>Add Faculty</span>
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={onOpenSubjectModal}
                  style={{ justifyContent: 'flex-start', padding: '10px 12px' }}
                >
                  <BookOpen size={15} color="var(--success)" />
                  <span>Add Subject</span>
                </button>
              </div>
            </div>

            {/* Capacity Alerts Card */}
            <div className="card">
              <div className="card-header" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} color="var(--warning)" />
                  <h3 className="card-title" style={{ fontSize: '14px' }}>Capacity Alerts</h3>
                </div>
                {summary?.capacityWarnings && summary.capacityWarnings.length > 0 && (
                  <span className="badge badge-amber">{summary.capacityWarnings.length} flagged</span>
                )}
              </div>

              {summary?.capacityWarnings && summary.capacityWarnings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {summary.capacityWarnings.map((w, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--warning-bg)',
                        border: '1px solid var(--warning-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {w.subjectName}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Room {w.classroomCode} (Cap: {w.capacity}) is over capacity by {w.excess} ({w.expectedStudents} expected).
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '12px', padding: '10px 0' }}>
                  <CheckCircle size={16} />
                  <span>All scheduled classes conform to room capacity limits.</span>
                </div>
              )}
            </div>

            {/* Room Distribution Breakdown */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '12px', fontSize: '14px' }}>Classroom Types</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {summary?.roomTypeBreakdown && summary.roomTypeBreakdown.length > 0 ? (
                  summary.roomTypeBreakdown.map((b) => (
                    <div
                      key={b.type}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        padding: '6px 0',
                        borderBottom: '1px solid var(--border-default)',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {b.type.replace('_', ' ')}
                      </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{b.count} rooms</strong>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No rooms configured.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
