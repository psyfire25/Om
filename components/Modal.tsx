'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string; // e.g. "max-w-2xl"
};

export default function Modal({
  open,
  title = 'Details',
  onClose,
  children,
  widthClass = 'max-w-2xl',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const openedRef = useRef(false);

  // establish portal host on mount (client-only)
  useEffect(() => {
    setMounted(true);
    if (typeof document === 'undefined') return;

    let el = document.getElementById('__modal-root') as HTMLElement | null;
    if (!el) {
      el = document.createElement('div');
      el.id = '__modal-root';
      document.body.appendChild(el);
      console.debug('[Modal] created __modal-root');
    } else {
      console.debug('[Modal] reusing __modal-root');
    }
    setHost(el);
  }, []);

  useEffect(() => {
    if (open && !openedRef.current) {
      console.debug('[Modal] opening');
      openedRef.current = true;
    } else if (!open && openedRef.current) {
      console.debug('[Modal] closing');
      openedRef.current = false;
    }
  }, [open]);

  // escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const target = host ?? (typeof document !== 'undefined' ? document.body : null);
  if (!target) return null;

  const backdrop = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div className={`w-full ${widthClass}`} style={{ outline: 'none' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="acc-head" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="acc-title">{title}</div>
            <button className="ghost" onClick={onClose} aria-label="Close">✕</button>
          </div>
          <div className="acc-body">{children}</div>
        </div>
      </div>
    </div>
  );

  return createPortal(backdrop, target);
}