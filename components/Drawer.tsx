'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type DrawerProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;       // panel width in px (default 520)
  side?: 'right'|'left';
};

export default function Drawer({
  open,
  title = 'Details',
  onClose,
  children,
  width = 520,
  side = 'right',
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [show, setShow] = useState(false); // for enter/exit animation
  const backdropRef = useRef<HTMLDivElement>(null);

  // mount portal host
  useEffect(() => {
    setMounted(true);
    if (typeof document === 'undefined') return;
    let el = document.getElementById('__modal-root') as HTMLElement | null;
    if (!el) {
      el = document.createElement('div');
      el.id = '__modal-root';
      document.body.appendChild(el);
    }
    setHost(el);
  }, []);

  // animate open/close
  useEffect(() => {
    if (!open) { setShow(false); return; }
    // wait a tick so CSS transition can run
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  // esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted || !host || !open) return null;

  const panelStyle: React.CSSProperties = {
    width,
    transform: show ? 'translateX(0)' : (side === 'right' ? 'translateX(100%)' : 'translateX(-100%)'),
    transition: 'transform 280ms ease',
    willChange: 'transform',
    background: 'var(--panel)',
    borderLeft: side === 'right' ? '1px solid #1f2937' : undefined,
    borderRight: side === 'left' ? '1px solid #1f2937' : undefined,
    position: 'fixed',
    top: 0,
    bottom: 0,
    [side]: 0,
    zIndex: 10001,
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties;

  const headerStyle: React.CSSProperties = {
    borderBottom: '1px solid #1f2937',
    background: '#0b1220',
    padding: '10px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const bodyStyle: React.CSSProperties = {
    padding: 12,
    overflow: 'auto',
    flex: 1,
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        role="presentation"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          opacity: show ? 1 : 0,
          transition: 'opacity 280ms ease',
          zIndex: 10000,
        }}
      />
      {/* Panel */}
      <div role="dialog" aria-modal="true" aria-label={title} style={panelStyle}>
        <div style={headerStyle}>
          <div className="acc-title">{title}</div>
          <button className="ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div style={bodyStyle}>{children}</div>
      </div>
    </>,
    host
  );
}