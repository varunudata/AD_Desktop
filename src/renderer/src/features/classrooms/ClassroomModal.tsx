import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Classroom, RoomType } from '../../../../shared/types/models';
import { CreateClassroomInput } from '../../../../shared/types/api';
import { ROOM_TYPES, COMMON_EQUIPMENT } from '../../../../shared/constants/defaults';
import { useToast } from '../../components/ui/Toast';
import { Plus, X } from 'lucide-react';

interface ClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroomToEdit?: Classroom | null;
  onSuccess: () => void;
}

export const ClassroomModal: React.FC<ClassroomModalProps> = ({
  isOpen,
  onClose,
  classroomToEdit,
  onSuccess,
}) => {
  const toast = useToast();
  const isEditing = Boolean(classroomToEdit);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [building, setBuilding] = useState('');
  const [capacity, setCapacity] = useState<number | string>(40);
  const [roomType, setRoomType] = useState<RoomType>('CLASSROOM');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [newEquipmentItem, setNewEquipmentItem] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (classroomToEdit) {
      setCode(classroomToEdit.code);
      setName(classroomToEdit.name);
      setBuilding(classroomToEdit.building);
      setCapacity(classroomToEdit.capacity);
      setRoomType(classroomToEdit.roomType as RoomType);
      setEquipment(classroomToEdit.equipment || []);
      setIsActive(classroomToEdit.isActive);
      setNotes(classroomToEdit.notes || '');
    } else {
      setCode('');
      setName('');
      setBuilding('');
      setCapacity(40);
      setRoomType('CLASSROOM');
      setEquipment([]);
      setIsActive(true);
      setNotes('');
    }
    setErrorMsg(null);
  }, [classroomToEdit, isOpen]);

  const handleAddEquipment = (itemToAdd?: string) => {
    const item = (itemToAdd || newEquipmentItem).trim();
    if (!item) return;
    if (!equipment.includes(item)) {
      setEquipment([...equipment, item]);
    }
    setNewEquipmentItem('');
  };

  const handleRemoveEquipment = (itemToRemove: string) => {
    setEquipment(equipment.filter((e) => e !== itemToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!code.trim() || !name.trim() || !building.trim()) {
      setErrorMsg('Code, name, and building are required.');
      return;
    }

    const numCapacity = Number(capacity);
    if (!numCapacity || numCapacity <= 0) {
      setErrorMsg('Capacity must be a positive integer.');
      return;
    }

    setSubmitting(true);
    const payload: CreateClassroomInput = {
      code: code.trim(),
      name: name.trim(),
      building: building.trim(),
      capacity: numCapacity,
      roomType,
      equipment,
      isActive,
      notes: notes.trim() || null,
    };

    try {
      if (!window.classflowAPI?.classrooms) {
        setErrorMsg('ClassFlow desktop bridge is not ready. Please restart the application.');
        return;
      }
      if (isEditing && classroomToEdit) {
        const res = await window.classflowAPI.classrooms.update(classroomToEdit.id, payload);
        if (res.success) {
          toast.success(`Classroom ${res.data.code} updated successfully.`);
          onSuccess();
          onClose();
        } else {
          setErrorMsg(res.error.message);
        }
      } else {
        const res = await window.classflowAPI.classrooms.create(payload);
        if (res.success) {
          toast.success(`Classroom ${res.data.code} created successfully.`);
          onSuccess();
          onClose();
        } else {
          setErrorMsg(res.error.message);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Classroom: ${classroomToEdit?.code}` : 'Add New Classroom'}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Classroom'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {errorMsg}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="room-code">Room Code *</label>
            <input
              id="room-code"
              className="form-input"
              placeholder="e.g. LH-101, LAB-2"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="room-type">Room Type *</label>
            <select
              id="room-type"
              className="form-select"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as RoomType)}
            >
              {ROOM_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="room-name">Classroom Name *</label>
          <input
            id="room-name"
            className="form-input"
            placeholder="e.g. Turing Lecture Hall, Systems Lab"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="room-building">Building / Wing *</label>
            <input
              id="room-building"
              className="form-input"
              placeholder="e.g. Main Academic Wing"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="room-capacity">Seating Capacity *</label>
            <input
              id="room-capacity"
              type="number"
              min="1"
              max="1000"
              className="form-input"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Installed Equipment</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="form-input"
              placeholder="Add equipment (e.g. Smartboard, 40 Desktops)"
              value={newEquipmentItem}
              onChange={(e) => setNewEquipmentItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddEquipment();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleAddEquipment()}
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>

          {/* Quick Suggestions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {COMMON_EQUIPMENT.slice(0, 5).map((item) => (
              <button
                key={item}
                type="button"
                className="badge badge-muted"
                onClick={() => handleAddEquipment(item)}
                style={{ cursor: 'pointer' }}
              >
                + {item}
              </button>
            ))}
          </div>

          {/* Active Equipment Chips */}
          {equipment.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {equipment.map((eq) => (
                <span key={eq} className="badge badge-blue">
                  {eq}
                  <button
                    type="button"
                    onClick={() => handleRemoveEquipment(eq)}
                    style={{ marginLeft: '4px', color: 'inherit' }}
                    aria-label={`Remove ${eq}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="room-notes">Notes / Location Details</label>
          <textarea
            id="room-notes"
            className="form-textarea"
            rows={2}
            placeholder="Accessibility ramps, projector model, key checkout info..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <input
            type="checkbox"
            id="room-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <label htmlFor="room-active" style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
            Classroom is active and available for scheduling
          </label>
        </div>
      </form>
    </Modal>
  );
};
