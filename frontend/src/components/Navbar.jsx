import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCheck, ShieldCheck, Database, RefreshCw } from 'lucide-react';

export default function Navbar({ onRefresh, isRefreshing }) {
  const { user, logout, quickSwitchUser } = useAuth();

  const demoAccounts = [
    { label: 'Admin Evaluator', email: 'admin@emailmgmt.local', password: 'Admin@1234' },
    { label: 'John Doe', email: 'john.doe@emailmgmt.local', password: 'User@1234' },
    { label: 'Alice Smith', email: 'alice.smith@emailmgmt.local', password: 'User@1234' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            PostgreSQL 3NF
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            ML Spam Filter Online
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Demo Persona Switcher */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="px-2 font-medium text-slate-500">Demo User:</span>
          {demoAccounts.map((acc) => {
            const isCurrent = user?.email === acc.email;
            return (
              <button
                key={acc.email}
                onClick={() => quickSwitchUser(acc.email, acc.password)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  isCurrent
                    ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {acc.label}
              </button>
            );
          })}
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        )}

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-800 leading-tight">{user?.name || 'User'}</div>
            <div className="text-xs text-slate-500 leading-tight">{user?.email}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-sm border border-indigo-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
