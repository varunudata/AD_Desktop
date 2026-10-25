import React, { useState } from 'react';
import { Classroom, RoomType } from '../../../shared/types/models';
import { ROOM_TYPES } from '../../../shared/constants/defaults';
import { Search, Plus, Edit3, Trash2, Building2, Check, X, ShieldAlert } from 'lucide-react';

interface ClassroomsPageProps {
  classrooms: Classroom[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (classroom: Classroom) => void;
  onRequestDelete: (classroom: Classroom) => void;
}

export const ClassroomsPage: React.FC<ClassroomsPageProps> = ({
  classrooms,
  onOpenCreateModal,
  onOpenEditModal,
  onRequestDelete,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'code' | 'capacity'>('code');

  const filteredClassrooms = classrooms
    .filter((c) => {
      if (typeFilter !== 'ALL' && c.roomType !== typeFilter) return false;
      if (statusFilter === 'ACTIVE' && !c.isActive) return false;
      if (statusFilter === 'INACTIVE' && c.isActive) return false;

      if (search.trim() !== '') {
        const q = search.toLowerCase();
        return (
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.building.toLowerCase().includes(q) ||
          c.equipment.some((eq) => eq.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'capacity') return b.capacity - a.capacity;
      return a.code.localeCompare(b.code);
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Toolbar */}
      <div className="table-header-toolbar card" style={{ padding: '14px 18px' }}>
        <div className="search-input-wrapper">
          <Search size={15} />
          <input
            className="search-input"
            placeholder="Search code, building, equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 10px', fontSize: '12px' }}
          >
            <option value="ALL">All Room Types</option>
            {ROOM_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
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
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'code' | 'capacity')}
            style={{ width: 'auto', padding: '6px 10px', fontSize: '12px' }}
          >
            <option value="code">Sort: Room Code</option>
            <option value="capacity">Sort: Capacity (High-Low)</option>
          </select>

          <button className="btn btn-primary btn-sm" onClick={onOpenCreateModal}>
            <Plus size={14} />
            <span>Add Classroom</span>
          </button>
        </div>
      </div>

      {/* Classrooms Table */}
      <div className="table-container">
        {filteredClassrooms.length === 0 ? (
          <div className="empty-state">
            <Building2 size={40} color="var(--text-muted)" />
            <div className="empty-state-title">No Classrooms Found</div>
            <p className="empty-state-text">
              {search || typeFilter !== 'ALL'
                ? 'No rooms match your filter criteria. Try clearing search filters.'
                : 'No classroom inventory found in your PostgreSQL database.'}
            </p>
            <button className="btn btn-primary btn-sm" onClick={onOpenCreateModal} style={{ marginTop: '8px' }}>
              <Plus size={14} />
              <span>Create Classroom</span>
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name & Building</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Installed Equipment</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClassrooms.map((room) => (
                <tr key={room.id}>
                  <td>
                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-700)' }}>
                      {room.code}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{room.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{room.building}</div>
                  </td>
                  <td>
                    <span className="badge badge-muted">
                      {room.roomType.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <strong>{room.capacity}</strong> seats
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '320px' }}>
                      {room.equipment && room.equipment.length > 0 ? (
                        room.equipment.slice(0, 3).map((eq) => (
                          <span key={eq} className="badge badge-blue" style={{ fontSize: '10px' }}>
                            {eq}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>None specified</span>
                      )}
                      {room.equipment && room.equipment.length > 3 && (
                        <span className="badge badge-muted" style={{ fontSize: '10px' }}>
                          +{room.equipment.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {room.isActive ? (
                      <span className="badge badge-green">Active</span>
                    ) : (
                      <span className="badge badge-amber">Inactive</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn-icon"
                        onClick={() => onOpenEditModal(room)}
                        title="Edit classroom"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        className="btn-icon"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => onRequestDelete(room)}
                        title="Delete classroom"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
