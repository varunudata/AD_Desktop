import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { ScheduleWithRelations } from '../../../../shared/types/models';
import { Clock, Building2, User, BookOpen, AlertTriangle, Edit3, Trash2 } from 'lucide-react';

interface ScheduleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleWithRelations | null;
  onEdit: (schedule: ScheduleWithRelations) => void;
  onDelete: (schedule: ScheduleWithRelations) => void;
}

export const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onEdit,
  onDelete,
}) => {
  if (!schedule) return null;

  const isOverCapacity = schedule.expectedStudents > schedule.classroom.capacity;
  const excess = schedule.expectedStudents - schedule.classroom.capacity;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Class Session Details"
      footer={
        <>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => {
              onClose();
              onDelete(schedule);
            }}
          >
            <Trash2 size={14} />
            <span>Delete Booking</span>
          </button>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              onClose();
              onEdit(schedule);
            }}
          >
            <Edit3 size={14} />
            <span>Edit Schedule</span>
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Subject Header Card */}
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: 'var(--primary-50)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--primary-600)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary-700)', textTransform: 'uppercase' }}>
            {schedule.subject.code} • {schedule.subject.department}
          </div>
          <h2 style={{ fontSize: '17px', color: 'var(--text-primary)', marginTop: '2px' }}>
            {schedule.subject.name}
          </h2>
          {schedule.subject.semester && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Academic Term: {schedule.subject.semester}
            </div>
          )}
        </div>

        {/* Schedule Time & Day */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
              <Clock size={15} color="var(--primary-600)" />
              <strong>Schedule Timing</strong>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
              {schedule.dayOfWeek}
            </div>
            <div className="font-mono" style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              {schedule.startTime} — {schedule.endTime}
            </div>
          </div>

          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
              <Building2 size={15} color="var(--cyan)" />
              <strong>Classroom Location</strong>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
              {schedule.classroom.code} • {schedule.classroom.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {schedule.classroom.building} (Cap: {schedule.classroom.capacity})
            </div>
          </div>
        </div>

        {/* Faculty Details */}
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
            <User size={15} color="var(--violet)" />
            <strong>Assigned Faculty</strong>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
            {schedule.faculty.fullName}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {schedule.faculty.department} {schedule.faculty.email ? `• ${schedule.faculty.email}` : ''}
          </div>
        </div>

        {/* Attendance & Capacity Analysis */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isOverCapacity ? 'var(--warning-bg)' : 'var(--bg-surface-muted)',
            border: `1px solid ${isOverCapacity ? 'var(--warning-border)' : 'var(--border-default)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Expected Attendance</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {schedule.expectedStudents} students
            </div>
          </div>

          {isOverCapacity ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--warning)' }}>
              <AlertTriangle size={16} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Exceeds capacity by {excess}</span>
            </div>
          ) : (
            <span className="badge badge-green">Within Room Capacity</span>
          )}
        </div>

        {/* Notes */}
        {schedule.notes && (
          <div className="form-group">
            <label className="form-label">Session Notes</label>
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--bg-surface-muted)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            >
              {schedule.notes}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
