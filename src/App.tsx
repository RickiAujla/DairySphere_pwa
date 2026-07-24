import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './pages/errors/ErrorBoundary';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { NotFoundPage } from './pages/errors/NotFoundPage';
import { ForbiddenPage } from './pages/errors/ForbiddenPage';

// Lazy loading core ERP modules for code splitting and optimal bundle size
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const FarmersPage = lazy(() => import('./pages/FarmersPage'));
const MilkCollectionPage = lazy(() => import('./pages/MilkCollectionPage'));
const MilkSalesPage = lazy(() => import('./pages/MilkSalesPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const FinancialPage = lazy(() => import('./pages/FinancialPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

interface AppRoutesProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ currentPath, onNavigate }) => {
  const { isAuthenticated, isLoading, user, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Initializing DairySphere ERP Security Session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => onNavigate('/dashboard')} />;
  }

  // Permission-aware module router
  const renderModuleView = () => {
    switch (currentPath) {
      case '/':
      case '/dashboard':
        return <DashboardPage />;

      case '/farmers':
        if (!hasPermission('farmers:view')) return <ForbiddenPage onNavigate={onNavigate} />;
        return <FarmersPage />;

      case '/milk-collection':
        if (!hasPermission('milk:collection:view')) return <ForbiddenPage onNavigate={onNavigate} />;
        return <MilkCollectionPage />;

      case '/milk-sales':
        if (!hasPermission('milk:sales:view')) return <ForbiddenPage onNavigate={onNavigate} />;
        return <MilkSalesPage />;

      case '/customers':
        if (!hasPermission('customers:view')) return <ForbiddenPage onNavigate={onNavigate} />;
        return <CustomersPage />;

      case '/products':
        if (!hasPermission('products:view')) return <ForbiddenPage onNavigate={onNavigate} />;
        return <ProductsPage />;

      case '/inventory':
        if (!hasPermission('inventory:view')) return <ForbiddenPage onNavigate={onNavigate} />;
        return <InventoryPage />;

      case '/financial':
        if (!hasPermission('financial:view')) return <ForbiddenPage onNavigate={onNavigate} />;
        return <FinancialPage />;

      case '/reports':
        if (!hasPermission('reports:view')) return <ForbiddenPage onNavigate={onNavigate} />;
        return <ReportsPage />;

      case '/settings':
        return <SettingsPage />;

      default:
        return <NotFoundPage onNavigate={onNavigate} />;
    }
  };

  const getPageTitleAndSubtitle = () => {
    switch (currentPath) {
      case '/':
      case '/dashboard':
        return {
          title: 'Executive Operations Dashboard',
          subtitle: 'Real-time milk procurement, daily payouts, and active branch statistics',
        };
      case '/farmers':
        return {
          title: 'Farmers & Suppliers Directory',
          subtitle: 'Register cooperative farmers, bank details, and payment ledgers',
        };
      case '/milk-collection':
        return {
          title: 'Milk Collection Register',
          subtitle: 'Shift-wise milk intake logging with automated Fat % and SNF % testing',
        };
      case '/milk-sales':
        return {
          title: 'Milk Sales & Commercial POS',
          subtitle: 'Retail dispatches, wholesale buyer accounts, and payment tracking',
        };
      case '/customers':
        return {
          title: 'Customer Directory',
          subtitle: 'Commercial buyers, sweet shops, and institutional clients',
        };
      case '/products':
        return {
          title: 'Products Catalogue',
          subtitle: 'Value-added processed dairy items, packaging, and rate master',
        };
      case '/inventory':
        return {
          title: 'Warehouse Inventory',
          subtitle: 'Stock balances, reorder points, and cold-storage tracking',
        };
      case '/financial':
        return {
          title: 'Financial Ledger & Payouts',
          subtitle: 'Automated farmer payout calculations and journal entries',
        };
      case '/reports':
        return {
          title: 'Reporting & Analytics',
          subtitle: 'Consolidated reporting on procurement, revenue, and inventory',
        };
      case '/settings':
        return {
          title: 'ERP System Settings',
          subtitle: 'Manage user profiles, theme preferences, and security options',
        };
      default:
        return { title: 'DairySphere ERP', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageTitleAndSubtitle();

  return (
    <MainLayout
      currentPath={currentPath}
      onNavigate={onNavigate}
      pageTitle={title}
      pageSubtitle={subtitle}
    >
      <Suspense fallback={<LoadingSpinner size="md" message="Loading module workspace..." />}>
        {renderModuleView()}
      </Suspense>
    </MainLayout>
  );
};

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname || '/dashboard'
  );

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes currentPath={currentPath} onNavigate={handleNavigate} />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
