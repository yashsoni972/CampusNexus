import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary', className = '', fullPage = false }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-[3px]', xl: 'w-16 h-16 border-4' };
  const sizeClass = sizes[size] || sizes.md;
  const colorClass = color === 'white'
    ? 'border-white/30 border-t-white'
    : 'border-indigo-100 border-t-indigo-600';

  const spinner = (
    <div className={`${sizeClass} rounded-full animate-spin ${colorClass} ${className}`} role="status" aria-label="Loading" />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #ecfdf5 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg animate-pulse-glow">
            <div className="w-8 h-8 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-sm font-semibold text-gray-500">Loading CampusNexus...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[380px]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
        <div className="w-6 h-6 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
      </div>
      <p className="text-sm font-semibold text-gray-400">Loading...</p>
    </div>
  </div>
);

export default LoadingSpinner;
