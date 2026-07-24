import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { Breadcrumb } from './Breadcrumb';
import { Footer } from './Footer';
import { SearchBox } from '../shared/SearchBox';
import { Modal } from '../shared/Modal';
import { Search } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  pageTitle?: string;
  pageSubtitle?: string;
  pageActions?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  pageTitle,
  pageSubtitle,
  pageActions,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Shortcut key listeners for CMD+K / CTRL+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col md:flex-row antialiased selection:bg-sky-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Right Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden min-h-screen">
        {/* Top Header */}
        <TopHeader
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        />

        {/* Content Area Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col space-y-6">
          {/* Breadcrumb & Header Title Bar */}
          <div className="space-y-3">
            <Breadcrumb currentPath={currentPath} onNavigate={onNavigate} />

            {(pageTitle || pageActions) && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
                <div>
                  {pageTitle && (
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                      {pageTitle}
                    </h1>
                  )}
                  {pageSubtitle && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pageSubtitle}</p>
                  )}
                </div>
                {pageActions && <div className="flex items-center space-x-3 shrink-0">{pageActions}</div>}
              </div>
            )}
          </div>

          {/* View Body Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Global Search Modal */}
      <Modal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <Search className="w-5 h-5 text-sky-400 shrink-0" />
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Type to search modules, records, farmers, customers..."
              className="max-w-none"
            />
          </div>

          <div className="text-xs text-slate-400 space-y-2 py-2">
            <p className="font-semibold text-slate-300">Quick Navigation Shortcuts:</p>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <button
                onClick={() => {
                  onNavigate('/farmers');
                  setIsGlobalSearchOpen(false);
                }}
                className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-left hover:border-sky-500 hover:text-sky-400 transition-colors"
              >
                Go to Farmers Directory
              </button>
              <button
                onClick={() => {
                  onNavigate('/milk-collection');
                  setIsGlobalSearchOpen(false);
                }}
                className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-left hover:border-sky-500 hover:text-sky-400 transition-colors"
              >
                Go to Milk Collection Register
              </button>
              <button
                onClick={() => {
                  onNavigate('/milk-sales');
                  setIsGlobalSearchOpen(false);
                }}
                className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-left hover:border-sky-500 hover:text-sky-400 transition-colors"
              >
                Go to Milk Sales & POS
              </button>
              <button
                onClick={() => {
                  onNavigate('/reports');
                  setIsGlobalSearchOpen(false);
                }}
                className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-left hover:border-sky-500 hover:text-sky-400 transition-colors"
              >
                Go to Reports & Analytics
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
