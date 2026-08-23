import FormModal from './FormModal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemName, isDeleting }) => {
  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef2f2', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <AlertTriangle size={24} />
        </div>
        <p style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: '500' }}>
          Are you sure you want to delete this {itemName}?
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          This action cannot be undone and will permanently remove the data.
        </p>
      </div>
      
      <div className="modal-footer" style={{ marginTop: '2rem' }}>
        <button type="button" className="btn btn-outline" onClick={onClose} disabled={isDeleting}>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </div>
    </FormModal>
  );
};

export default ConfirmDeleteModal;
