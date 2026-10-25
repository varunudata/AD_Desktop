import React, { useState, useEffect } from 'react';
import { RoomUtilization } from '../../../shared/types/models';
import { DAYS_OF_WEEK } from '../../../shared/constants/defaults';
import { useToast } from '../components/ui/Toast';
import {
  Download,
  BarChart3,
  Building2,
  Calendar,
  Users,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

interface ReportsPageProps {
  refreshTrigger: number;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ refreshTrigger }) => {
  const toast = useToast();
  const [utilization, setUtilization] = useState<RoomUtilization[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [exportingType, setExportingType] = useState<string | null>(null);

  const fetchUtilization = async () => {
    setLoading(true);
    try {
      if (window.classflowAPI?.reports) {
        const filters = selectedDay !== 'ALL' ? { dayOfWeek: selectedDay } : undefined;
        const res = await window.classflowAPI.reports.getRoomUtilization(filters);
        if (res.success) {
          setUtilization(res.data);
        } else {
          toast.error(res.error.message);
        }
      }
    } catch {
      toast.error('Could not load room utilization report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilization();
  }, [refreshTrigger, selectedDay]);

  const handleExportCsv = async (
    type: 'timetable' | 'classrooms' | 'faculty' | 'subjects' | 'utilization'
  ) => {
    setExportingType(type);
    try {
      const filters = selectedDay !== 'ALL' ? { dayOfWeek: selectedDay } : undefined;
      const res = await window.classflowAPI.reports.exportCsv({ type, filters });
      if (res.success) {
        if (res.data.saved) {
          toast.success(`Exported ${res.data.recordsCount} records to CSV.`);
        }
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to export CSV file.');
    } finally {
      setExportingType(null);
    }
  };

  // Compute average campus utilization
  const averageUtilization =
    utilization.length > 0
      ? (
          utilization.reduce((acc, u) => acc + u.utilizationPercentage, 0) /
          utilization.length
        ).toFixed(1)
      : '0.0';

  const totalScheduledHours = utilization
    .reduce((acc, u) => acc + u.scheduledHours, 0)
    .toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Export Hub Card */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '14px' }}>
          <div>
            <h3 className="card-title">Institutional CSV Data Exports</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Export clean, RFC 4180-compliant datasets with formula injection protection
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => handleExportCsv('timetable')}
            disabled={exportingType === 'timetable'}
            style={{ justifyContent: 'flex-start', padding: '12px 14px' }}
          >
            <Calendar size={16} color="var(--primary-600)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>Timetable Schedule</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Export all class sessions</div>
            </div>
            <Download size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => handleExportCsv('utilization')}
            disabled={exportingType === 'utilization'}
            style={{ justifyContent: 'flex-start', padding: '12px 14px' }}
          >
            <BarChart3 size={16} color="var(--cyan)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>Room Utilization</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Usage % & booked hours</div>
            </div>
            <Download size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => handleExportCsv('classrooms')}
            disabled={exportingType === 'classrooms'}
            style={{ justifyContent: 'flex-start', padding: '12px 14px' }}
          >
            <Building2 size={16} color="var(--violet)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>Classrooms Directory</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Capacity & equipment</div>
            </div>
            <Download size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => handleExportCsv('faculty')}
            disabled={exportingType === 'faculty'}
            style={{ justifyContent: 'flex-start', padding: '12px 14px' }}
          >
            <Users size={16} color="var(--success)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>Faculty Directory</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Staff & departments</div>
            </div>
            <Download size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => handleExportCsv('subjects')}
            disabled={exportingType === 'subjects'}
            style={{ justifyContent: 'flex-start', padding: '12px 14px' }}
          >
            <BookOpen size={16} color="var(--warning)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>Subjects Catalog</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Courses & semesters</div>
            </div>
            <Download size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Room Utilization Section */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 className="card-title">Classroom Utilization Analytics</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Formula: (Scheduled Booking Hours / Available Teaching Hours) × 100
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Scope:</span>
              <select
                className="form-select"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
              >
                <option value="ALL">Full Academic Week (5 Days)</option>
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label} Only
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--primary-50)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--primary-700)',
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              Avg Campus Utilization: {averageUtilization}% ({totalScheduledHours} hrs)
            </div>
          </div>
        </div>

        {/* Utilization Table */}
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          {utilization.length === 0 ? (
            <div className="empty-state">
              <BarChart3 size={36} color="var(--text-muted)" />
              <div className="empty-state-title">No Utilization Data Available</div>
              <p className="empty-state-text">
                Add classrooms and schedule classes to compute campus space utilization.
              </p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Classroom</th>
                  <th>Room Type</th>
                  <th>Capacity</th>
                  <th>Booked Hours</th>
                  <th>Available Hours</th>
                  <th>Sessions</th>
                  <th style={{ width: '280px' }}>Utilization Rate (%)</th>
                </tr>
              </thead>
              <tbody>
                {utilization.map((u) => {
                  let barColor = 'var(--primary-600)';
                  if (u.utilizationPercentage > 75) barColor = 'var(--warning)';
                  if (u.utilizationPercentage > 90) barColor = 'var(--danger)';

                  return (
                    <tr key={u.classroomId}>
                      <td>
                        <strong>{u.classroomCode}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {u.classroomName}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-muted">{u.roomType.replace('_', ' ')}</span>
                      </td>
                      <td>{u.capacity} seats</td>
                      <td className="font-mono">
                        <strong>{u.scheduledHours}</strong> hrs
                      </td>
                      <td className="font-mono" style={{ color: 'var(--text-muted)' }}>
                        {u.availableHours} hrs
                      </td>
                      <td>{u.classesCount} classes</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              flex: 1,
                              height: '8px',
                              backgroundColor: 'var(--border-default)',
                              borderRadius: 'var(--radius-full)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${u.utilizationPercentage}%`,
                                height: '100%',
                                backgroundColor: barColor,
                                borderRadius: 'var(--radius-full)',
                                transition: 'width 300ms ease',
                              }}
                            />
                          </div>
                          <span
                            className="font-mono"
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              minWidth: '42px',
                              textAlign: 'right',
                            }}
                          >
                            {u.utilizationPercentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
