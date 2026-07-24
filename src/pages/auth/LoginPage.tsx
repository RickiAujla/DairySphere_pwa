import React, { useState } from 'react';
import { Milk, Lock, Mail, Building, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FormWrapper } from '../../components/shared/FormWrapper';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();

  const [email, setEmail] = useState('admin@dairysphere.com');
  const [password, setPassword] = useState('Admin@123456');
  const [tenantCode, setTenantCode] = useState('MAIN');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await login({
        email,
        password,
        tenantCode: tenantCode || undefined,
      });
      showSuccess('Signed in successfully', 'Welcome back');
      onSuccess();
    } catch (err: any) {
      const msg = err?.message || 'Invalid email or password credentials.';
      setErrorMessage(msg);
      showError(msg, 'Authentication Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      {/* Background Subtle Gradient Spheres */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-400 mb-2">
            <Milk className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">DairySphere ERP</h1>
          <p className="text-xs text-slate-400">Enterprise Dairy & Cooperative Management Platform</p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-200 text-xs text-center font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <FormWrapper label="Tenant Organization Code">
            <div className="relative flex items-center">
              <Building className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={tenantCode}
                onChange={(e) => setTenantCode(e.target.value.toUpperCase())}
                placeholder="e.g. MAIN, COOP-01"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-sky-400 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </FormWrapper>

          <FormWrapper label="Work Email Address" required>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@dairysphere.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </FormWrapper>

          <FormWrapper label="Password" required>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </FormWrapper>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-sky-600/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit Encrypted JWT Session</span>
          </div>
          <span>PWA Ready</span>
        </div>
      </div>
    </div>
  );
};
