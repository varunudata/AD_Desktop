import React, { useState } from 'react';
import { Faculty, ScheduleWithRelations } from '../../../shared/types/models';
import { Search, Plus, Edit3, Trash2, Calendar, Mail, Phone, Users } from 'lucide-react';

interface FacultyPageProps {
  facultyList: Faculty[];
  schedules: ScheduleWithRelations[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (faculty: Faculty) => void;
  onRequestDelete: (faculty: Faculty) => void;
  onViewSchedule: (faculty: Faculty) => void;
}

export const FacultyPage: React.FC<FacultyPageProps> = ({
  facultyList,
  schedules,
  onOpenCreateModal,
  onOpenEditModal,
  onRequestDelete,
  onViewSchedule,
}) => {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Unique departments for filter dropdown
  const departments = Array.from(new Set(facultyList.map((f) => f.department))).sort();

  const filteredFaculty = facultyList.filter((f) => {
    if (departmentFilter !== 'ALL' && f.department !== departmentFilter) return false;
    if (statusFilter === 'ACTIVE' && !f.isActive) return false;
    if (statusFilter === 'INACTIVE' && f.isActive) return false;

    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        f.fullName.toLowerCase().includes(q) ||
        (f.employeeCode && f.employeeCode.toLowerCase().includes(q)) ||
        f.department.toLowerCase().includes(q) ||
        (f.email && f.email.toLowerCase().includes(q))
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
            placeholder="Search faculty name, code, department..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 10px', fontSize: '12px' }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Staff</option>
            <option value="INACTIVE">Inactive Staff</option>
          </select>

          <button className="btn btn-primary btn-sm" onClick={onOpenCreateModal}>
            <Plus size={14} />
            <span>Add Faculty</span>
          </button>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="table-container">
        {filteredFaculty.length === 0 ? (
          <div className="empty-state">
            <Users size={40} color="var(--text-muted)" />
            <div className="empty-state-title">No Faculty Members Found</div>
            <p className="empty-state-text">
              {search || departmentFilter !== 'ALL'
                ? 'No staff members match your filter criteria.'
                : 'No faculty records currently exist in your PostgreSQL database.'}
            </p>
            <button className="btn btn-primary btn-sm" onClick={onOpenCreateModal} style={{ marginTop: '8px' }}>
              <Plus size={14} />
              <span>Add Faculty Member</span>
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Employee Code</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Teaching Load</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.map((f) => {
                const assignedSchedules = schedules.filter((s) => s.facultyId === f.id);

                return (
                  <tr key={f.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{f.fullName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {f.designation || 'Faculty Instructor'}
                      </div>
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontSize: '12px' }}>
                        {f.employeeCode || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-muted">{f.department}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                        {f.email ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} color="var(--text-muted)" />
                            <span>{f.email}</span>
                          </span>
                        ) : null}
                        {f.phone ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                            <Phone size={12} />
                            <span>{f.phone}</span>
                          </span>
                        ) : null}
                        {!f.email && !f.phone && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="badge badge-blue"
                        onClick={() => onViewSchedule(f)}
                        style={{ cursor: 'pointer', padding: '4px 8px' }}
                        title="View weekly teaching timetable"
                      >
                        <Calendar size={12} />
                        <span>{assignedSchedules.length} classes / wk</span>
                      </button>
                    </td>
                    <td>
                      {f.isActive ? (
                        <span className="badge badge-green">Active</span>
                      ) : (
                        <span className="badge badge-amber">Inactive</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn-icon"
                          onClick={() => onViewSchedule(f)}
                          title="View weekly teaching timetable"
                        >
                          <Calendar size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => onOpenEditModal(f)}
                          title="Edit faculty member"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => onRequestDelete(f)}
                          title="Delete faculty member"
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
