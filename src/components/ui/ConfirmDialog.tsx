import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Confirmation"
      maxWidth="300px"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Annuler</Button>
          <Button variant="danger" onClick={onConfirm}>Confirmer</Button>
        </>
      }
    >
      <p style={{ color: '#cbd5e1' }}>{message}</p>
    </Modal>
  );
}
