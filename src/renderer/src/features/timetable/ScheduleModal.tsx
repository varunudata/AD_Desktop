import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Classroom, Faculty, Subject, ScheduleWithRelations, DayOfWeek } from '../../../../shared/types/models';
import { CreateScheduleInput } from '../../../../shared/types/api';
import { DAYS_OF_WEEK } from '../../../../shared/constants/defaults';
import { useToast } from '../../components/ui/Toast';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleToEdit?: ScheduleWithRelations | null;
  initialDay?: DayOfWeek;
  initialTime?: string;
  classrooms: Classroom[];
  facultyList: Faculty[];
  subjects: Subject[];
  onSuccess: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  scheduleToEdit,
  initialDay,
  initialTime,
  classrooms,
  facultyList,
  subjects,
  onSuccess,
}) => {
  const toast = useToast();
  const isEditing = Boolean(scheduleToEdit);

  const [subjectId, setSubjectId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('MONDAY');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [expectedStudents, setExpectedStudents] = useState<number | string>(40);
  const [notes, setNotes] = useState('');
  const [forceBypassCapacity, setForceBypassCapacity] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ code: string; message: string } | null>(null);

  useEffect(() => {
    if (scheduleToEdit) {
      setSubjectId(scheduleToEdit.subjectId);
      setFacultyId(scheduleToEdit.facultyId);
      setClassroomId(scheduleToEdit.classroomId);
      setDayOfWeek(scheduleToEdit.dayOfWeek as DayOfWeek);
      setStartTime(scheduleToEdit.startTime);
      setEndTime(scheduleToEdit.endTime);
      setExpectedStudents(scheduleToEdit.expectedStudents);
      setNotes(scheduleToEdit.notes || '');
    } else {
      if (subjects.length > 0) setSubjectId(subjects[0].id);
      if (facultyList.length > 0) setFacultyId(facultyList[0].id);
      if (classrooms.length > 0) setClassroomId(classrooms[0].id);
      setDayOfWeek(initialDay || 'MONDAY');
      setStartTime(initialTime || '09:00');
      // Default duration: 1h 30m
      if (initialTime) {
        const [h, m] = initialTime.split(':').map(Number);
        const endTotal = h * 60 + m + 90;
        const endH = String(Math.floor(endTotal / 60)).padStart(2, '0');
        const endM = String(endTotal % 60).padStart(2, '0');
        setEndTime(`${endH}:${endM}`);
      } else {
        setEndTime('10:30');
      }
      setExpectedStudents(40);
      setNotes('');
    }
    setForceBypassCapacity(false);
    setErrorDetails(null);
  }, [scheduleToEdit, isOpen, classrooms, facultyList, subjects, initialDay, initialTime]);

  // When subject changes, automatically pre-fill expected attendance from subject defaults
  const handleSubjectChange = (id: string) => {
    setSubjectId(id);
    const sub = subjects.find((s) => s.id === id);
    if (sub?.defaultExpectedStudents) {
      setExpectedStudents(sub.defaultExpectedStudents);
    }
  };

  const selectedClassroom = classrooms.find((c) => c.id === classroomId);
  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const numStudents = Number(expectedStudents) || 0;
  const isOverCapacity = selectedClassroom && numStudents > selectedClassroom.capacity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);

    if (!subjectId || !facultyId || !classroomId) {
      setErrorDetails({ code: 'VALIDATION', message: 'Subject, faculty, and classroom are required.' });
      return;
    }

    if (startTime >= endTime) {
      setErrorDetails({
        code: 'INVALID_TIME_RANGE',
        message: `End time (${endTime}) must be strictly after start time (${startTime}).`,
      });
      return;
    }

    setSubmitting(true);
    const payload: CreateScheduleInput = {
      subjectId,
      facultyId,
      classroomId,
      dayOfWeek,
      startTime,
      endTime,
      expectedStudents: numStudents,
      notes: notes.trim() || null,
      forceBypassCapacityWarning: forceBypassCapacity,
    };

    try {
      if (!window.classflowAPI?.schedules) {
        setErrorDetails({ code: 'IPC_UNAVAILABLE', message: 'ClassFlow desktop bridge is not ready. Please restart the application.' });
        return;
      }
      if (isEditing && scheduleToEdit) {
        const res = await window.classflowAPI.schedules.update(scheduleToEdit.id, payload);
        if (res.success) {
          toast.success('Schedule updated successfully.');
          onSuccess();
          onClose();
        } else {
          setErrorDetails({ code: res.error.code, message: res.error.message });
        }
      } else {
        const res = await window.classflowAPI.schedules.create(payload);
        if (res.success) {
          toast.success('Class scheduled successfully.');
          onSuccess();
          onClose();
        } else {
          setErrorDetails({ code: res.error.code, message: res.error.message });
        }
      }
    } catch (err: unknown) {
      setErrorDetails({ code: 'EXCEPTION', message: err instanceof Error ? err.message : 'Unexpected error.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Schedule Booking' : 'Schedule a Class'}
      size="large"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Validating...' : isEditing ? 'Save Changes' : 'Confirm & Schedule'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Error / Conflict Alert Box */}
        {errorDetails && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ color: 'var(--danger)', fontSize: '13px' }}>
                {errorDetails.code === 'ROOM_CONFLICT' && 'Classroom Conflict Detected'}
                {errorDetails.code === 'FACULTY_CONFLICT' && 'Faculty Member Conflict Detected'}
                {errorDetails.code === 'INVALID_TIME_RANGE' && 'Invalid Time Range'}
                {errorDetails.code !== 'ROOM_CONFLICT' &&
                  errorDetails.code !== 'FACULTY_CONFLICT' &&
                  errorDetails.code !== 'INVALID_TIME_RANGE' &&
                  'Validation Error'}
              </strong>
              <p style={{ color: 'var(--text-primary)', fontSize: '12px', marginTop: '3px', lineHeight: 1.5 }}>
                {errorDetails.message}
              </p>

              {errorDetails.message.includes('capacity') && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="override-capacity"
                    checked={forceBypassCapacity}
                    onChange={(e) => setForceBypassCapacity(e.target.checked)}
                  />
                  <label htmlFor="override-capacity" style={{ fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    I acknowledge the classroom capacity shortfall and want to proceed anyway.
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Capacity Warning Preview */}
        {isOverCapacity && !errorDetails && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <AlertTriangle size={16} color="var(--warning)" />
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', flex: 1 }}>
              Expected students ({numStudents}) exceeds room capacity ({selectedClassroom?.capacity}).
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                id="preview-bypass"
                checked={forceBypassCapacity}
                onChange={(e) => setForceBypassCapacity(e.target.checked)}
              />
              <label htmlFor="preview-bypass" style={{ fontSize: '12px', cursor: 'pointer' }}>
                Confirm Override
              </label>
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="sched-subject">Academic Subject *</label>
            <select
              id="sched-subject"
              className="form-select"
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              required
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} — {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sched-faculty">Faculty Member *</label>
            <select
              id="sched-faculty"
              className="form-select"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              required
            >
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.fullName} ({f.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="sched-classroom">Assigned Classroom *</label>
            <select
              id="sched-classroom"
              className="form-select"
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              required
            >
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name} (Cap: {c.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sched-day">Day of Week *</label>
            <select
              id="sched-day"
              className="form-select"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
              required
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="sched-start">Start Time (24h) *</label>
            <input
              id="sched-start"
              type="time"
              className="form-input font-mono"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sched-end">End Time (24h) *</label>
            <input
              id="sched-end"
              type="time"
              className="form-input font-mono"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sched-students">Expected Students *</label>
            <input
              id="sched-students"
              type="number"
              min="1"
              max="1000"
              className="form-input"
              value={expectedStudents}
              onChange={(e) => setExpectedStudents(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="sched-notes">Session Notes / Description</label>
          <textarea
            id="sched-notes"
            className="form-textarea"
            rows={2}
            placeholder="Topic overview, lab experiment instructions, guest lecture notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
