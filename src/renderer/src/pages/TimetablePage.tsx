import React, { useState } from 'react';
import {
  ScheduleWithRelations,
  Classroom,
  Faculty,
  Subject,
  DayOfWeek,
} from '../../../shared/types/models';
import { DAYS_OF_WEEK } from '../../../shared/constants/defaults';
import {
  Calendar as CalendarIcon,
  Clock,
  Building2,
  User,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface TimetablePageProps {
  schedules: ScheduleWithRelations[];
  classrooms: Classroom[];
  facultyList: Faculty[];
  subjects: Subject[];
  onOpenScheduleModal: (day?: DayOfWeek, time?: string) => void;
  onSelectSchedule: (schedule: ScheduleWithRelations) => void;
  isLoading: boolean;
}

// Hourly time slots for grid (from 08:00 to 18:00)
const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

export const TimetablePage: React.FC<TimetablePageProps> = ({
  schedules,
  classrooms,
  facultyList,
  subjects,
  onOpenScheduleModal,
  onSelectSchedule,
  isLoading,
}) => {
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MONDAY');
  const [filterClassroomId, setFilterClassroomId] = useState<string>('ALL');
  const [filterFacultyId, setFilterFacultyId] = useState<string>('ALL');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('ALL');

  // Filter schedules based on active selections
  const filteredSchedules = schedules.filter((s) => {
    if (filterClassroomId !== 'ALL' && s.classroomId !== filterClassroomId) return false;
    if (filterFacultyId !== 'ALL' && s.facultyId !== filterFacultyId) return false;
    if (filterSubjectId !== 'ALL' && s.subjectId !== filterSubjectId) return false;
    return true;
  });

  // Working days (Monday to Friday for standard academic week, or all 7)
  const displayDays = DAYS_OF_WEEK.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Filter and View Switcher Toolbar */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: View Mode Toggle & Day Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--bg-surface-muted)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '2px',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'weekly' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('weekly')}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              Weekly Grid
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'daily' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('daily')}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              Daily View
            </button>
          </div>

          {viewMode === 'daily' && (
            <select
              className="form-select"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
              style={{ width: 'auto', padding: '5px 12px', fontSize: '12px' }}
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right: Filters & Booking Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              className="form-select"
              value={filterClassroomId}
              onChange={(e) => setFilterClassroomId(e.target.value)}
              style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
            >
              <option value="ALL">All Classrooms</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} ({c.name})
                </option>
              ))}
            </select>

            <select
              className="form-select"
              value={filterFacultyId}
              onChange={(e) => setFilterFacultyId(e.target.value)}
              style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
            >
              <option value="ALL">All Faculty</option>
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.fullName}
                </option>
              ))}
            </select>

            <select
              className="form-select"
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value)}
              style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => onOpenScheduleModal()}
          >
            <Plus size={14} />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* View Mode: WEEKLY GRID */}
      {viewMode === 'weekly' && (
        <div className="timetable-grid-wrapper">
          <div className="timetable-grid">
            {/* Corner header */}
            <div className="timetable-header-cell" style={{ zIndex: 2 }}>
              Time
            </div>

            {/* Day Column Headers */}
            {displayDays.map((day) => (
              <div key={day.key} className="timetable-header-cell">
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {day.label}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {filteredSchedules.filter((s) => s.dayOfWeek === day.key).length} classes
                </span>
              </div>
            ))}

            {/* Time Slot Rows */}
            {TIME_SLOTS.map((time) => (
              <React.Fragment key={time}>
                <div className="timetable-time-cell">{time}</div>

                {displayDays.map((day) => {
                  // Find classes that start in this 1-hour interval [time, nextHour)
                  const slotHour = parseInt(time.split(':')[0], 10);
                  const matchingClasses = filteredSchedules.filter((s) => {
                    if (s.dayOfWeek !== day.key) return false;
                    const classHour = parseInt(s.startTime.split(':')[0], 10);
                    return classHour === slotHour;
                  });

                  return (
                    <div
                      key={`${day.key}-${time}`}
                      className="timetable-slot-cell"
                      onClick={(e) => {
                        // If empty slot clicked, offer booking at this day/time
                        if (e.target === e.currentTarget) {
                          onOpenScheduleModal(day.key, time);
                        }
                      }}
                      title={`Click to book on ${day.label} at ${time}`}
                    >
                      {matchingClasses.map((item) => (
                        <div
                          key={item.id}
                          className="class-event-card"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSchedule(item);
                          }}
                        >
                          <div className="class-event-title">
                            {item.subject.code} — {item.subject.name}
                          </div>
                          <div className="class-event-time font-mono">
                            <Clock size={11} />
                            <span>{item.startTime} – {item.endTime}</span>
                          </div>
                          <div className="class-event-meta">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Building2 size={11} />
                              <strong>{item.classroom.code}</strong>
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <User size={11} />
                              <span>{item.faculty.fullName.split(' ').pop()}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* View Mode: DAILY LIST */}
      {viewMode === 'daily' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Schedule for {selectedDay}</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {filteredSchedules.filter((s) => s.dayOfWeek === selectedDay).length} classes scheduled
              </span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenScheduleModal(selectedDay)}
            >
              <Plus size={14} />
              <span>Add Class on {selectedDay}</span>
            </button>
          </div>

          {filteredSchedules.filter((s) => s.dayOfWeek === selectedDay).length === 0 ? (
            <div className="empty-state">
              <CalendarIcon size={36} color="var(--text-muted)" />
              <div className="empty-state-title">No Classes on {selectedDay}</div>
              <p className="empty-state-text">
                There are no scheduled sessions for this day matching your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time Interval</th>
                    <th>Subject</th>
                    <th>Classroom & Location</th>
                    <th>Faculty Instructor</th>
                    <th>Attendance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules
                    .filter((s) => s.dayOfWeek === selectedDay)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => onSelectSchedule(s)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="font-mono">
                          <strong>{s.startTime}</strong> – {s.endTime}
                        </td>
                        <td>
                          <strong>{s.subject.code}</strong> {s.subject.name}
                        </td>
                        <td>
                          <span className="badge badge-blue">{s.classroom.code}</span>{' '}
                          <span style={{ color: 'var(--text-secondary)' }}>{s.classroom.building}</span>
                        </td>
                        <td>{s.faculty.fullName}</td>
                        <td>
                          {s.expectedStudents} students
                          {s.expectedStudents > s.classroom.capacity && (
                            <span className="badge badge-amber" style={{ marginLeft: '6px' }}>
                              Exceeds Cap
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSchedule(s);
                            }}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
