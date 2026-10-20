import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ setActiveTab }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please provide your Email/National ID and Password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(identifier, password);
      if (res.user.role === 'admin') {
        setActiveTab('admin-dashboard');
      } else {
        setActiveTab('citizen-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    setError('');
    if (type === 'admin') {
      setIdentifier('admin@ecitizen.go.ke');
      setPassword('Admin@12345');
    } else {
      setIdentifier('citizen@ecitizen.go.ke');
      setPassword('Citizen@12345');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center mx-auto mb-3 shadow-md border-2 border-emerald-700">
            <span className="font-black text-emerald-950 text-lg">eC</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Sign In to eCitizen</h2>
          <p className="text-xs text-emerald-200 mt-1">
            Access your public service tickets and civic requests
          </p>
        </div>

        {/* Demo Fast Credential Chips */}
        <div className="bg-emerald-50/70 p-3.5 border-b border-emerald-100">
          <p className="text-[11px] font-bold text-emerald-900 text-center uppercase tracking-wider mb-2">
            Quick Fill Demo Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('citizen')}
              className="text-xs bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 py-1.5 px-2 rounded-xl transition-colors font-medium flex items-center justify-center gap-1.5 shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Angela (Citizen)</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="text-xs bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 py-1.5 px-2 rounded-xl transition-colors font-medium flex items-center justify-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Desk</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email or National ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. citizen@ecitizen.go.ke or 34567890"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have an eCitizen account?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="font-bold text-emerald-700 hover:underline"
              >
                Register Citizen Profile
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
