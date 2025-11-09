'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string; // e.g. "max-w-2xl"
};

export default function Modal({ open, title, onClose, children, widthClass = 'max-w-2xl' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        // backdrop click
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div
        ref={dialogRef}
        className={`w-full ${widthClass}`}
        style={{ outline: 'none' }}
      >
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="acc-head" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="acc-title">{title || 'Details'}</div>
            <button className="ghost" onClick={onClose} aria-label="Close">✕</button>
          </div>
          <div className="acc-body">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}