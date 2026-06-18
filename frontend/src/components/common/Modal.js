import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm:'max-w-sm', md:'max-w-md', lg:'max-w-lg', xl:'max-w-2xl', '2xl':'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 animate-fade-in"
        style={{ background:'rgba(0,0,0,0.35)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`relative w-full ${sizes[size]} animate-scale-in max-h-[90vh] flex flex-col rounded-3xl overflow-hidden`}
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
          <h2 className="text-base font-bold text-[#1c1c1e] tracking-tight">{title}</h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-black/6 active:bg-black/10"
            style={{ color:'rgba(60,60,67,0.5)' }}>
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
