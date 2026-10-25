import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Faculty, ScheduleWithRelations } from '../../../../shared/types/models';
import { Clock, Building2, BookOpen, Calendar } from 'lucide-react';

interface FacultyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: Faculty | null;
  schedules: ScheduleWithRelations[];
}

export const FacultyScheduleModal: React.FC<FacultyScheduleModalProps> = ({
  isOpen,
  onClose,
  faculty,
  schedules,
}) => {
  if (!faculty) return null;

  const facultySchedules = schedules
    .filter((s) => s.facultyId === faculty.id)
    .sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek.localeCompare(b.dayOfWeek);
      return a.startTime.localeCompare(b.startTime);
    });

  // Calculate total weekly teaching hours
  const totalMinutes = facultySchedules.reduce((acc, s) => {
    const [startH, startM] = s.startTime.split(':').map(Number);
    const [endH, endM] = s.endTime.split(':').map(Number);
    return acc + ((endH * 60 + endM) - (startH * 60 + startM));
  }, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Weekly Teaching Schedule — ${faculty.fullName}`}
      size="large"
      footer={
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'var(--bg-surface-muted)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Department: {faculty.department}</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{faculty.designation || 'Faculty Member'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Committed Teaching Load</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-600)' }}>
              {totalHours} hrs / week ({facultySchedules.length} classes)
            </div>
          </div>
        </div>

        {facultySchedules.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 16px' }}>
            <Calendar size={36} color="var(--text-muted)" />
            <div className="empty-state-title">No Classes Assigned</div>
            <p className="empty-state-text">This faculty member has no scheduled classes for the current academic term.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Classroom</th>
                  <th>Students</th>
                </tr>
              </thead>
              <tbody>
                {facultySchedules.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="badge badge-muted font-mono">{s.dayOfWeek}</span>
                    </td>
                    <td className="font-mono">{s.startTime} – {s.endTime}</td>
                    <td>
                      <strong>{s.subject.code}</strong> — {s.subject.name}
                    </td>
                    <td>
                      <span className="badge badge-blue">{s.classroom.code}</span>
                    </td>
                    <td>{s.expectedStudents} students</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
};
