import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Subject } from '../../../../shared/types/models';
import { CreateSubjectInput } from '../../../../shared/types/api';
import { COMMON_EQUIPMENT } from '../../../../shared/constants/defaults';
import { useToast } from '../../components/ui/Toast';
import { Plus, X } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectToEdit?: Subject | null;
  onSuccess: () => void;
}

const DEPARTMENTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Humanities & Social Sciences',
];

const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  subjectToEdit,
  onSuccess,
}) => {
  const toast = useToast();
  const isEditing = Boolean(subjectToEdit);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState('Semester 1');
  const [defaultExpectedStudents, setDefaultExpectedStudents] = useState<number | string>(40);
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);
  const [newEqInput, setNewEqInput] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (subjectToEdit) {
      setCode(subjectToEdit.code);
      setName(subjectToEdit.name);
      setDepartment(subjectToEdit.department);
      setSemester(subjectToEdit.semester || 'Semester 1');
      setDefaultExpectedStudents(subjectToEdit.defaultExpectedStudents || 40);
      setRequiredEquipment(subjectToEdit.requiredEquipment || []);
      setIsActive(subjectToEdit.isActive);
    } else {
      setCode('');
      setName('');
      setDepartment('Computer Science');
      setSemester('Semester 1');
      setDefaultExpectedStudents(40);
      setRequiredEquipment([]);
      setIsActive(true);
    }
    setErrorMsg(null);
  }, [subjectToEdit, isOpen]);

  const handleAddEquipment = (itemToAdd?: string) => {
    const item = (itemToAdd || newEqInput).trim();
    if (!item) return;
    if (!requiredEquipment.includes(item)) {
      setRequiredEquipment([...requiredEquipment, item]);
    }
    setNewEqInput('');
  };

  const handleRemoveEquipment = (itemToRemove: string) => {
    setRequiredEquipment(requiredEquipment.filter((e) => e !== itemToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!code.trim() || !name.trim() || !department.trim()) {
      setErrorMsg('Code, name, and department are required.');
      return;
    }

    setSubmitting(true);
    const payload: CreateSubjectInput = {
      code: code.trim(),
      name: name.trim(),
      department: department.trim(),
      semester: semester || null,
      defaultExpectedStudents: defaultExpectedStudents ? Number(defaultExpectedStudents) : null,
      requiredEquipment,
      isActive,
    };

    try {
      if (!window.classflowAPI?.subjects) {
        setErrorMsg('ClassFlow desktop bridge is not ready. Please restart the application.');
        return;
      }
      if (isEditing && subjectToEdit) {
        const res = await window.classflowAPI.subjects.update(subjectToEdit.id, payload);
        if (res.success) {
          toast.success(`Subject ${res.data.code} updated successfully.`);
          onSuccess();
          onClose();
        } else {
          setErrorMsg(res.error.message);
        }
      } else {
        const res = await window.classflowAPI.subjects.create(payload);
        if (res.success) {
          toast.success(`Subject ${res.data.code} created successfully.`);
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
      title={isEditing ? `Edit Subject: ${subjectToEdit?.code}` : 'Add Academic Subject'}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Subject'}
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
            <label className="form-label" htmlFor="subject-code">Subject Code *</label>
            <input
              id="subject-code"
              className="form-input"
              placeholder="e.g. CS-301, MATH-102"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="subject-dept">Department *</label>
            <select
              id="subject-dept"
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="subject-name">Subject Name *</label>
          <input
            id="subject-name"
            className="form-input"
            placeholder="e.g. Database Management Systems"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="subject-sem">Academic Term / Semester</label>
            <select
              id="subject-sem"
              className="form-select"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="subject-size">Default Expected Class Size</label>
            <input
              id="subject-size"
              type="number"
              min="1"
              max="500"
              className="form-input"
              value={defaultExpectedStudents}
              onChange={(e) => setDefaultExpectedStudents(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Required Room Equipment</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="form-input"
              placeholder="Equipment requirement (e.g. Ceiling Projector, Workstations)"
              value={newEqInput}
              onChange={(e) => setNewEqInput(e.target.value)}
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {COMMON_EQUIPMENT.slice(0, 4).map((item) => (
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

          {requiredEquipment.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {requiredEquipment.map((eq) => (
                <span key={eq} className="badge badge-cyan">
                  {eq}
                  <button
                    type="button"
                    onClick={() => handleRemoveEquipment(eq)}
                    style={{ marginLeft: '4px', color: 'inherit' }}
                    aria-label={`Remove requirement ${eq}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <input
            type="checkbox"
            id="subject-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <label htmlFor="subject-active" style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
            Subject is actively offered this term
          </label>
        </div>
      </form>
    </Modal>
  );
};
