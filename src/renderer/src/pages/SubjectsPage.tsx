import React, { useState } from 'react';
import { Subject, ScheduleWithRelations } from '../../../shared/types/models';
import { Search, Plus, Edit3, Trash2, BookOpen, Layers } from 'lucide-react';

interface SubjectsPageProps {
  subjects: Subject[];
  schedules: ScheduleWithRelations[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (subject: Subject) => void;
  onRequestDelete: (subject: Subject) => void;
}

export const SubjectsPage: React.FC<SubjectsPageProps> = ({
  subjects,
  schedules,
  onOpenCreateModal,
  onOpenEditModal,
  onRequestDelete,
}) => {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');

  const departments = Array.from(new Set(subjects.map((s) => s.department))).sort();
  const semesters = Array.from(
    new Set(subjects.map((s) => s.semester).filter((s): s is string => Boolean(s)))
  ).sort();

  const filteredSubjects = subjects.filter((sub) => {
    if (departmentFilter !== 'ALL' && sub.department !== departmentFilter) return false;
    if (semesterFilter !== 'ALL' && sub.semester !== semesterFilter) return false;

    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        sub.code.toLowerCase().includes(q) ||
        sub.name.toLowerCase().includes(q) ||
        sub.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Toolbar */}
      <div className="table-header-toolbar card" style={{ padding: '14px 18px' }}>
        <div className="search-input-wrapper">
          <Search size={15} />
          <input
            className="search-input"
            placeholder="Search subject code, name, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 10px', fontSize: '12px' }}
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 10px', fontSize: '12px' }}
          >
            <option value="ALL">All Semesters</option>
            {semesters.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button className="btn btn-primary btn-sm" onClick={onOpenCreateModal}>
            <Plus size={14} />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="table-container">
        {filteredSubjects.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={40} color="var(--text-muted)" />
            <div className="empty-state-title">No Subjects Found</div>
            <p className="empty-state-text">
              {search || departmentFilter !== 'ALL'
                ? 'No subjects match your filter selections.'
                : 'No course catalog records found in your PostgreSQL database.'}
            </p>
            <button className="btn btn-primary btn-sm" onClick={onOpenCreateModal} style={{ marginTop: '8px' }}>
              <Plus size={14} />
              <span>Create First Subject</span>
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Typical Class Size</th>
                <th>Required Equipment</th>
                <th>Active Bookings</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((sub) => {
                const assignedSchedules = schedules.filter((s) => s.subjectId === sub.id);

                return (
                  <tr key={sub.id}>
                    <td>
                      <span className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-700)' }}>
                        {sub.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sub.name}</div>
                    </td>
                    <td>
                      <span className="badge badge-muted">{sub.department}</span>
                    </td>
                    <td>{sub.semester || '—'}</td>
                    <td>{sub.defaultExpectedStudents ? `${sub.defaultExpectedStudents} students` : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '280px' }}>
                        {sub.requiredEquipment && sub.requiredEquipment.length > 0 ? (
                          sub.requiredEquipment.map((eq) => (
                            <span key={eq} className="badge badge-cyan" style={{ fontSize: '10px' }}>
                              {eq}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Standard room</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue">
                        {assignedSchedules.length} session(s)
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn-icon"
                          onClick={() => onOpenEditModal(sub)}
                          title="Edit subject"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => onRequestDelete(sub)}
                          title="Delete subject"
                        >
                          <Trash2 size={15} />
                        </button>
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
  );
};
