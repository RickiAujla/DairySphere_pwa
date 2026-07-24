import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 py-3.5 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-slate-400">DairySphere ERP</span>
        <span>&bull;</span>
        <span>Version 1.0.0-PROD</span>
        <span>&bull;</span>
        <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
          Enterprise PWA
        </span>
      </div>

      <div className="flex items-center space-x-4 text-[11px]">
        <span>&copy; {new Date().getFullYear()} DairySphere Technologies. All rights reserved.</span>
      </div>
    </footer>
  );
};
