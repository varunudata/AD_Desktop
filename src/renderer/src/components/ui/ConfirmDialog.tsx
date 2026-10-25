import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        {isDestructive && (
          <div
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={20} />
          </div>
        )}
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</p>
      </div>
    </Modal>
  );
};
