'use client';
import { ReactNode, useEffect } from 'react';
import { Toaster, toast } from 'sonner'; // optional, nice notification lib

export default function ClientShell({ children }: { children: ReactNode }) {
  // Set up global modal root if needed
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!document.getElementById('__modal-root')) {
      const el = document.createElement('div');
      el.id = '__modal-root';
      document.body.appendChild(el);
    }
  }, []);

  // Example: you can push global toast here after login, save, etc.
  useEffect(() => {
    console.log('Client shell mounted – modals + notifications ready.');
  }, []);

  return (
    <>
      {children}
      {/* global notification layer */}
      <Toaster richColors position="top-center" />
      {/* global modal root is created dynamically */}
    </>
  );
}