import React from 'react';

export default function NotificationBadge() {
  return (
    <div className="absolute top-4 right-4 z-20">
      <button className="relative p-2 bg-surface border border-border rounded-full hover:bg-surface-2 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#B83030] rounded-full border border-surface"></span>
      </button>
    </div>
  );
}
