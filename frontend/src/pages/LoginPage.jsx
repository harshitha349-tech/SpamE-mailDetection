import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage({ onNavigateRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('john.doe@emailmgmt.local');
  const [password, setPassword] = useState('User@1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-indigo-600 items-center justify-center shadow-xl shadow-indigo-500/30 mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Email Management Platform
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Integrated Relational Email Management &amp; Machine Learning Spam Detection
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-700">
          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex items-start gap-2.5 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="user@emailmgmt.local"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign in'}
            </button>
          </form>

          {/* Quick Demo Persona Pickers */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick Academic Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@emailmgmt.local', 'Admin@1234')}
                className="py-1.5 px-2.5 bg-slate-900/60 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-center font-medium transition-colors"
              >
                Admin (Faculty)
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('john.doe@emailmgmt.local', 'User@1234')}
                className="py-1.5 px-2.5 bg-slate-900/60 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-center font-medium transition-colors"
              >
                John Doe (Student)
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('alice.smith@emailmgmt.local', 'User@1234')}
                className="py-1.5 px-2.5 bg-slate-900/60 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-center font-medium transition-colors"
              >
                Alice Smith (Student)
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('bob.wilson@emailmgmt.local', 'User@1234')}
                className="py-1.5 px-2.5 bg-slate-900/60 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-center font-medium transition-colors"
              >
                Prof. Bob Wilson
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-400">Need a new account? </span>
            <button
              onClick={onNavigateRegister}
              className="font-medium text-indigo-400 hover:text-indigo-300 underline"
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
