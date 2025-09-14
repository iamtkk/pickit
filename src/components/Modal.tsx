import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Modal panel */}
        <div className="relative bg-white rounded-lg shadow-xl transform transition-all max-w-lg w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;