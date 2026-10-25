import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Faculty } from '../../../../shared/types/models';
import { CreateFacultyInput } from '../../../../shared/types/api';
import { useToast } from '../../components/ui/Toast';

interface FacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  facultyToEdit?: Faculty | null;
  onSuccess: () => void;
}

const DEPARTMENTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Humanities & Social Sciences',
  'Chemistry',
];

export const FacultyModal: React.FC<FacultyModalProps> = ({
  isOpen,
  onClose,
  facultyToEdit,
  onSuccess,
}) => {
  const toast = useToast();
  const isEditing = Boolean(facultyToEdit);

  const [fullName, setFullName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [customDepartment, setCustomDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (facultyToEdit) {
      setFullName(facultyToEdit.fullName);
      setEmployeeCode(facultyToEdit.employeeCode || '');
      if (DEPARTMENTS.includes(facultyToEdit.department)) {
        setDepartment(facultyToEdit.department);
        setCustomDepartment('');
      } else {
        setDepartment('Other');
        setCustomDepartment(facultyToEdit.department);
      }
      setEmail(facultyToEdit.email || '');
      setPhone(facultyToEdit.phone || '');
      setDesignation(facultyToEdit.designation || 'Assistant Professor');
      setIsActive(facultyToEdit.isActive);
    } else {
      setFullName('');
      setEmployeeCode('');
      setDepartment('Computer Science');
      setCustomDepartment('');
      setEmail('');
      setPhone('');
      setDesignation('Assistant Professor');
      setIsActive(true);
    }
    setErrorMsg(null);
  }, [facultyToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const finalDept = department === 'Other' ? customDepartment.trim() : department;
    if (!fullName.trim() || !finalDept) {
      setErrorMsg('Full name and department are required.');
      return;
    }

    setSubmitting(true);
    const payload: CreateFacultyInput = {
      fullName: fullName.trim(),
      employeeCode: employeeCode.trim() || null,
      department: finalDept,
      email: email.trim() || null,
      phone: phone.trim() || null,
      designation: designation.trim() || null,
      isActive,
    };

    try {
      if (!window.classflowAPI?.faculty) {
        setErrorMsg('ClassFlow desktop bridge is not ready. Please restart the application.');
        return;
      }
      if (isEditing && facultyToEdit) {
        const res = await window.classflowAPI.faculty.update(facultyToEdit.id, payload);
        if (res.success) {
          toast.success(`Faculty member ${res.data.fullName} updated.`);
          onSuccess();
          onClose();
        } else {
          setErrorMsg(res.error.message);
        }
      } else {
        const res = await window.classflowAPI.faculty.create(payload);
        if (res.success) {
          toast.success(`Faculty member ${res.data.fullName} added.`);
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
      title={isEditing ? `Edit Faculty: ${facultyToEdit?.fullName}` : 'Add Faculty Member'}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Faculty'}
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
            <label className="form-label" htmlFor="faculty-name">Full Name *</label>
            <input
              id="faculty-name"
              className="form-input"
              placeholder="e.g. Dr. Alan Turing"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="faculty-code">Employee Code</label>
            <input
              id="faculty-code"
              className="form-input"
              placeholder="e.g. FAC-CS-01"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="faculty-dept">Department *</label>
            <select
              id="faculty-dept"
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              <option value="Other">Other Department...</option>
            </select>
          </div>

          {department === 'Other' && (
            <div className="form-group">
              <label className="form-label" htmlFor="faculty-custom-dept">Specify Department *</label>
              <input
                id="faculty-custom-dept"
                className="form-input"
                placeholder="Enter department name"
                value={customDepartment}
                onChange={(e) => setCustomDepartment(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="faculty-designation">Designation</label>
            <input
              id="faculty-designation"
              className="form-input"
              placeholder="e.g. Professor & Chair, Lecturer"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="faculty-email">Institutional Email</label>
            <input
              id="faculty-email"
              type="email"
              className="form-input"
              placeholder="e.g. a.turing@apex.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="faculty-phone">Office / Contact Phone</label>
            <input
              id="faculty-phone"
              className="form-input"
              placeholder="e.g. +1 (555) 234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <input
            type="checkbox"
            id="faculty-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <label htmlFor="faculty-active" style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
            Faculty member is active and available for teaching assignments
          </label>
        </div>
      </form>
    </Modal>
  );
};
